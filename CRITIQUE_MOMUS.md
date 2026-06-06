# Critique Synapse — Momus

**Fichiers analysés :** 10 fichiers dans `src/` + `package.json` + `globals.css`
**Projet :** Synapse — visualiseur 3D de mémoire sous forme de graphe de nœuds
**Stack :** Next.js 16.2.7 + React 19.2.4 + Three.js/R3F + Framer Motion + Tailwind v4

---

## Résumé exécutif

Synapse est visuellement superbe, architecturalement naïf. Le code 3D (`neuron-scene.tsx`, `graph-layout.ts`) est le point fort — bien pensé, bien structuré, avec des choix esthétiques et techniques solides. En revanche, l'architecture frontend souffre de **composants orphelins**, de **classes CSS inexistantes**, de **duplication** de logique, et d'une **absence totale de tests**. Environ 40 % du code doit être refactoré, 30 % manque (accessibilité, erreurs, tests), et 30 % est bon et peut être conservé tel quel.

---

## 1. Ce qui est bon — à garder

### src/lib/memory-data.ts
- Interface `MemoryEntry` claire et minimale.
- Palette de couleurs bien choisie (ambre, rouge, bleu, vert, violet, cyan, zinc).
- Fonction `getTypeColor` simple et efficace.
- `loadMemoryData` est straightforward (mais voir section 2).

### src/lib/graph-layout.ts
- Algorithme de layout par cluster (type-based) avec dispersion sphérique autour de centres.
- Hash et seed déterministes pour reproductibilité.
- Création d'arêtes basée sur similarité (même type, même projet).
- Taille des nœuds proportionnelle à leur degré (importance).
- Interface `GraphNode`/`GraphEdge` bien typée.

### src/components/neuron-scene.tsx
- **Le meilleur fichier du projet.** Rendu 3D de haute qualité.
- GlowNode avec double couche (core + halo) via `PointsMaterial` en `AdditiveBlending`.
- Hitbox séparée pour les interactions (sphere transparente).
- Labels 3D avec `Text` de drei.
- EdgeLine avec dash offset animé via `useFrame`.
- Bloom post-processing bien dosé (intensity 0.4, luminanceThreshold 0.1).
- OrbitControls avec auto-rotate fluide.
- Particules de fond subtiles.
- Architecture propre : séparation `GlowNode` / `EdgeLine` / `Particles` / `SceneContent`.

### src/components/memory-card.tsx
- Design propre, badges de type avec couleur, tag projet, timestamp relatif.
- Truncation intelligente à 100 caractères en mode compact.
- Fonction `relativeTime` en français (attention : non extraite, voir section 2).

### src/components/bento-grid.tsx
- Animation staggered par index.
- Responsive breakpoints.
- Composant simple et prévisible.

### src/components/magnetic-button.tsx
- Effet magnétique fluide avec `MouseEvent` tracking.
- Props flexibles (`as`, `className`, `onClick`).

### src/app/page.tsx
- Raccourcis clavier ⌘K et Escape.
- `AnimatePresence` bien utilisé pour les transitions search/detail.
- Composants internes `SearchOverlay` et `DetailPanel` bien isolés (même si dans le même fichier).
- Design système cohérent (dark theme, zinc/ambre, rounded-2xl, spring animations).

### src/app/globals.css
- Tailwind v4 `@import` et `@theme inline` corrects.
- Animations `float` et `glow-pulse` élégantes.
- Scrollbar personnalisée subtile.
- Antialiasing activé.

### src/app/layout.tsx
- Metadata propre.
- `next/font/google` avec `display: swap` et `variable`.

---

## 2. Ce qui est mauvais — à changer immédiatement

### 🔴 CRITIQUE — MemoryModal utilise des classes CSS inexistantes

**Fichier :** `src/components/memory-modal.tsx` (lignes 107, 123, 126)

```tsx
// Ces classes N'EXISTENT PAS dans globals.css :
className="bg-obsidian border border-graphite shadow-elevated rounded-[--radius-card]"
className="bg-obsidian border border-graphite shadow-elevated rounded-t-2xl"
className="h-1.5 w-12 rounded-full bg-iron"
```

**Problème :** Le modal affichera un fond blanc sur fond noir — complètement invisible ou cassé. Ces tokens viennent probablement d'un ancien design system ou d'un autre projet (Orion ?). Ils doivent être remplacés par les classes Tailwind effectives (`bg-[#0f1011]`, `border-[#23252a]/80`, etc.) pour être cohérents avec le reste de l'application.

**Action :** Remplacer `bg-obsidian` → `bg-[#0f1011]`, `border-graphite` → `border-[#23252a]/80`, `shadow-elevated` → `shadow-[0_16px_48px_-12px_rgba(0,0,0,0.6)]`, `bg-iron` → `bg-[#23252a]`.

### 🔴 CRITIQUE — Import type manquant

**Fichier :** `src/components/memory-modal.tsx` (ligne 6)

```tsx
import { MemoryEntry } from '@/lib/memory-data';
```

**Problème :** `MemoryEntry` est un type, pas une valeur. Doit être :

```tsx
import type { MemoryEntry } from '@/lib/memory-data';
```

En mode `isolatedModules` (standards Next.js), ceci peut causer des erreurs de build ou au minimum ralentir le bundler.

### 🔴 CRITIQUE — Multiples `entries.find()` dans le tooltip

**Fichier :** `src/app/page.tsx` (lignes 262, 265, 269)

```tsx
{entries.find(e => e.id === hoveredId)?.metadata.type}
{entries.find(e => e.id === hoveredId)?.text}
```

**Problème :** Trois appels `find()` sur le même tableau pour la même entrée. C'est O(n) × 3 à chaque rendu. Pour 30 entrées c'est négligeable, mais pour 300+ entrées (objectif d'un outil de mémoire), ça devient coûteux.

**Action :** Remplacer par une `Map<string, MemoryEntry>` via `useMemo`.

### 🟡 IMPORTANT — ESLint désactivé pour dépendances `useMemo`

**Fichier :** `src/components/neuron-scene.tsx` (lignes 141-142, 149, 153)

```tsx
// eslint-disable-next-line react-hooks/exhaustive-deps
const points = useMemo(() => [...], []);
```

**Problème :** Les coordonnées des arêtes sont figées dans `useMemo` avec `[]`. Si les entrées changent et que `computeGraphLayout` retourne de nouvelles positions, les anciennes arêtes pointent vers des positions obsolètes. Le layout est statique alors que les données devraient être dynamiques.

**Action :** Ajouter `source.position` et `target.position` comme dépendances ou recalculer dans un effet.

### 🟡 IMPORTANT — `as any` pour l'accès à la material

**Fichier :** `src/components/neuron-scene.tsx` (ligne 170)

```tsx
(meshRef.current.material as any).dashOffset
```

**Problème :** TypeScript unsafe. Three.js a un typage correct pour `LineDashedMaterial.dashOffset`.

**Action :** Utiliser `(meshRef.current.material as THREE.LineDashedMaterial).dashOffset`.

### 🟡 IMPORTANT — `Math.random()` dans le rendu 3D

**Fichier :** `src/components/neuron-scene.tsx` (lignes 45-47)

```tsx
speed={1.5 + Math.random() * 0.5}
floatIntensity={0.3 + Math.random() * 0.2}
```

**Problème :** `Math.random()` est appelée à chaque rendu du composant. Elle devrait être stable (seed basée sur l'ID du nœud). De plus, cela rend le rendu serveur instable (SSR mismatch potentiel).

**Action :** Utiliser `useMemo(() => 1.5 + hash(node.id) * 0.5, [node.id])` ou passer des valeurs déterministes.

### 🟡 IMPORTANT — Aucune gestion d'erreur pour le chargement des données

**Fichier :** `src/lib/memory-data.ts` (lignes 11-16)

```tsx
export async function loadMemoryData(): Promise<MemoryEntry[]> {
  const res = await fetch('/data.json');
  const data = await res.json();
  return data;
}
```

**Problème :** Si `/data.json` n'existe pas, ou si le fetch échoue (réseau, 404, 500), l'erreur est non gérée. L'application reste bloquée sur l'écran « Connexion à la mémoire... » indéfiniment.

**Action :** Ajouter un try/catch, un état d'erreur, et un message d'erreur dans l'UI.

### 🟡 IMPORTANT — Définition de `Component` inutilisée

**Fichier :** `src/components/magnetic-button.tsx` (ligne 34)

```tsx
const Component = as === 'button' ? 'button' : motion.div;
```

Cette variable est assignée mais jamais utilisée — le code fait ensuite un `if (as === 'button')` manuel au lieu d'utiliser `Component`. Cela double la logique de rendu.

### 🟡 — Composants orphelins / jamais utilisés

| Composant | Fichier | Utilisé dans page.tsx ? |
|-----------|---------|------------------------|
| `BentoGrid` / `BentoItem` | `bento-grid.tsx` | ❌ Non |
| `MagneticButton` | `magnetic-button.tsx` | ❌ Non |
| `MemoryModal` | `memory-modal.tsx` | ❌ Non (page.tsx utilise son propre `DetailPanel` inline) |

**Problème :** 3 composants sur 6 sont complètement inutilisés. Soit ils doivent être intégrés (ex : remplacer `DetailPanel` inline par `MemoryModal` qui est mieux conçu), soit supprimés pour réduire le code mort.

### 🟡 — `font-family` incohérente entre layout.tsx et globals.css

**Fichier :** `src/app/globals.css` (ligne 6)

```css
--font-sans: "Inter Variable", system-ui, -apple-system, sans-serif;
```

**Problème :** `layout.tsx` charge la police avec `next/font/google` et définit `variable: "--font-inter"`, mais `globals.css` référence `"Inter Variable"` directement (fallback système). Les deux approches sont redondantes et peuvent causer un FOUT (Flash Of Unstyled Text).

**Action :** Choisir une approche : soit `next/font/google` seule avec `var(--font-inter)`, soit une déclaration CSS directe dans `globals.css` avec `@fontsource` ou un `@import`.

### 🟡 — Duplication de la gestion de la touche Escape

**Problème :** Trois endroits différents gèrent la touche Escape :
1. `SearchOverlay` (page.tsx, lignes 27-32)
2. `DetailPanel` (page.tsx, lignes 118-124)
3. `MemoryModal` (memory-modal.tsx, lignes 74-81)

Ce pattern devrait être un hook partagé `useEscape(onClose)`.

### 🟡 — `lg:grid-cols-1` dans BentoGrid

**Fichier :** `src/components/bento-grid.tsx` (ligne 14)

```tsx
className={`grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 ${className}`}
```

À `lg`, la grille repasse en une colonne ? Logique inversée — probablement une erreur, devrait être `lg:grid-cols-3` ou `lg:grid-cols-4` selon le design.

---

## 3. Ce qui manque — à ajouter

### 🔴 MANQUANT — Accessibilité (a11y)

| Manque | Détail |
|--------|--------|
| `aria-label` | Aucun élément interactif n'a de label accessible |
| `role` | Le graphe 3D est invisible pour les lecteurs d'écran |
| Focus trap | MemoryModal/DetailPanel ne piègent pas le focus |
| `aria-modal` | Non présent sur les overlays |
| `aria-expanded` | Non présent sur les boutons de recherche |
| Body scroll lock | Le modal ne bloque pas le scroll du body |
| `prefers-reduced-motion` | Les animations sont forcées |

**Action :** Ajouter un hook `useFocusTrap`, un hook `useBodyScrollLock`, et un wrapper `A11yDialog` générique.

### 🔴 MANQUANT — Gestion d'erreur et états vides

| Manque | Détail |
|--------|--------|
| État d'erreur | Si `/data.json` échoue, l'app reste bloquée |
| Message d'erreur | Aucun `ErrorBoundary` n'enrobe l'application |
| Réessai | Pas de bouton "Réessayer" |
| État vide (0 entrées) | Géré mais pas personnalisé (juste "Connexion...") |
| Validation des données | `res.json()` peut retourner n'importe quoi |

**Action :** Ajouter un `ErrorBoundary`, un try/catch dans `loadMemoryData`, un bouton de retry.

### 🔴 MANQUANT — Tests

| Manque | Détail |
|--------|--------|
| Tests unitaires | Aucun fichier `.test.ts` dans le projet |
| Tests composants | Aucun test React Testing Library |
| Tests d'intégration | Aucun test de rendu 3D |
| Tests de layout | `computeGraphLayout` est idéal pour des tests unitaires |

**Action :** Ajouter au minimum des tests unitaires pour `graph-layout.ts` et `memory-data.ts`, et un test de rendu pour `memory-card.tsx`.

### 🟡 MANQUANT — Performance

| Manque | Détail |
|--------|--------|
| `Map` pour recherche | `entries.find()` O(n) partout — utiliser `Map` |
| Virtualisation | Pas de virtualisation pour la liste de résultats |
| `React.memo` | Aucun composant n'est mémoïsé |
| lazy loading | Three.js pourrait être chargé dynamiquement |
| Image optimization | Pas d'images, mais le Canvas pourrait être lazy |

### 🟡 MANQUANT — Architecture et structure

| Manque | Détail |
|--------|--------|
| Hooks partagés | `useEscape`, `useSearch`, `useFocusTrap` à créer |
| Séparation fichiers | `SearchOverlay` et `DetailPanel` dans `page.tsx` → à extraire |
| Utilitaires | `relativeTime` dans `memory-card.tsx` → à extraire dans `lib/time.ts` |
| Constantes | Couleurs, tailles, durées d'animation → à centraliser |
| Types | `MemoryEntry` seul fichier de types → à étendre |

### 🟡 MANQUANT — Fonctionnalités

| Manque | Utilité |
|--------|---------|
| Filtres par type/projet | Permet de naviguer le graphe |
| Recherche fuzzy | La recherche `includes()` ignore les fautes et la morphologie |
| Zoom sur node sélectionné | Quand on clique, la caméra devrait se rapprocher |
| Édition / ajout | Impossible d'ajouter une entrée depuis l'UI |
| Drag & drop 3D | Impossible de déplacer les nœuds |
| Timeline / axe temporel | Les entrées ont des timestamps mais pas d'axe temporel |
| Partager une mémoire | Pas de permalien |

---

## 4. Bilan par fichier

| Fichier | Lignes | Qualité | Problèmes majeurs |
|---------|--------|---------|-------------------|
| `app/layout.tsx` | 22 | ✅ Bon | Rien de critique (minimal mais correct) |
| `app/globals.css` | 36 | ✅ Bon | Conflit font-family potentiel |
| `app/page.tsx` | 308 | 🟡 Correct | `find()` multiples, composants inline, pas d'erreur |
| `components/neuron-scene.tsx` | 373 | ✅ Excellent | `as any`, `useMemo` vide, `Math.random` |
| `components/memory-card.tsx` | 65 | ✅ Bon | `relativeTime` non extrait |
| `components/bento-grid.tsx` | 49 | 🟡 Inutilisé | `lg:grid-cols-1` suspect |
| `components/magnetic-button.tsx` | 68 | 🟡 Inutilisé | Variable `Component` inutilisée |
| `components/memory-modal.tsx` | 137 | 🔴 Cassé | Classes CSS inexistantes, import type manquant |
| `lib/graph-layout.ts` | 144 | ✅ Excellent | Rien de critique |
| `lib/memory-data.ts` | 38 | 🟡 Correct | Aucune gestion d'erreur |

---

## 5. Priorités d'action

### 🔴 Immédiat (risque de rendu cassé)
1. **MemoryModal** — remplacer les classes CSS inexistantes (`bg-obsidian` etc.)
2. **MemoryModal** — corriger `import { MemoryEntry }` → `import type { MemoryEntry }`

### 🔴 Urgent (robustesse)
3. **memory-data.ts** — ajouter try/catch + gestion d'erreur dans `loadMemoryData`
4. **page.tsx** — remplacer `entries.find()` par une `Map` dans le tooltip
5. **page.tsx** — extraire `SearchOverlay` et `DetailPanel` dans des fichiers séparés

### 🟡 Important (qualité)
6. **neuron-scene.tsx** — corriger les dépendances `useMemo` et le `as any`
7. **neuron-scene.tsx** — rendre `Math.random()` déterministe (hash du node.id)
8. **memory-modal.tsx** — ajouter focus trap et body scroll lock
9. **globals.css** — harmoniser `font-family` avec `next/font/google`
10. **Créer** un hook `useEscape`, un hook `useSearch`
11. **Créer** un fichier `lib/time.ts` pour `relativeTime`

### 🟡 Souhaitable (architecture)
12. Décider du sort des 3 composants orphelins (intégrer ou supprimer)
13. Ajouter un `ErrorBoundary` global
14. Ajouter des tests unitaires pour `graph-layout.ts`
15. Mémoïser les composants critiques avec `React.memo`

### 📦 Pour plus tard (features)
16. Filtres, recherche fuzzy, zoom automatique, édition d'entrées
17. Axe temporel dans le graphe 3D
18. Permaliens pour les mémoires

---

*Critique rédigée par **Momus**, le 6 juin 2026.*
