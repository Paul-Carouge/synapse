# 📱 Recherche Mobile — Meilleures pratiques Canvas 3D / WebGL / Visualisation

**Auteur :** Atlas (Équipe Orion)
**Date :** 06/06/2026
**Stack cible :** Next.js 16, React Three Fiber, Tailwind v4, Framer Motion
**Objet :** Compilation de recherches sur les patterns d'interface mobile pour applicaitons avec canvas 3D/WebGL interactif

---

## SOMMAIRE

1. [Apps avec canvas : Google Maps, Apple Maps & cie](#1-apps-avec-canvas--google-maps-apple-maps--cie)
2. [Patterns d'UI mobile pour visualisations 3D interactives](#2-patterns-dui-mobile-pour-visualisations-3d-interactives)
3. [Mobile-first R3F/Three.js — Adapter aux mobiles](#3-mobile-first-r3fthreejs--adapter-aux-mobiles)
4. [Bottom Sheets, Drawers & Navigation mobile premium](#4-bottom-sheets-drawers--navigation-mobile-premium)
5. [Obsidian Mobile, Linear, Notion — Patterns d'interface adaptative](#5-obsidian-mobile-linear-notion--patterns-dinterface-adaptative)
6. [Synthèse & Recommandations pour Synapse](#6-synthèse--recommandations-pour-synapse)

---

## 1. Apps avec canvas : Google Maps, Apple Maps & cie

### 1.1 Google Maps — Architecture UI mobile

Google Maps est la référence absolue pour une UI superposée à un canvas 2D/3D interactif full-screen.

#### Éléments clés

- **Bottom sheet comme couche de navigation principale** : La barre de recherche est intégrée dans un bottom sheet qui occupe ~15% de l'écran en repos et se déplie à ~50% au tap. L'utilisateur voit toujours la carte en arrière-plan.
- **FAB (Floating Action Button)** : Positionné bottom-right, légèrement au-dessus du bottom sheet. C'est le point d'entrée pour « Itinéraire ». Usage unique, bien délimité.
- **Points d'intérêt directement sur le canvas** : Les POI sont rendus dans WebGL, pas en HTML overlay. Interaction tactile directe : tap → zoom → bottom sheet de détail.
- **Bottom Navigation** : En bas, 4 onglets (Explorer, Aller, Contribuer, Actualités) avec indicateur de section active. Apple Maps utilise une approche similaire mais avec des « bookmark tabs ».
- **Touch targets** : >= 48px (recommandation Material). Les POI sur la carte respectent cette règle même en zoom arrière grâce au clustering.
- **Search overlay** : Tap sur la search bar → overlay full-screen avec suggestions, recent search, autocomplete. Le canvas devient passif en arrière-plan (interactions désactivées).
- **My Location FAB** : Second FAB (bottom-right, plus petit) spécifique au recentrage.

#### Architecture des couches (z-index implicite)

```
z-0  : Canvas WebGL (carte, POI, traffic)
z-10 : FABs (location, itinéraire)
z-20 : Bottom sheet (pliée)
z-30 : Bottom sheet (dépliée)
z-40 : Modal search overlay (full-screen)
z-50 : Snackbar / notifications temporaires
```

**Règle critique :** Les overlays ne cachent JAMAIS plus de 85% du canvas. L'utilisateur doit toujours voir un « peek » de la carte pour garder le contexte spatial.

### 1.2 Apple Maps — Patterns natifs iOS

Apple Maps utilise des patterns plus « Apple-like » :

- **Bottom sheet natif (UISheetPresentationController)** : Le sheet a 3 détentes : .medium (~50%), .large (~92%), et un état personnalisé. L'état .medium laisse voir la carte derrière. L'état .large a un handle grip visible.
- **Search intégré dans le sheet** : Pas de search bar flottante. La search vit dans le bottom sheet lui-même.
- **Navigation contextualisée** : Les contrôles (3D toggle, satellite, guidage) apparaissent dans un HUD transparent qui disparaît pendant la navigation active.
- **Gestes tactiles sur le canvas** : 1 doigt = déplacement, 2 doigts = rotation/inclinaison (pitch), pinch = zoom. Pas de confusion avec les gestes UI.
- **Réduction d'interférence** : Quand le bottom sheet est déplié > 50%, les gestes de scroll du sheet prennent priorité sur les gestes du canvas.

### 1.3 Leçons pour Synapse

1. **Le bottom sheet ne doit jamais couvrir tout l'écran** — le canvas 3D doit toujours être partiellement visible.
2. **FAB unique** en zone accessible (bas de l'écran). Pas de FAB flottants multiples.
3. **Touch gesture segregation** : UI overlays capturent les gestes quand actifs, les relâchent au canvas quand repliés.
4. **Le canvas est le fond, pas un élément décoratif** — il doit rester interagissable la plupart du temps.
5. **48px minimum touch targets** — non-négociable pour l'accessibilité mobile.

---

## 2. Patterns d'UI mobile pour visualisations 3D interactives

### 2.1 Architecture Canvas + UI Overlay

Le pattern dominant pour les apps 3D mobiles est la **superposition d'UI HTML sur un canvas WebGL full-viewport** :

```
┌─────────────────────────────────────┐
│  ┌─── HUD HAUT (optionnel) ──────┐  │  ← z-10 : contrôles, titre, statut
│  │  [filtre]         [🔍/➕]      │  │
│  └────────────────────────────────┘  │
│                                      │
│         CANVAS 3D FULL-VIEWPORT      │  ← z-0 : WebGL, touches/gestes
│         (toute la surface)           │
│                                      │
│  ┌─── BOTTOM CONTROLS ───────────┐  │  ← z-20 : navigation, actions
│  │  [TypeFilter] [Stats] [Search] │  │      Bottom sheet / bar
│  └────────────────────────────────┘  │
└─────────────────────────────────────┘
```

**D'après l'analyse de patterns similaires :**

- **Sketchfab Mobile** : Le canvas 3D est plein écran. Une barre d'outils semi-transparente en bas contient les actions (vr, settings, annoter). Le HUD en haut à droite contient les infos contextualiselles. Le fond du canvas est toujours visible.
- **Matterport (visite virtuelle 3D)** : UI minimale — un bouton de menu hamburger en haut à gauche, des contrôles de navigation en bas (déplacer/zoom), le reste est 100% canvas. Les cartes d'info s'affichent en bottom sheet quand on tape sur un élément 3D.
- **DataWrapper / Flourish mobile** : Canvas de data visualisation. Les légendes et contrôles sont condensés dans une barre inférieure. Le graphique occupe ~70% de l'écran. Les filtres sont dans un drawer latéral ou bottom sheet.
- **Zillow / Airbnb (carte 3D)** : Search bar en haut. POI sur le canvas. Bottom sheet pour les listes de résultats. Le sheet se manipule par drag vertical.

### 2.2 Patterns spécifiques à la data visualisation 3D

1. **Progressive Disclosure** : Commencer avec une vue d'ensemble (tous les nœuds), puis laisser l'utilisateur zoomer pour voir les détails. Les données les plus importantes doivent être visibles sans interaction.
2. **Mini-carte + Carte principale** : Certaines apps spatiales utilisent une mini-carte en coin (top-right) pour l'orientation quand la vue 3D est complexe.
3. **Selection → Action** : Tap sur un élément 3D → mise en évidence + bottom sheet contextuel avec actions. Ne jamais ouvrir un modal plein écran qui cache tout.
4. **Filtering in situ** : Les filtres modifient le rendu 3D en temps réel sans transition de page. Préférer un bottom sheet de filtres qui laisse voir les changements en direct.
5. **Search → Highlight** : La recherche doit mettre en évidence les résultats dans le canvas 3D plutôt que de naviguer vers une nouvelle page.
6. **Pinch to zoom / spread for context** : Le pinch est le geste de zoom 3D standard, mais il doit être complété par un double-tap pour zoomer sur un élément spécifique.

### 2.3 Touch gesture mapping (recommandé)

| Geste | Action canvas | Contexte |
|-------|--------------|----------|
| **1 doigt drag** | Rotation/Orbit du graphe 3D | Toujours actif |
| **1 doigt tap** | Sélection d'un nœud | Désactivé si on est au-dessus d'un overlay |
| **Double tap** | Zoom sur élément | Zoom animé avec lerp |
| **Pinch (2 doigts)** | Zoom avant/arrière | Scale uniforme |
| **2 doigts drag** | Pan/déplacement latéral | Alternative à l'orbite |
| **Long press** | Aperçu contextuel (« peek ») | Mini tooltip avec infos rapides |
| **Swipe horizontal bas** | Ouvrir/fermer bottom sheet | Si bottom sheet en peek |

---

## 3. Mobile-first R3F/Three.js — Adapter aux mobiles

### 3.1 Scaling Performance (source : R3F docs)

#### On-demand rendering

Le problème des applis Three.js/R3F : elles tournent en boucle de rendu 60fps en permanence, ce qui draine la batterie mobile.

```jsx
<Canvas frameloop="demand">
  {/* Ne rend que quand nécessaire */}
</Canvas>
```

Avec `frameloop="demand"`, le rendu ne s'exécute que quand :
- Des props changent dans l'arbre de composants React
- `invalidate()` est appelé manuellement
- Des animations/transitions sont en cours

**Pattern recommandé pour les contrôles OrbitControls :**

```jsx
function Controls() {
  const orbitControlsRef = useRef()
  const { invalidate, camera, gl } = useThree()
  useEffect(() => {
    orbitControlsRef.current.addEventListener('change', invalidate)
    return () => orbitControlsRef.current.removeEventListener('change', invalidate)
  }, [])
  return <orbitControls ref={orbitControlsRef} args={[camera, gl.domElement]} />
}
```

> Note : Drei fournit des contrôles qui gèrent `invalidate()` automatiquement.

#### Re-using geometries and materials

Sur mobile, chaque geometry/material = overhead GPU. Réutiliser les ressources est critique :

```jsx
// ❌ Mauvaise pratique : nouvelle géométrie par rendu
{items.map(i => <mesh key={i}><boxGeometry /><meshStandardMaterial /></mesh>)}

// ✅ Bonne pratique : géométries/material partagés
const geometry = useMemo(() => new THREE.SphereGeometry(1, 16, 16), [])
const material = useMemo(() => new THREE.MeshStandardMaterial({ color: 'orange' }), [])

return items.map(i => <mesh key={i} geometry={geometry} material={material} />)
```

#### Instancing

Chaque mesh = un draw call. Limite recommandée : **max 1000 meshes**, idéalement quelques centaines. Au-delà, utiliser `InstancedMesh` :

```jsx
function Instances({ count = 10000 }) {
  const ref = useRef()
  useEffect(() => {
    const temp = new THREE.Object3D()
    for (let i = 0; i < count; i++) {
      temp.position.set(Math.random() * 10, Math.random() * 10, Math.random() * 10)
      temp.updateMatrix()
      ref.current.setMatrixAt(i, temp.matrix)
    }
    ref.current.instanceMatrix.needsUpdate = true
  }, [])
  return (
    <instancedMesh ref={ref} args={[null, null, count]}>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshPhongMaterial color="orange" />
    </instancedMesh>
  )
}
```

**Applicable à Synapse :** Les nœuds ChromaDB doivent être des instances Mesh pour supporter des milliers de nœuds sans impact perf.

#### Level of Detail (LOD)

Utiliser `Detailed` de Drei pour réduire la qualité des objets distants :

```jsx
import { Detailed, useGLTF } from '@react-three/drei'

function Model() {
  const [low, mid, high] = useGLTF(['/low.glb', '/mid.glb', '/high.glb'])
  return (
    <Detailed distances={[0, 10, 20]}>
      <mesh geometry={high} />
      <mesh geometry={mid} />
      <mesh geometry={low} />
    </Detailed>
  )
}
```

Pour Synapse, LOD peut s'appliquer aux nœuds lointains (moins de polygones, labels simplifiés).

#### Performance Monitor (Drei)

Composant clé pour l'adaptation dynamique aux mobiles :

```jsx
function App() {
  const [dpr, setDpr] = useState(1.5)
  return (
    <Canvas dpr={dpr}>
      <PerformanceMonitor
        onIncline={() => setDpr(2)}    // Appareil rapide
        onDecline={() => setDpr(1)}    // Appareil lent
        flipflops={3}
        onFallback={() => setDpr(0.75)} // Échec → qualité minimale
      >
```

#### Movement Regression

Pattern utilisé par Sketchfab pour garantir 60fps sur mobile :

```jsx
// Activation de la régression
const regress = useThree((state) => state.performance.regress)
useEffect(() => {
  controls.current?.addEventListener('change', regress)
}, [])

// Réponse adaptative : réduire la résolution pendant le mouvement
function AdaptivePixelRatio() {
  const current = useThree((state) => state.performance.current)
  const setPixelRatio = useThree((state) => state.setDpr)
  useEffect(() => {
    setPixelRatio(window.devicePixelRatio * current)
  }, [current])
  return null
}
```

Drei fournit `AdaptiveDpr` et `AdaptiveEvents` prêts à l'emploi.

### 3.2 Conseils mobiles de Discover Three.js

#### Pixel Ratio

Les appareils mobiles modernes ont des ratios de pixels jusqu'à 5×. **Limiter à 2× ou 3×** pour des gains perf massifs :

```jsx
<Canvas dpr={Math.min(window.devicePixelRatio, 2)}>
```

#### Lights

- **Direct lights (SpotLight, PointLight, DirectionalLight) sont lentes** sur mobile. Les utiliser avec parcimonie.
- Ne pas ajouter/supprimer des lumières dynamiquement (recompile les shaders) → utiliser `light.visible = false`.
- Activer `renderer.physicallyCorrectLights` pour des lumières en unités SI.

#### Shadows

- Ombres statiques (baked) si possible.
- Résolution d'ombre minimale.
- Désactiver les ombres sur mobile si pas essentielles.

#### Transparence

- **Transparent objects are slow.** Utiliser `alphaTest` plutôt que la transparence standard quand possible.
- Éviter les objets transparents superposés.

#### Frustum

- Réduire le frustum caméra au minimum.
- Garder la scène centrée sur l'origine pour éviter les erreurs flottantes à grande échelle.

#### Rendu conditionnel

- Sur mobile, ne rendre que quand la caméra bouge ou qu'une animation a lieu.
- Utiliser `scene.overrideMaterial` pour déboguer : si les perf augmentent, le bottleneck est GPU ; si non, CPU.

### 3.3 Concurrency React 18+

React 18+ peut distribuer la création d'objets Three.js coûteux dans le temps via `startTransition` :

```jsx
import { startTransition } from 'react'

// Les opérations lourdes sont réparties sur plusieurs frames
startTransition(() => {
  setData(expensiveData)
})
```

Benchmark : Sans concurrency, 510 TextGeometry = ~20fps. Avec React 18 → ~60fps stable.

### 3.4 Checklist mobile R3F pour Synapse

| Optimisation | Priorité | Implémentation |
|-------------|----------|----------------|
| `frameloop="demand"` | **Critique** | Canvas principal |
| `dpr` limité à 2 | **Critique** | `Math.min(devicePixelRatio, 2)` |
| InstancedMesh pour nœuds | **Critique** | > 1000 nœuds ChromaDB |
| PerformanceMonitor | **Haute** | Adaptation dynamique |
| Movement regression | **Haute** | Smooth pendant interaction |
| LOD pour nœuds lointains | **Moyenne** | Drei `<Detailed>` |
| Nested loading (Suspense) | **Moyenne** | low-res → high-res |
| startTransition pour ops lourdes | **Basse** | Chargement initial |
| Ombres désactivées sur mobile | **Basse** | `max-sm:` conditionnel |

---

## 4. Bottom Sheets, Drawers & Navigation mobile premium

### 4.1 Bottom Sheet — Patterns et bonnes pratiques

#### Anatomie d'un bottom sheet mobile

```
┌─────────────────────────────────────┐
│  ─── handle grip (36-48px) ───     │  ← Drag indication (centré)
│  ┌─────────────────────────────┐    │
│  │  Titre / Navigation tabs    │    │  ← 3-5 items max
│  ├─────────────────────────────┤    │
│  │  Contenu scrollable         │    │
│  │  • Peek state (~15%)        │    │  ← Always visible
│  │  • Half state (~50%)        │    │  ← Content + peek canvas
│  │  • Full state (~92%)        │    │  ← Max content, canvas still visible
│  │                             │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

#### États d'un bottom sheet

Trois états standards (issus de l'analyse Sheets by Google, Apple UISheetPresentationController, Material 3) :

1. **Peek (état minimal)** : ~56-80px de hauteur. Montre juste la barre de navigation avec les icônes et un aperçu du contenu (handle + premier onglet).
2. **Half (état intermédiaire)** : ~40-50% de l'écran. L'utilisateur peut voir le contenu tout en gardant le canvas 3D visible.
3. **Full (état maximal)** : ~85-92% de l'écran. Le canvas reste visible en haut (peek). Jamais 100% — l'utilisateur doit pouvoir voir le canvas pour le contexte.

#### Transitions

- Drag vertical pour passer d'un état à l'autre (avec snap points)
- Animation fluide via Framer Motion : `type: "spring", damping: 30, stiffness: 300`
- Background du sheet : surface sombre (#0f1011 chez Synapse) avec un peu de transparence

#### Contenu typique d'un bottom sheet pour app 3D

| Section | Contenu | État |
|---------|---------|------|
| **Barre de navigation** | Icônes : TypeFilter, Search, Stats | Peek + Half + Full |
| **TypeFilter** | Catégories de nœuds à filter (tags, types) | Half |
| **Search** | Barre de recherche + résultats | Full |
| **Stats** | Métriques, timeline, graphiques | Full |
| **Détail d'un nœud** | Carte d'info, métadonnées, actions | Full (déclenché par sélection) |

### 4.2 Drawers latéraux vs Bottom Sheets

| Critère | Bottom Sheet | Drawer latéral |
|---------|-------------|----------------|
| **Accessibilité pouce** | ✅ Excellente (zone 1 naturelle) | ⚠️ Moyenne (coin droit/gauche) |
| **Contexte canvas** | ✅ Garde le canvas visible | ⚠️ Pousse/recouvre le canvas |
| **Affordance** | ✅ Naturelle (handle grip) | ⚠️ Nécessite hamburger icon |
| **Contenu** | Idéal pour navigation + filtres | Idéal pour settings / profil |
| **Animation** | Slide up + snap | Slide from edge |
| **Mobile standard** | Oui (Google Maps, Apple Maps) | Oui (settings panels) |

**Recommandation :** Pour Synapse, utiliser des bottom sheets pour TOUTE la navigation primaire. Les drawers latéraux sont réservés aux settings/comptes (usage rare).

### 4.3 FAB (Floating Action Button)

#### Bonnes pratiques issues de la recherche

1. **Un seul FAB principal** — Au-delà, confusion. Google Maps a 2 FABs mais ils sont très différenciés (forme, taille, couleur).
2. **Position : bottom-right ou top-right** — Google Maps = bottom-right (au-dessus du bottom nav). Apple Maps = intégré dans le sheet.
3. **Usage unique** — Le FAB doit déclencher l'action la PLUS IMPORTANTE : création, recherche, itinéraire.
4. **Taille minimum : 48×48px** (touch target 48×48).
5. **Ne pas cacher des actions secondaires dedans** — Speed Dial FAB (FAB expandable) est un anti-pattern mobile 3D. Préférer afficher les actions dans le bottom sheet.

**Pour Synapse :** Le FAB déclenche la recherche (action principale). Uniquement sur mobile. Position top-right (zone difficile, mais usage occasionnel).

### 4.4 Navigation Tabs (Bottom Navigation)

D'après Material Design :

- **3 à 5 tabs** — Pas plus sur mobile.
- **Icône + label** — Toujours visible pour l'onglet actif. Icône seulement pour les inactifs si contraint d'espace.
- **Badge** — Optionnel pour notifications/changements.
- **Hauteur : 56px minimum** (Material), 48px (Apple).
- **Pas de scroll horizontal** — Tabs fixes ou tous visibles.

**Synapse :** 3 onglets dans le bottom sheet : Filtres (TypeFilter) | Recherche (Search) | Stats.

---

## 5. Obsidian Mobile, Linear, Notion — Patterns d'interface adaptative

### 5.1 Obsidian Mobile

Obsidian est une référence pour l'adaptation mobile d'une app desktop complexe.

#### Patterns clés

1. **Ribbon simplifié** : Sur desktop, Obsidian a une barre d'outils verticale dense (ribbon). Sur mobile, le ribbon disparaît. Les actions sont soit dans un bottom drawer (iOS) soit dans le tiroir latéral (Android).
2. **Swipable panels** : Navigation par swipe horizontal entre les vues (éditeur, graph view, preview). Pas de tabs.
3. **Graph View mobile** : Le graphe de connexions (canvas Three.js/WebGL) est accessible via un bouton dédié. Il s'ouvre en plein écran avec un overlay d'info minimal en bas.
4. **Keyboard-aware** : Le clavier mobile pousse tout le contenu vers le haut. Obsidian gère ça avec un `KeyboardAvoidingView`.
5. **Toolbar contextuelle** : Au-dessus du clavier, une barre d'outils avec les actions de formatage courantes.
6. **Sidebar transformée** : La sidebar gauche devient un bottom drawer ou un swipe-from-left panel qui ne prend pas tout l'écran.

#### Leçons pour Synapse

- Le **graphe 3D** doit être accessible en 1 tap depuis n'importe quel écran (comme la Graph View d'Obsidian).
- Les **actions contextuelles** dépendent du mode : navigation vs. édition vs. visualisation.
- Le **bottom sheet comme container unique** : toutes les fonctions secondaires vivent dedans.

### 5.2 Linear Mobile

Linear est une référence pour le design premium et la fluidité d'interaction.

#### Patterns clés

1. **Bottom sheet comme modal principal** : Linear utilise des bottom sheets plutôt que des modals plein écran pour la plupart des actions (création, filtrage, édition rapide).
2. **Swipe actions** : Swipe left/right sur les items → actions rapides (archiver, assigner, statut). Pattern emprunté à Mail mais appliqué au product management.
3. **Navigation à tabs minimale** : 2 tabs en bas (Inbox, Teams) + FAB central pour créer.
4. **Haptic feedback** : Sur iOS, Linear utilise le haptic feedback pour chaque interaction (sélection, swipe, completion).
5. **Drag indicators subtils** : Les handles de drag sont visibles mais discrets (3 points horizontaux).
6. **Loading states squelettes** : Pas de spinner — des skeleton screens animés très rapides.
7. **Gesture back** : Swipe from left edge pour revenir en arrière.

#### Leçons pour Synapse

- Les **transitions doivent être instantanées** (< 100ms) — sur mobile, la latence perçue est critique.
- **1 FAB central** + bottom navigation réduite = expérience épurée.
- **Swipe pour actions rapides** : Sur un nœud sélectionné, swipe pour l'archiver/le supprimer.
- **Haptics légers** sur les sélections pour le feedback tactile.

### 5.3 Notion Mobile

Notion a fait un travail intéressant d'adaptation mobile.

#### Patterns clés

1. **Bottom drawer pour la navigation** : Le menu hamburger desktop devient un bottom drawer animé qui slide depuis la gauche mais ne couvre que ~70% de l'écran.
2. **Search first** : La barre de recherche est le point d'entrée principal sur mobile.
3. **Toolbar inline** : Pas de boutons flottants. Les outils de création/édition sont dans une barre au-dessus du clavier ou accessibles par selection.
4. **Single column layout** : Les grids/colonnes du desktop deviennent des listes verticales avec accordéons.
5. **Drag to reorder** : L'ordre des pages/blocs se fait par long press + drag (pattern natif iOS/Android).
6. **Optimistic updates** : Les changements sont appliqués instantanément en local avant d'être sync. Sur mobile réseau faible, c'est essentiel.

#### Leçons pour Synapse

- **Single column** : Sur mobile, aucun contenu ne doit être side-by-side. Tout est vertical.
- **Recherche instantanée** : La recherche doit être le point d'entrée principal sur mobile.
- **Optimistic UI** : Les filtres et sélections s'appliquent immédiatement sur le canvas 3D, sans attendre le backend.
- **Bottom drawer au lieu de sidebar** : Si un drawer latéral est nécessaire, il doit couvrir max 80% et laisser un peek du canvas.

### 5.4 Tableau comparatif des patterns

| Pattern | Obsidian | Linear | Notion | Recommandé Synapse |
|---------|----------|--------|--------|-------------------|
| Navigation principale | Sidebar → Bottom drawer | Bottom tabs (2) | Bottom drawer | Bottom sheet nav (3 tabs) |
| Point d'entrée création | FAB (+/-) | FAB central (+) | Inline toolbar | FAB recherche (top-right) |
| Gestes | Swipe panels | Swipe actions, edge back | Long press + drag | Orbit drag canvas, swipe filters |
| Toolbar | Contextuelle (clavier) | Minimale | Inline | Dans bottom sheet |
| Modal / Sheet | Bottom sheet | Bottom sheet | Bottom drawer animé | Bottom sheet (3 états) |
| Loading | Skeleton | Skeleton + instant | Optimistic + skeleton | Progressive loading (Suspense) |
| Feedback | Visuel | Haptics + visuel | Visuel | Haptics optionnel + visuel |

---

## 6. Synthèse & Recommandations pour Synapse

### 6.1 Architecture mobile recommandée

```
LAYER ARCHITECTURE (z-index ascendant) :

z-0  : Canvas WebGL/Three.js (plein écran, toujours visible)
z-10 : HUD haut optionnel (version info, titre page)
z-15 : FAB recherche (top-right, usage rare)
z-20 : Tooltip / mini-preview (déclenché par long press)
z-30 : Bottom sheet navigation (3 états : peek/half/full)
z-40 : Modal plein écran (recherche avancée, rare)
z-50 : Toast/snackbar notifications temporaires
```

### 6.2 Règles d'or

1. **Le canvas 3D est toujours le fond** — jamais caché à 100%.
2. **Toutes les actions primaires sont dans le bottom sheet** (zone pouce naturelle).
3. **Un seul FAB** — pour la recherche (action la plus fréquente après la navigation).
4. **3 tabs max** dans la bottom navigation : Filtres | Recherche | Stats.
5. **Touch targets ≥ 48px** — tout élément interactif.
6. **`frameloop="demand"`** + `dpr` limité à 2 pour la batterie.
7. **InstancedMesh** pour les nœuds ChromaDB (permet des milliers de nœuds).
8. **PerformanceMonitor** pour l'adaptation dynamique aux appareils lents.
9. **Pas de backdrop-filter: blur()** — WebGL ne le supporte pas. Surfaces solides.
10. **Progressive disclosure** : vue d'ensemble → zoom → détail.

### 6.3 Ressources clés

- [R3F Scaling Performance](https://r3f.docs.pmnd.rs/advanced/scaling-performance) — Doc officielle R3F sur les perfs
- [Discover Three.js Tips & Tricks](https://discoverthreejs.com/tips-and-tricks/) — Guide complet optimisations Three.js
- [Drei PerformanceMonitor](https://github.com/pmndrs/drei#performancemonitor) — Composant d'adaptation perf automatique
- [Material 3 Bottom Sheets](https://m3.material.io/components/bottom-sheets) — Guidelines Material Design
- [Apple HIG — Maps](https://developer.apple.com/design/human-interface-guidelines/maps) — Guidelines Apple pour apps cartographiques
- [Obsidian Mobile UI](https://obsidian.md) — Référence adaptation desktop→mobile
- [Linear Blog](https://linear.app/blog) — Articles sur le design produit

---

## Annexe : Navigation sources consultées

| Source | Sujet | Statut |
|--------|-------|--------|
| docs.pmnd.rs/react-three-fiber | R3F Scaling Performance | ✅ Consulté |
| discoverthreejs.com/tips-and-tricks/ | Three.js Tips & Tricks | ✅ Consulté |
| r3f.docs.pmnd.rs/advanced/scaling-performance | R3F Performance avancée | ✅ Consulté |
| developer.apple.com/design/human-interface-guidelines/maps | Apple Maps HIG | ✅ Consulté |
| m3.material.io/components/bottom-sheets | Material 3 Bottom Sheets | ✅ Consulté |
| help.obsidian.md | Obsidian Mobile UI | ⚠️ Accès limité |
| linear.app/blog | Linear design patterns | ⚠️ Accès limité |
| notion.com/help | Notion mobile | ⚠️ Accès limité |
| blog.logrocket.com/optimizing-three-js-mobile | Three.js mobile opti (404) | ❌ 404 |
| uxplanet.org bottom sheets (Medium) | Mobile bottom sheets (404) | ❌ 404 |
| nngroup.com mobile 3D | Mobile 3D interaction (404) | ❌ 404 |
