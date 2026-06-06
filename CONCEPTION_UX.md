# 🧠 Synapse — Refonte UX/UI Complète

> **Designer :** Apex (équipe Orion)
> **Date :** 2026-06-06
> **Stack :** Next.js 16, React Three Fiber, Tailwind v4, Framer Motion
> **Palette :** Zinc/Ambre (#070708 fond → #f59e0b accent)
> **Contrainte clé :** Pas de `backdrop-filter: blur()` — WebGL ne le supporte pas. Surfaces SOLIDES obligatoires.

---

## 1. Vision

> **Synapse est un télescope mental : l'utilisateur plonge dans son espace de mémoire, observe les connexions entre ses idées, et retrouve instantanément ce qu'il cherche, porté par une expérience qui transforme la consultation en exploration.**

Pas un « visualiseur de base de données » — un **observatoire personnel**. Chaque visite doit raconter une histoire : d'abord la vue d'ensemble cosmique, puis le zoom sur un cluster, enfin le détail d'une mémoire.

---

## 2. Structure de l'écran — « L'Observatoire »

L'écran est divisé en **5 zones fonctionnelles**, superposées au canvas 3D plein écran :

```
┌──────────────────────────────────────────────────────┐
│ ┌────────────────────────────────────────────────┐  │
│ │                CANVAS 3D (fond)                │  │
│ │   ∞ espace de nœuds flottants en full viewport │  │
│ │                                                │  │
│ └────────────────────────────────────────────────┘  │
│                                                      │
│ ┌────────── ZONE HAUTE (z-10) ────────────────────┐ │
│ │  ┌──────┐  ┌──────────────────┐  ┌──────────┐  │ │
│ │  │TYPE  │  │  SEARCH BAR      │  │ STATUT   │  │ │
│ │  │FILTER│  │  (centered)      │  │ badge    │  │ │
│ │  └──────┘  └──────────────────┘  └──────────┘  │ │
│ └────────────────────────────────────────────────┘ │
│                                                      │
│ ┌────────── SURVOL ───────────────┐                 │
│ │  Tooltip flottant (z-20)        │                 │
│ │  apparaît près du nœud survolé  │                 │
│ └──────────────────────────────────┘                 │
│                                                      │
│                    ┌─── PANEL DÉTAIL (z-30) ────────┐│
│                    │  Slide depuis la droite         ││
│                    │  max-w-md (448px)               ││
│                    │  Fond solide #0f1011            ││
│                    │  Bordure gauche #23252a         ││
│                    └─────────────────────────────────┘│
│                                                      │
│ ┌────────── ZONE BASSE (z-10) ────────────────────┐ │
│ │  ┌──────────┐           ┌──────────────┐       │ │
│ │  │ LÉGENDE  │           │ STATS BAR    │       │ │
│ │  │ couleurs │           │ N/arêtes/tps │       │ │
│ │  └──────────┘           └──────────────┘       │ │
│ └────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

### 2.1 Positions précises (coordonnées viewport)

| Élément | Position | Taille | Z-index |
|---------|----------|--------|---------|
| Canvas 3D | `fixed inset-0` | 100vw × 100vh | 0 |
| Type Filter pills | `fixed top-6 left-6` | auto | 10 |
| Search bar | `fixed top-6 left-1/2 -translate-x-1/2` | w-[420px] | 10 |
| Stats badge | `fixed top-6 right-6` | auto | 10 |
| Tooltip survol | flottant près du curseur (coords dynamiques) | max-w-[260px] | 20 |
| Detail panel | `fixed right-0 top-0 bottom-0` | max-w-md (448px) | 30 |
| Overlay (quand panel ouvert) | `fixed inset-0 bg-black/50` | 100% | 25 |
| Légende couleurs | `fixed bottom-6 left-6` | auto | 10 |
| Stats bar | `fixed bottom-6 right-6` | auto | 10 |

---

## 3. États utilisateur — « Les 4 Phases de l'Explorateur »

### 3.1 État 1 : ARRIVÉE (Empty state) — « Le Premier Regard »

L'utilisateur arrive sur Synapse pour la première fois, ou sans données.

**Ce qu'il voit :**
- Canvas 3D avec un fond profond `#070708` (zinc-950)
- Une animation d'entrée : 3-5 nœuds « seed » apparaissent en séquence avec un léger scale-up + fade-in
- Un message central discret : `"Votre espace mémoire vous attend"`
- La search bar en haut avec placeholder : `"Commencez par explorer…"`
- Les contrôles en bas (légende + stats) visibles mais grisés

**Comportement :**
- `OrbitControls` actif — l'utilisateur peut tourner autour des nœuds seed
- Un « ghost pulse » ambré `#f59e0b` au centre, qui respire doucement (opacity 0.3 → 0.6)
- La search bar est le point focal : bouton plus large, bordure `#23252a` avec hover `#f59e0b/20`

**Composants :**
```tsx
// Message d'accueil central (disparaît après 4s ou au premier clic)
<motion.div
  initial={{ opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -12 }}
  className="fixed inset-0 z-5 flex items-center justify-center pointer-events-none"
>
  <div className="text-center">
    <p className="text-sm text-[#62666d] tracking-[0.02em]">
      Votre espace mémoire vous attend
    </p>
    <div className="mt-4 mx-auto w-16 h-[1px] bg-gradient-to-r from-transparent via-[#f59e0b]/30 to-transparent" />
  </div>
</motion.div>
```

### 3.2 État 2 : NAVIGATION — « L'Exploration »

L'utilisateur a chargé des données (état normal).

**Ce qu'il voit :**
- Des dizaines de nœuds flottant dans l'espace, groupés par type (clusters)
- Les arêtes fines `#23252a` opacité 0.3 qui connectent les nœuds proches
- La search bar active avec placeholder `"Explorer la mémoire…"`
- Les filtres de type en haut à gauche avec compteurs
- La légende en bas à gauche montrant les types avec leurs couleurs
- Les stats en bas à droite : `"142 nœuds · 389 arêtes · à jour il y a 2min"`

**Comportement :**
- `OrbitControls` avec `autoRotate` à vitesse très lente (`0.15 rad/s`) — donne vie à l'espace
- Le survol d'un nœud déclenche : agrandissement + label 3D + tooltip en bas
- La caméra ne s'arrête jamais complètement — léger drift cosmique permanent
- Scroll (molette) = zoom in/out
- Clic sur nœud = sélection + ouverture du panel détail

### 3.3 État 3 : SÉLECTION/SURVOL — « L'Observation »

L'utilisateur survole ou clique sur un nœud.

**Survol (hover) :**
- Le nœud grossit de ×1.0 → ×1.6 avec easing `cubic-bezier(0.22, 1, 0.36, 1)` sur 200ms
- Un halo ambré `#f59e0b` apparaît autour du nœud (opacité 0 → 0.25, glow)
- Un label 3D apparaît au-dessus avec le type du nœud
- Un tooltip apparaît en bas de l'écran (ou flottant près du curseur) avec le texte tronqué
- Les arêtes connectées à ce nœud passent de `opacity: 0.3` à `opacity: 0.6`, couleur `#f59e0b`
- Les autres nœuds s'assombrissent légèrement (`opacity: 1 → 0.3`)

**Clic (sélection) :**
- La caméra effectue un doux mouvement `flyTo` vers le nœud (500ms, easing cosmique)
- Le nœud devient « Star » : taille ×2.2, glow ambré intense
- Un pulse lumineux part du nœud et se propage aux arêtes connectées (effet « data wave »)
- Le panel de détails slide depuis la droite (animation spring, 350ms)
- Tous les autres nœuds passent en mode « dimmed » (opacité 0.2)
- L'arrière-plan du canvas s'assombrit légèrement (overlay subtil)

### 3.4 État 4 : RECHERCHE — « La Sonde »

L'utilisateur ouvre ⌘K ou clique sur la search bar.

**Ce qu'il voit :**
- Un overlay sombre semi-transparent (`bg-black/50`) couvre tout l'écran
- La search bar s'agrandit et devient un champ de saisie centré
- Les résultats apparaissent en cascade avec stagger animation (25ms de délai entre chaque)
- Chaque résultat montre : icône de type + type + projet + extrait de texte
- Les nœuds correspondant à la recherche brillent dans le canvas 3D (visibles en arrière-plan)

**Comportement :**
- Le fond 3D est toujours visible (atténué) — l'utilisateur voit les nœuds correspondants briller
- Flèches haut/bas pour naviguer dans les résultats
- Enter pour sélectionner, Escape pour fermer
- La recherche est instantanée (filtre côté client)

---

## 4. Système de navigation — « Les 3 Axes d'Exploration »

### 4.1 Navigation par TYPE (Cluster)

Des **pills filtrantes** en haut à gauche permettent de filtrer par type de mémoire :

```tsx
// Composant TypeFilter
<div className="fixed top-6 left-6 z-10 flex gap-2">
  {types.map((t) => (
    <button
      key={t.id}
      onClick={() => setActiveType(t.id)}
      className={`
        inline-flex items-center gap-1.5
        px-3 py-1.5 rounded-full
        text-[11px] font-medium uppercase tracking-[0.06em]
        transition-all duration-200 ease-out
        ${
          activeType === t.id
            ? 'bg-[#f59e0b] text-[#070708] shadow-[0_0_12px_rgba(245,158,11,0.3)]'
            : 'bg-[#0f1011] text-[#8a8f98] border border-[#23252a] hover:border-[#f59e0b]/30 hover:text-[#f7f8f8]'
        }
      `}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: t.color }}
      />
      {t.label}
      <span className="text-[10px] opacity-60">{t.count}</span>
    </button>
  ))}
</div>
```

**Types disponibles** (couleurs du design system existant) :
- `architecture` → ambre `#F59E0B`
- `bug` → rouge `#EF4444`
- `decision` → bleu `#3B82F6`
- `learning` → vert `#22C55E`
- `preference` → violet `#A855F7`
- `system` → cyan `#06B6D4`
- `note` → gris `#71717A`
- `design` → orange `#f54e00`

**Filtrage :** Quand un type est actif, seuls les nœuds de ce type restent visibles dans le canvas 3D. Les autres fondent en opacité 0.05 et les arêtes non-connectées disparaissent. La caméra se recentre doucement sur le cluster actif.

### 4.2 Navigation par PROJET (Filtre secondaire)

Accessible depuis la search bar ou un petit dropdown à côté des pills :

```tsx
// Dropdown projet (petit, discret)
<div className="relative">
  <button
    onClick={() => setProjectOpen(!projectOpen)}
    className="
      flex items-center gap-1.5
      px-2.5 py-1.5 rounded-lg
      bg-[#0f1011] border border-[#23252a]
      text-[11px] text-[#8a8f98]
      hover:border-[#f59e0b]/20 hover:text-[#f7f8f8]
      transition-all duration-150
    "
  >
    <svg className="w-3 h-3" ...><!-- folder icon --></svg>
    {activeProject || 'Tous les projets'}
    <svg className="w-3 h-3 ml-1" ...><!-- chevron down --></svg>
  </button>
  {projectOpen && (
    <div className="absolute top-full mt-1 left-0 w-44 bg-[#0f1011] border border-[#23252a] rounded-xl py-1 shadow-xl z-20">
      {projects.map((p) => (
        <button key={p} onClick={() => selectProject(p)}
          className="w-full text-left px-3 py-2 text-xs text-[#a1a1aa] hover:bg-[#161718] hover:text-[#f7f8f8] transition-colors"
        >
          {p}
        </button>
      ))}
    </div>
  )}
</div>
```

### 4.3 Navigation par DATE (Timeline)

Un slider temporel subtil dans la zone basse-gauche, au-dessus de la légende :

```tsx
// Timeline slider (optionnel, compact)
<div className="fixed bottom-14 left-6 z-10">
  <div className="bg-[#0f1011] border border-[#23252a] rounded-xl px-3 py-2">
    <div className="flex items-center gap-3">
      <span className="text-[10px] text-[#62666d] font-mono">3j</span>
      <input
        type="range"
        min={0}
        max={100}
        value={timelineValue}
        onChange={handleTimeline}
        className="w-24 h-1 appearance-none bg-[#23252a] rounded-full
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-3
          [&::-webkit-slider-thumb]:h-3
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-[#f59e0b]
          [&::-webkit-slider-thumb]:shadow-[0_0_6px_rgba(245,158,11,0.4)]
          cursor-pointer"
      />
      <span className="text-[10px] text-[#62666d] font-mono">30j</span>
    </div>
  </div>
</div>
```

### 4.4 Navigation spatiale (caméra 3D)

L'utilisateur peut naviguer dans l'espace 3D avec :

| Action | Résultat | Détails |
|--------|----------|---------|
| **Clic + drag** | Rotation de la scène | `OrbitControls` avec damping factor 0.05 |
| **Molette** | Zoom avant/arrière | minDistance: 5, maxDistance: 25 |
| **Clic droit + drag** | Pan (déplacement latéral) | `enablePan: true` (actuellement désactivé — À ACTIVER) |
| **Double-clic sur nœud** | Fly-to + sélection | Animation caméra 600ms |
| **Double-clic sur espace vide** | Réinitialisation vue | Retour à la position par défaut |

**Nouveau :** Quand aucun nœud n'est sélectionné, un `autoRotate` lent (0.15 rad/s) donne l'impression que l'univers respire.

---

## 5. Interactions clés — Feedback pour chaque geste

### 5.1 Survol d'un nœud (`onPointerOver`)

```
Déclencheur : curseur entre dans le hitbox du nœud (sphereGeometry radius ×2)
Délai : 150ms (anti-flicker)

Feedback visuel :
  • Scale nœud : 1.0 → 1.6 (200ms, ease-out)
  • Halo ambré : opacity 0→0.25 + glow #f59e0b (200ms)
  • Label 3D : apparaît au-dessus du nœud (type + début texte)
  • Arêtes connectées : opacity 0.3→0.6, couleur #f59e0b (250ms)
  • Autres nœuds : opacity 1→0.3 (200ms)
  • Tooltip bas : slide-up + fade-in (150ms, delay 100ms)

Son (optionnel) : micro-pop synthétique très doux
```

### 5.2 Clic sur un nœud (`onClick`)

```
Déclencheur : clic gauche sur nœud (toggling)

Feedback visuel (sélection) :
  • T0 : Nœud scale 1.6→2.2, glow max (100ms)
  • T0+100ms : Data wave — pulse lumineux se propage le long des arêtes (400ms)
  • T0+200ms : Caméra fly-to vers le nœud sélectionné (500ms, ease cosmique)
  • T0+300ms : Overlay bg-black/50 apparaît (fade 200ms)
  • T0+350ms : Panel slide depuis la droite (spring, stiffness: 280, damping: 26)
  • T0+500ms : Contenu du panel stagger-in (3 enfants, 60ms délai chacun)

Feedback visuel (désélection) :
  • Panel slide-out vers la droite (250ms)
  • Nœud retourne à taille normale
  • Overlay disparaît (fade 150ms)
  • Caméra ne bouge pas — l'utilisateur reste où il est
```

### 5.3 ⌘K (ouverture recherche)

```
Déclencheur : ⌘K ou Ctrl+K

Feedback :
  • T0 : Overlay bg-black/50 apparaît (fade 150ms)
  • T0+50ms : Search bar se transforme en champ de saisie (scale 1→1.05, 200ms)
  • T0+150ms : Input auto-focus (curseur clignotant)
  • À la frappe : résultants apparaissent en cascade (stagger 25ms)
  • Nœuds correspondants dans le canvas 3D : glow ambré + scale 1.2
  • Si pas de résultats : message "Aucun résultat" centré, texte #62666d

Fermeture (Escape) :
  • Résultats disparaissent (fade 100ms)
  • Overlay disparaît (fade 150ms)
  • Focus retourne au canvas 3D
```

### 5.4 Scroll (zoom 3D)

```
Déclencheur : molette souris / pinch trackpad

Feedback :
  • Caméra zoom avant/arrière (linéaire, damping 0.05)
  • Si zoom avant très proche (< 6 unités) : les nœuds deviennent plus détaillés
  • Si zoom arrière très loin (> 18 unités) : les nœuds se fondent en amas lumineux
  • Un léger scale des labels UI (non, les labels UI ne bougent pas)
```

### 5.5 Drag (rotation caméra)

```
Déclencheur : clic gauche + drag sur espace vide

Feedback :
  • Rotation fluide avec damping (0.05)
  • Si autoRotate actif : la rotation manuelle prend le dessus, puis retour progressif
  • Le curseur change : `grab` → `grabbing`
```

### 5.6 Hover sur les résultats de recherche

```
Déclencheur : survol d'un résultat dans le panneau de recherche

Feedback :
  • Background du résultat : #0f1011 → #161718 (100ms)
  • Dans le canvas 3D : le nœud correspondant clignote doucement (glow pulse)
  • Si le nœud est hors champ : la caméra ne bouge PAS (contrairement à un clic)
```

---

## 6. Design des composants — Spécifications précises

### 6.1 Search Bar — « Le Radiotélescope »

**État fermé (bouton) :**
```tsx
<button
  onClick={() => setSearchOpen(true)}
  className="
    fixed top-6 left-1/2 -translate-x-1/2 z-10
    flex items-center gap-3
    w-[420px] h-11
    px-4 py-2.5
    bg-[#0f1011]
    border border-[#23252a] hover:border-[#f59e0b]/20
    rounded-xl
    shadow-[0_8px_32px_-12px_rgba(0,0,0,0.6)]
    text-sm
    text-[#8a8f98] hover:text-[#f7f8f8]
    transition-all duration-300 ease-out
    group
  "
>
  {/* Icône loupe — ambrée au hover */}
  <svg className="w-4 h-4 text-[#62666d] group-hover:text-[#f59e0b] transition-colors duration-200" ...>
    {/* path loupe */}
  </svg>

  <span className="tracking-[0.01em] flex-1 text-left">Explorer la mémoire…</span>

  {/* Badge ⌘K */}
  <kbd className="
    text-[10px] font-mono tracking-[0.04em]
    text-[#62666d]
    px-1.5 py-0.5
    rounded-md
    border border-[#23252a]
    bg-[#070708]/50
  ">
    ⌘K
  </kbd>
</button>
```

**État ouvert (champ de saisie) :**
```tsx
<motion.div
  initial={{ y: -8, opacity: 0, scale: 0.98 }}
  animate={{ y: 0, opacity: 1, scale: 1 }}
  exit={{ y: -8, opacity: 0, scale: 0.98 }}
  transition={{ type: 'spring', damping: 28, stiffness: 320 }}
  className="relative z-50 w-full max-w-lg mx-auto"
>
  <div className="
    bg-[#0f1011]
    border border-[#23252a] focus-within:border-[#f59e0b]/40
    rounded-2xl
    overflow-hidden
    shadow-[0_16px_48px_-12px_rgba(0,0,0,0.6)]
    transition-all duration-200
  ">
    {/* Header input */}
    <div className="flex items-center gap-3 px-5 py-4 border-b border-[#23252a]/50">
      <svg className="w-4 h-4 text-[#62666d]" ... />
      <input
        ref={inputRef}
        value={query}
        onChange={handleChange}
        placeholder="Rechercher dans la mémoire…"
        className="
          flex-1 bg-transparent
          text-sm text-[#f7f8f8]
          placeholder:text-[#52525b]
          outline-none
          tracking-[0.01em]
        "
      />
      {/* Bouton clear (visible seulement si query non vide) */}
      {query && (
        <button onClick={clearQuery}>
          <svg className="w-3.5 h-3.5 text-[#62666d] hover:text-[#f7f8f8]" ... />
        </button>
      )}
      <kbd className="text-[10px] font-mono text-[#52525b] px-1.5 py-0.5 rounded-md border border-[#23252a]">
        esc
      </kbd>
    </div>

    {/* Résultats */}
    <div className="max-h-80 overflow-y-auto p-2">
      {results.map((entry, i) => (
        <motion.button
          key={entry.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.025, duration: 0.2 }}
          onClick={...}
          className="
            w-full text-left p-3.5 rounded-xl
            hover:bg-[#161718]
            transition-colors duration-150
          "
        >
          {/* Row: dot + type + project + timestamp */}
          <div className="flex items-center gap-2.5 mb-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: getTypeColor(entry.metadata.type || 'note') }}
            />
            <span className="text-[10px] font-semibold text-[#8a8f98] uppercase tracking-[0.06em]">
              {entry.metadata.type || 'note'}
            </span>
            {entry.metadata.project && (
              <span className="text-[10px] text-[#62666d] px-2 py-0.5 rounded-md bg-[#23252a]">
                {entry.metadata.project}
              </span>
            )}
            <span className="ml-auto text-[10px] text-[#52525b]">
              {relativeTime(entry.metadata.timestamp || '')}
            </span>
          </div>
          {/* Texte tronqué */}
          <p className="text-sm text-[#a1a1aa] leading-relaxed line-clamp-2">
            {entry.text}
          </p>
        </motion.button>
      ))}

      {query && results.length === 0 && (
        <div className="px-6 py-10 text-center">
          <p className="text-sm text-[#52525b]">
            Aucun résultat pour « {query} »
          </p>
        </div>
      )}
    </div>
  </div>
</motion.div>
```

### 6.2 Detail Panel — « La Fiche Étoile »

**Conteneur :**
```tsx
<motion.aside
  initial={{ x: '100%' }}
  animate={{ x: 0 }}
  exit={{ x: '100%' }}
  transition={{ type: 'spring', damping: 26, stiffness: 280 }}
  className="
    fixed right-0 top-0 bottom-0 z-30
    w-full max-w-md
    bg-[#0f1011]
    border-l border-[#23252a]
    shadow-[-12px_0_48px_-16px_rgba(0,0,0,0.5)]
    overflow-y-auto
  "
>
```

**Structure interne (padding 24px partout) :**
```
┌─────────────────────────┐
│ ← Retour          [X]  │  ← Header (h-14, border-b border-[#23252a]/50)
│                         │
│ ● ARCHITECTURE  projet  │  ← Type badge + project tag
│                         │
│ Titre / ID              │  ← H3, text-h4, font-semi
│ mem_7x3k... · il y a 2h │  ← Métadonnées (font-mono, text-[#62666d])
│                         │
│ ─── ✦ ───              │  ← Divider (gradient subtle)
│                         │
│ Contenu de la mémoire   │  ← Body, text-sm leading-relaxed
│ sur plusieurs lignes…   │
│                         │
│ ─── ✦ ───              │
│                         │
│ Tags :                  │  ← Tags row
│ [concept] [cosmos]      │
│                         │
│ Connexions :            │  ← Related nodes (mini cards)
│ ○ Nœud lié 1           │
│ ○ Nœud lié 2           │
│                         │
│ ─── ✦ ───              │
│                         │
│ Métadonnées             │  ← Metadata block
│ Type     architecture   │
│ Projet   synapse-v2     │
│ Date     2026-06-06     │
│                         │
└─────────────────────────┘
```

**Composants internes :**

```tsx
// Header du panel
<div className="flex items-center justify-between h-14 px-6 border-b border-[#23252a]/50">
  <button
    onClick={onClose}
    className="flex items-center gap-1.5 text-xs text-[#8a8f98] hover:text-[#f7f8f8] transition-colors"
  >
    <svg className="w-3.5 h-3.5" ... /> {/* chevron-left */}
    Retour
  </button>
  <button onClick={onClose} className="text-[#62666d] hover:text-[#f7f8f8] transition-colors">
    <svg className="w-4 h-4" ... /> {/* X */}
  </button>
</div>

// Type badge
<div className="flex items-center gap-2.5 mb-3">
  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
  <span className="text-xs font-semibold uppercase tracking-[0.06em]" style={{ color }}>
    {type}
  </span>
  {project && (
    <span className="text-[10px] text-[#8a8f98] px-2 py-0.5 rounded-md bg-[#23252a]">
      {project}
    </span>
  )}
</div>

// Divider décoratif
<hr className="border-0 h-px bg-gradient-to-r from-[#f59e0b]/20 via-[#f59e0b]/5 to-transparent my-4" />

// Tags
<div className="flex flex-wrap gap-2">
  {(tags || []).map((tag) => (
    <span
      key={tag}
      className="
        inline-flex items-center px-2.5 py-1
        bg-[#161718] border border-[#23252a]
        text-[10px] text-[#8a8f98]
        rounded-full
        font-medium
      "
    >
      {tag}
    </span>
  ))}
</div>

// Mini carte connexion
<button className="
  w-full text-left p-3 rounded-xl
  bg-[#161718] border border-[#23252a]/50
  hover:border-[#f59e0b]/20 hover:bg-[#1a1a1e]
  transition-all duration-150
">
  <div className="flex items-center gap-2.5">
    <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
    <div>
      <p className="text-xs text-[#a1a1aa] line-clamp-1">Texte du nœud connecté</p>
      <p className="text-[10px] text-[#62666d] font-mono mt-0.5">id_abc123 · il y a 3h</p>
    </div>
  </div>
</button>

// Métadonnées
<div className="space-y-1.5 text-xs">
  <div className="flex justify-between py-1.5 border-b border-[#23252a]/30">
    <span className="text-[#8a8f98]">Type</span>
    <span className="text-[#a1a1aa] capitalize">{type}</span>
  </div>
  <div className="flex justify-between py-1.5 border-b border-[#23252a]/30">
    <span className="text-[#8a8f98]">Projet</span>
    <span className="text-[#a1a1aa]">{project || '—'}</span>
  </div>
  <div className="flex justify-between py-1.5">
    <span className="text-[#8a8f98]">Créé le</span>
    <span className="text-[#a1a1aa] font-mono text-[11px]">
      {new Date(timestamp).toLocaleDateString('fr-FR')}
    </span>
  </div>
</div>
```

### 6.3 Tooltip de survol — « L'Œil du Télescope »

**Position :** Centré en bas de l'écran (comme actuellement), OU flottant près du curseur.

**Version bas-centrée (recommandée pour éviter les interférences 3D) :**
```tsx
<AnimatePresence>
  {hoveredEntry && !selectedId && (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20"
    >
      <div
        className="
          bg-[#0f1011]
          border border-[#23252a]/60
          rounded-xl
          px-4 py-3
          max-w-sm
          shadow-[0_8px_32px_-12px_rgba(0,0,0,0.6)]
        "
      >
        {/* Header: type dot + label + project tag */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: typeColor }} />
          <span className="text-[10px] font-semibold text-[#8a8f98] uppercase tracking-[0.06em]">
            {hoveredEntry.metadata.type || 'note'}
          </span>
          {hoveredEntry.metadata.project && (
            <span className="text-[9px] text-[#62666d] px-2 py-0.5 rounded-md bg-[#23252a]">
              {hoveredEntry.metadata.project}
            </span>
          )}
        </div>

        {/* Body: texte tronqué à 2 lignes */}
        <p className="text-xs text-[#a1a1aa] leading-relaxed line-clamp-2">
          {hoveredEntry.text}
        </p>

        {/* Footer discret : ID + timestamp */}
        <p className="text-[9px] text-[#52525b] font-mono mt-1.5">
          {hoveredEntry.id.slice(0, 12)}… · {relativeTime(hoveredEntry.metadata.timestamp || '')}
        </p>
      </div>
    </motion.div>
  )}
</AnimatePresence>
```

### 6.4 TypeFilter — « Les Pills de Classification »

```tsx
// Barre de filtres complète
<div className="fixed top-6 left-6 z-10">
  <div className="flex items-center gap-2">
    {/* Bouton « Tous » (actif par défaut) */}
    <button
      onClick={() => setActiveType(null)}
      className={`
        px-3 py-1.5 rounded-full text-[11px] font-medium
        tracking-[0.04em] uppercase
        transition-all duration-200 ease-out
        ${
          activeType === null
            ? 'bg-[#f59e0b] text-[#070708] shadow-[0_0_12px_rgba(245,158,11,0.3)]'
            : 'bg-[#0f1011] text-[#8a8f98] border border-[#23252a] hover:border-[#52525b]'
        }
      `}
    >
      Tout
    </button>

    {/* Un bouton par type */}
    {types.map((t) => (
      <button
        key={t.id}
        onClick={() => setActiveType(t.id)}
        className={`
          inline-flex items-center gap-1.5
          px-3 py-1.5 rounded-full
          text-[11px] font-medium
          transition-all duration-200 ease-out
          ${
            activeType === t.id
              ? 'bg-[#f59e0b] text-[#070708] shadow-[0_0_12px_rgba(245,158,11,0.3)]'
              : 'bg-[#0f1011] text-[#8a8f98] border border-[#23252a] hover:border-[#f59e0b]/30 hover:text-[#f7f8f8]'
          }
        `}
      >
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: t.color }} />
        {t.label}
        <span className="text-[9px] opacity-50 ml-0.5">{t.count}</span>
      </button>
    ))}
  </div>
</div>
```

### 6.5 Stats Bar — « Le Tableau de Bord Spatial »

```tsx
// Coins inférieurs
<div className="fixed bottom-6 left-6 z-10">
  <div className="flex items-center gap-3">
    {/* Légende des types (compacte) */}
    <div className="bg-[#0f1011] border border-[#23252a]/60 rounded-xl px-3 py-2">
      <div className="flex items-center gap-2.5">
        {types.slice(0, 4).map((t) => (
          <div key={t.id} className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: t.color }} />
            <span className="text-[9px] text-[#62666d]">{t.label}</span>
          </div>
        ))}
        {types.length > 4 && (
          <span className="text-[9px] text-[#52525b]">+{types.length - 4}</span>
        )}
      </div>
    </div>

    {/* Selecteur projet */}
    <ProjectDropdown projects={projects} activeProject={activeProject} onSelect={setActiveProject} />
  </div>
</div>

<div className="fixed bottom-6 right-6 z-10">
  <div className="bg-[#0f1011] border border-[#23252a]/60 rounded-xl px-3.5 py-2">
    <div className="flex items-center gap-3 text-[10px]">
      <span className="text-[#8a8f98]">
        <strong className="text-[#a1a1aa] font-medium">{entries.length}</strong> nœuds
      </span>
      <span className="w-px h-3 bg-[#23252a]" />
      <span className="text-[#8a8f98]">
        <strong className="text-[#a1a1aa] font-medium">{edgeCount}</strong> arêtes
      </span>
      <span className="w-px h-3 bg-[#23252a]" />
      <span className="text-[#52525b] font-mono">{timeAgo}</span>
    </div>
  </div>
</div>
```

### 6.6 Loading State — « L'Initiation Stellaire »

```tsx
<div className="fixed inset-0 flex items-center justify-center bg-[#070708]">
  <div className="flex flex-col items-center gap-6">
    {/* Anneau orbital animé */}
    <div className="relative w-12 h-12">
      <div className="
        absolute inset-0
        border-2 border-[#23252a] border-t-[#f59e0b]
        rounded-full
        animate-spin
        duration-[1.2s]
      " />
      <div className="
        absolute inset-1
        border-2 border-transparent border-b-[#f59e0b]/30
        rounded-full
        animate-spin
        duration-[2s]
        reverse
      " />
    </div>

    {/* Texte avec animation de breathing */}
    <div className="text-center">
      <p className="text-sm text-[#62666d] tracking-[0.02em] animate-pulse">
        Connexion à l'espace mémoire…
      </p>
      <p className="text-[10px] text-[#52525b] mt-2 font-mono">
        Chargement des données ChromaDB
      </p>
    </div>
  </div>
</div>
```

### 6.7 Error/Empty State — « La Panne Cosmique »

```tsx
<div className="fixed inset-0 flex items-center justify-center bg-[#070708]">
  <div className="max-w-md text-center space-y-5 px-6">
    {/* Icône d'erreur */}
    <div className="w-12 h-12 mx-auto rounded-full bg-[#EF4444]/10 flex items-center justify-center">
      <svg className="w-5 h-5 text-[#EF4444]" ... />
    </div>

    <div className="space-y-2">
      <h2 className="text-base font-semibold text-[#f7f8f8]">
        Mémoire inaccessible
      </h2>
      <p className="text-sm text-[#8a8f98] leading-relaxed">
        {error || 'Aucune donnée mémoire disponible dans cet espace.'}
      </p>
    </div>

    {/* Bouton CTA — ambre */}
    <button
      onClick={() => window.location.reload()}
      className="
        inline-flex items-center gap-2
        px-5 py-2.5
        bg-[#f59e0b] text-[#070708]
        text-sm font-medium
        rounded-xl
        hover:bg-[#d97706]
        hover:shadow-[0_0_16px_rgba(245,158,11,0.3)]
        active:scale-[0.97]
        transition-all duration-150 ease-out
      "
    >
      <svg className="w-4 h-4" ... /> {/* Refresh icon */}
      Réessayer
    </button>

    {/* Indice secondaire */}
    <p className="text-[10px] text-[#52525b]">
      Vérifiez que le service ChromaDB est actif
    </p>
  </div>
</div>
```

---

## 7. Animations — « Le Mouvement Céleste »

### 7.1 Timing & Easing — Tokens globaux

Toutes les animations utilisent ces easing personnalisés (Framer Motion) :

```tsx
// Easing tokens (à utiliser dans les variants Framer Motion)
const easings = {
  cosmic: [0.34, 1.56, 0.64, 1],    // Entrées — rebond orbital
  stellar: [0.22, 1, 0.36, 1],       // Sorties — décélération
  float: [0.45, 0, 0.55, 1],         // Perpétuel — respiration
  fade: [0, 0, 0.2, 1],              // Fade in/out
} as const;

const durations = {
  instant: 0.05,   // 50ms  — hover scale
  fast: 0.15,      // 150ms — tooltips
  normal: 0.25,    // 250ms — transitions standard
  slow: 0.4,       // 400ms — panels, modals
  cosmic: 0.8,     // 800ms — hero, grandes transitions
} as const;
```

### 7.2 Animations d'entrée (page load)

| Élément | Animation | Durée | Delay |
|---------|-----------|-------|-------|
| Background particles | Rotation Y lente continue | — | 0 |
| Nœuds 3D | Apparition stagger (scale 0→1 + fade) | 400ms | 200ms + (i × 30ms) |
| Search bar | Slide down + fade | 400ms, ease cosmic | 300ms |
| Type filters | Slide left + fade | 300ms, ease stellar | 500ms + (i × 50ms) |
| Stats bar | Slide right + fade | 300ms, ease stellar | 600ms |
| Légende | Slide up + fade | 300ms, ease stellar | 700ms |

```tsx
// Variant Framer Motion pour stagger entry
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      damping: 22,
      stiffness: 260,
    },
  },
};
```

### 7.3 Micro-interactions

| Interaction | Animation | Durée | Easing |
|-------------|-----------|-------|--------|
| **Hover pill filtre** | Scale 1→1.05 + border-color | 150ms | ease-out |
| **Hover bouton** | Opacité fond + border | 150ms | ease-out |
| **Hover nœud 3D** | Scale 1→1.6 + glow + arêtes actives | 200ms | stellar |
| **Clic nœud** | Scale 1→2.2 + data wave | 400ms | cosmic |
| **Clic bouton CTA** | Scale 1→0.97 | 50ms | instant |
| **Fermeture panel** | Slide X 100% + fade | 250ms | stellar |
| **Tooltip apparition** | Slide up 8px + fade | 150ms + 100ms delay | fade |
| **Résultats search** | Stagger slide up (25ms × index) | 200ms | fade |
| **Filtre changement** | Nœuds hors filtre fondent (opacité 1→0.05) | 300ms | fade |
| **Data wave (sélection)** | Pulse le long des arêtes connectées | 600ms | float |

### 7.4 Data Wave — Effet signature

Quand l'utilisateur sélectionne un nœud, une onde lumineuse se propage le long des arêtes connectées :

```typescript
// Dans le composant EdgeLine, ajouter :
// isPulsing = true quand le nœud source ou target est sélectionné
// pulseTime = temps écoulé depuis la sélection

useFrame(({ clock }) => {
  if (!isPulsing) return;

  // L'onde progresse le long de l'arête : de t=0 à t=1 sur 600ms
  const elapsed = clock.elapsedTime - pulseStartTime;
  const t = Math.min(elapsed / 0.6, 1);

  // La particule voyage le long de l'arête
  const particlePos = new THREE.Vector3().lerpVectors(startPos, endPos, t);

  // L'opacité de l'arête suit l'onde
  materialRef.current.opacity = 0.3 + (1 - t) * 0.5;

  // Après 600ms, l'effet s'arrête
  if (t >= 1) {
    setIsPulsing(false);
    materialRef.current.opacity = 0.4;
  }
});
```

### 7.5 Animations 3D des nœuds (perpétuelles)

Chaque nœud a une animation continue subtile qui lui donne vie :

```typescript
// Dans GlowNode, via useFrame()
useFrame(({ clock }) => {
  const t = clock.elapsedTime;

  // Float vertical : chaque nœud a une phase unique basée sur son seed
  const phase = seed * 0.1;
  const floatY = Math.sin(t * 0.6 + phase) * 0.04;

  // Pulse respiratoire : scale qui varie doucement
  const pulse = 1 + Math.sin(t * 0.8 + phase * 1.5) * 0.02;

  // Glow intensity : lueur qui respire
  const glowIntensity = baseIntensity + Math.sin(t * 1.0 + phase * 2) * 0.15;

  // Appliquer les transformations
  ref.current.position.y += floatY * 0.01;
  ref.current.scale.setScalar(pulse);
});
```

### 7.6 Animations CSS (via Tailwind v4 custom)

```css
/* Dans globals.css — animations persistantes */

@keyframes data-wave {
  0% { stroke-dashoffset: 0; opacity: 0.3; }
  50% { stroke-dashoffset: -20; opacity: 0.8; }
  100% { stroke-dashoffset: -40; opacity: 0.3; }
}

@keyframes cosmic-drift {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  25% { transform: translate(3px, -4px) rotate(0.3deg); }
  50% { transform: translate(-1px, 3px) rotate(-0.2deg); }
  75% { transform: translate(4px, 1px) rotate(0.3deg); }
}

@keyframes glow-breathing {
  0%, 100% { opacity: 0.4; box-shadow: 0 0 6px rgba(245, 158, 11, 0.2); }
  50% { opacity: 0.8; box-shadow: 0 0 16px rgba(245, 158, 11, 0.4), 0 0 32px rgba(245, 158, 11, 0.1); }
}

@keyframes skeleton-pulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}
```

### 7.7 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  .animate-cosmic-drift,
  .animate-glow-breathing {
    animation: none !important;
  }
}
```

---

## 8. Règles d'or — « Les Lois Cosmiques »

### 8.1 Hiérarchie visuelle (nouvelle)

| Niveau | Éléments | Règle |
|--------|----------|-------|
| **1 — Priorité max** | Nœud sélectionné (Star), CTA ambre | Taille ×2.2, glow max, #f59e0b |
| **2 — Haute** | Search bar, panel détail, filtres actifs | Bordures ambrées, z-index élevé |
| **3 — Normale** | Nœuds standards, arêtes, tooltip | Opacité 0.9, couleurs neutres |
| **4 — Basse** | Nœuds dimmés, arêtes faibles, fond | Opacité 0.2, #23252a, #070708 |
| **5 — Décorative** | Particules de fond, labels 3D | Opacité < 0.4, pas d'interaction |

### 8.2 Palette Zinc/Ambre (strict)

```
Fond canvas     : #070708  (zinc-950)
Surfaces UI     : #0f1011  (zinc-925)
Bordures        : #23252a  (zinc-800)
Accent primaire : #f59e0b  (amber-500)
Texte primaire  : #f7f8f8  (zinc-50)
Texte secondaire: #8a8f98  (zinc-400)
Texte tertiaire : #62666d  (zinc-500)
Hover border    : #f59e0b + 20% opacity
Hover surface   : #161718  (zinc-900)
Overlay         : rgba(0,0,0,0.5) — solide, pas de blur
```

### 8.3 Layout règles

```
• Canvas 3D = TOUJOURS fixed inset-0, z-index 0
• UI = TOUJOURS superposée en position fixe, jamais dans le canvas
• Pas de backdrop-filter: blur() nulle part
• Les panels ont des bords solides (border) pour se détacher du canvas
• Les ombres portées sont des box-shadow, pas des drop-shadow CSS
• Max 2 couleurs d'accent visibles simultanément (typiquement ambre + une couleur de type)
```

### 8.4 Anti-patterns

```
❌ « UI flottante sans ancre » — Tout élément UI doit avoir un fond solide ou une bordure
❌ « Ambre partout » — #f59e0b réservé au CTA unique, au nœud sélectionné, et aux hover states
❌ « Trop d'informations » — Le tooltip ne montre que 2 lignes de texte. Le détail est dans le panel.
❌ « Animations parasites » — Max 3-4 animations simultanées. Pas de rotation si un panel est ouvert.
❌ « Écran saturé » — 20-30% de l'espace doit rester vide (le « vide cosmique » fait partie du thème)
```

---

## 9. Plan d'implémentation

### Phase 1 — Structure (jour 1)
1. Mettre à jour `globals.css` avec les nouveaux tokens Tailwind v4 (couleurs zinc/ambre, easing, keyframes)
2. Créer le composant `TypeFilter` dans `src/components/type-filter.tsx`
3. Créer le composant `LegendBar` dans `src/components/legend-bar.tsx`
4. Créer le composant `StatsBar` dans `src/components/stats-bar.tsx`
5. Mettre à jour `page.tsx` pour intégrer les nouveaux composants

### Phase 2 — Interactions (jour 2)
1. Améliorer `GlowNode` dans `neuron-scene.tsx` avec les nouvelles animations (float, pulse, glow breathing)
2. Ajouter l'effet « data wave » sur les arêtes lors de la sélection
3. Améliorer le fly-to caméra sur sélection (animation douce vers le nœud)
4. Activer `enablePan: true` dans OrbitControls
5. Ajouter l'autoRotate lent quand aucun nœud n'est sélectionné

### Phase 3 — États & transitions (jour 3)
1. Améliorer l'empty state (message d'accueil avec animation d'entrée)
2. Améliorer le loading state (anneau orbital animé)
3. Ajouter le stagger d'entrée pour les nœuds
4. Améliorer le tooltip de survol (design raffiné)
5. Ajouter la transition de filtre (nœuds hors filtre fondent)

### Phase 4 — Recherche & navigation (jour 4)
1. Améliorer le `SearchOverlay` avec le nouveau design
2. Connecter les résultats de recherche au canvas 3D (highlight des nœuds correspondants)
3. Ajouter le dropdown projet
4. Ajouter le slider temporel (timeline)
5. Ajouter les contrôles clavier complets (↑↓ navigation dans les résultats)

### Phase 5 — Polish (jour 5)
1. Tester toutes les transitions et easings
2. Vérifier le `prefers-reduced-motion`
3. Ajuster les timing (certains délais peuvent être trop longs)
4. Tests de performance (particules, bloom, animations)
5. Revue de cohérence (couleurs, espacements, radius)

---

> **Document :** Synapse UX/UI Redesign v2.0 — « L'Observatoire Mental »
> **Designer :** Apex (Orion)
> **Statut :** ✅ Conception terminée
> **Prochaine étape :** Implémentation Phase 1 — Structure
