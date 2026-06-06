# 📱 Synapse — Refonte Mobile-First

> **Designer :** Apex (équipe Orion)
> **Date :** 2026-06-06
> **Stack :** Next.js 16, React Three Fiber, Tailwind v4, Framer Motion
> **Palette :** Zinc/Ambre (inchangée — #070708, #0f1011, #23252a, #f59e0b, #f7f8f8)
> **Contrainte clé :** backdrop-filter: blur() ne marche pas sur WebGL — surfaces SOLIDES obligatoires partout.
> **Canvas 3D :** Toujours plein écran, toujours interagissable (touch drag = rotation OrbitControls)

---

## Table des matières

1. [Breakpoints & Layout général](#1-breakpoints--layout-général)
2. [Navigation au pouce (thumb zones)](#2-navigation-au-pouce-thumb-zones)
3. [Composants par breakpoint](#3-composants-par-breakpoint)
   - 3.1 [Bottom Sheet Navigation (mobile)](#31-bottom-sheet-navigation-mobile)
   - 3.2 [TypeFilter → Bottom Drawer (mobile)](#32-typefilter--bottom-drawer-mobile)
   - 3.3 [SearchBar → Floating Action Icon (mobile)](#33-searchbar--floating-action-icon-mobile)
   - 3.4 [StatsBadge → Mini statut (mobile)](#34-statsbadge--mini-statut-mobile)
   - 3.5 [LegendBar → Intégrée au drawer TypeFilter](#35-legendbar--intégrée-au-drawer-typefilter)
   - 3.6 [Tooltip → Vers le haut (mobile)](#36-tooltip--vers-le-haut-mobile)
   - 3.7 [DetailPanel → Bottom Sheet plein écran (mobile)](#37-detailpanel--bottom-sheet-plein-écran-mobile)
   - 3.8 [SearchOverlay → Full-screen modal (mobile)](#38-searchoverlay--full-screen-modal-mobile)
4. [Tableau récapitulatif : positions par breakpoint](#4-tableau-récapitulatif-positions-par-breakpoint)
5. [Interactions tactiles](#5-interactions-tactiles)
6. [Globals.css — Ajouts responsives](#6-globalscss--ajouts-responsives)
7. [Hiérarchie d'information progressive](#7-hiérarchie-dinformation-progressive)

---

## 1. Breakpoints & Layout général

### 1.1 Points de rupture (Tailwind v4)

| Nom | Breakpoint | Classe Tailwind | Cible |
|-----|-----------|-----------------|-------|
| **Mobile** | `< 640px` | `max-sm:` | Smartphones portrait |
| **Tablette** | `640px → 1024px` | `sm:` à `max-lg:` | Tablettes, foldables, smartphones paysage |
| **Desktop** | `> 1024px` | `lg:` | Écrans larges, desktop |

### 1.2 Principe mobile-first

```
mobile-first : base = mobile, sm: = tablette, lg: = desktop
```

Tout composant est d'abord conçu pour <640px. Les surcharges `sm:` et `lg:` ajoutent des capacités, jamais l'inverse.

### 1.3 Structure de l'écran — Vue d'ensemble par breakpoint

#### **Mobile (< 640px)**

```
┌────────────────────────────────┐
│                                │
│   ┌──── CANVAS 3D (plein écran, z-0) ────┐
│   │                                        │
│   │   (accessible via touch drag/zoom)    │
│   │   (touch drag = OrbitControls)        │
│   │                                        │
│   └────────────────────────────────────────┘
│                                │
│ ┌────[★]── FAB en haut à droite ──────┐    │ ← z-15, top-4 right-4
│ └──────────────────────────────────────┘    │
│                                │
│ ┌── TOOLTIP (décalé vers le haut) ────┐    │ ← z-20, top-24 (pas en bas)
│ └──────────────────────────────────────┘    │
│                                │
│ ┌────── BOTTOM SHEET NAV ───────────────┐  │
│ │ icon:type  icon:search  icon:stats    │  │ ← z-30, bottom-0, h-16
│ │ [filtres]  [loupe]     [info]         │  │    barre de navigation fixe
│ └────────────────────────────────────────┘  │
│                                │
└────────────────────────────────┘
```

#### **Tablette (640px → 1024px)**

```
┌──────────────────────────────────────┐
│ ┌────── HUD HAUT COMPACT ───────────┐│
│ │ [Tous ▼] [Type] [pill] [pill]     ││ ← top-4 left-4, scroll horizontal
│ │                   🔍              ││ ← top-4 right-4 (FAB plus petit)
│ └────────────────────────────────────┘│
│                                        │
│   ┌── CANVAS 3D (plein écran) ────┐  │
│   │                                │  │
│   └────────────────────────────────┘  │
│                                        │
│ ┌──── ZONE BASSE COMPACTE ───────────┐│
│ │ ● ● ● ● ●  +2  | 142 nœuds · 2min ││ ← bottom-4 left-4
│ └────────────────────────────────────┘│
│                                        │
│ ┌── TOOLTIP (bas-centré, compact) ──┐ │
│ └────────────────────────────────────┘ │
└────────────────────────────────────────┘
```

#### **Desktop (> 1024px)**

> Voir CONCEPTION_UX.md — inchangé. Le layout desktop reste exactement comme actuellement :
> TypeFilter top-left, SearchBar centrée, StatsBadge top-right,
> LegendBar bottom-left, Tooltip bottom-center, DetailPanel slide depuis la droite.

---

## 2. Navigation au pouce (thumb zones)

### 2.1 Carte des zones tactiles (mobile < 640px)

Basée sur une étude ergonomique (pouce en grip téléphone) :

```
┌────────────────────────────────┐
│                                │
│  [zone 4 : étirement]          │  ← difficile, pas d'actions critiques
│        top-4 right-4           │     → icône FAB de recherche ici (usage occasionnel)
│                                │
│                                │
│  [zone 3 : neutre]             │  ← milieu d'écran, couvert par le canvas
│                                │     → pas d'UI here (le canvas 3D est ici)
│                                │
│                                │
│  [zone 2 : naturelle]          │  ← bas milieu, accessible sans forcer
│        bottom-32 à bottom-16   │     → tooltip de survol ici
│                                │
│  [zone 1 : PRIMAIRE]           │  ← TRÈS accessible, pouce au repos
│        bottom-0 à bottom-16    │     → Bottom Sheet Navigation ici
│                                │     → TOUTES les actions principales
└────────────────────────────────┘
```

### 2.2 Règles thumb zone

| Zone | Priorité | Contenu | Justification |
|------|----------|---------|---------------|
| **Zone 1** (bottom 0–64px) | **Primaire** | Bottom Sheet Nav, Drawer TypeFilter, Drawer Search, Drawer Stats | Le pouce atteint cette zone sans bouger la main |
| **Zone 2** (bottom 80–160px) | **Secondaire** | Tooltip de survol, mini-preview | Accessible avec un léger mouvement |
| **Zone 3** (milieu) | **Neutre** | Canvas 3D uniquement | Pas d'interactions UI ici — le canvas reçoit les gestes (touch drag, pinch) |
| **Zone 4** (top) | **Difficile** | FAB de recherche uniquement (usage rare) | Bouton unique, accessible en étirant le pouce OU en changeant de grip |

---

## 3. Composants par breakpoint

### 3.1 Bottom Sheet Navigation (mobile)

**Nouveau composant.** Barre de navigation fixe en bas de l'écran, visible uniquement sur mobile (< 640px).

```tsx
// BottomSheetNav — mobile ONLY (< 640px)
// Position : fixed bottom-0 left-0 right-0 z-30
// Hauteur : h-14 (56px) ou h-16 (64px) selon safe-area

<div className="fixed bottom-0 left-0 right-0 z-30
  h-14 pb-safe-area-bottom   /* ← safe area pour iPhone notch */
  bg-[#0f1011]
  border-t border-[#23252a]/80
  shadow-[0_-4px_24px_-8px_rgba(0,0,0,0.5)]  /* ombre vers le haut */

  lg:hidden                  /* ← caché sur desktop */
  max-sm:flex                /* ← visible seulement sur mobile */
/>
```

**Implémentation proposée dans `page.tsx` :**

```tsx
/* Nouveau composant : BottomSheetNav */
'use client';

interface BottomSheetNavProps {
  onOpenFilter: () => void;
  onOpenSearch: () => void;
  onOpenStats: () => void;
  activeType: string | null;
  nodeCount: number;
}

export default function BottomSheetNav({ ... }: BottomSheetNavProps) {
  const items = [
    { icon: filterIcon, label: 'Filtres',   action: onOpenFilter, badge: activeType },
    { icon: searchIcon,  label: 'Recherche', action: onOpenSearch },
    { icon: statsIcon,   label: 'Stats',     action: onOpenStats,  badge: `${nodeCount}` },
  ];

  return (
    <nav className="
      fixed bottom-0 left-0 right-0 z-30
      h-14 pb-[env(safe-area-inset-bottom,0px)]
      bg-[#0f1011] border-t border-[#23252a]/80
      shadow-[0_-4px_24px_-8px_rgba(0,0,0,0.5)]
      flex items-center justify-around
      lg:hidden
    ">
      {items.map((item) => (
        <button
          key={item.label}
          onClick={item.action}
          className="
            relative flex flex-col items-center justify-center
            w-16 h-full gap-0.5
            text-[10px] text-[#62666d]
            hover:text-[#f7f8f8]
            active:text-[#f59e0b]
            transition-colors duration-150
            active:scale-90
            tap-highlight-transparent
            select-none
          "
        >
          {/* Icon SVG (20×20) */}
          <svg className="w-5 h-5" ... />
          <span className="text-[9px] tracking-[0.03em]">{item.label}</span>

          {/* Badge optionnel (type actif ou compteur) */}
          {item.badge && (
            <span className="
              absolute -top-0.5 right-3
              w-1.5 h-1.5 rounded-full
              bg-[#f59e0b]
              shadow-[0_0_6px_rgba(245,158,11,0.4)]
            " />
          )}
        </button>
      ))}
    </nav>
  );
}
```

**Classes Tailwind précises :**

```
Composant       | Classe                                | Condition
----------------|---------------------------------------|------------------
Conteneur nav   | fixed bottom-0 left-0 right-0 z-30    | max-sm: (base)
                | h-14 pb-[env(safe-area-inset-bottom)] | toujours
                | bg-[#0f1011] border-t border-[#23252a]| toujours
                | lg:hidden                              | cache sur >= 1024px
Bouton          | w-16 h-full flex flex-col items-center | toujours
                | gap-0.5 text-[10px] text-[#62666d]    | toujours
                | active:text-[#f59e0b] active:scale-90 | retour tactile
Badge           | absolute -top-0.5 right-3              | toujours
                | w-1.5 h-1.5 rounded-full bg-[#f59e0b] | toujours
                | shadow-[0_0_6px_rgba(245,158,11,0.4)] | glow ambre
```

---

### 3.2 TypeFilter → Bottom Drawer (mobile)

**Problème actuel :** Les pills prennent trop de place en haut à gauche sur mobile.

**Solution mobile :** Les pills deviennent un **Bottom Drawer** qui slide depuis le bas quand on tape sur l'icône « Filtres » de la BottomSheetNav.

#### Mobile (< 640px)

```tsx
// TypeFilterDrawer — mobile variant
// Apparaît quand on tape sur l'icône Filtres de BottomSheetNav
// Slide depuis le bas (animation spring)

<AnimatePresence>
  {drawerOpen && (
    <>
      {/* Overlay semi-transparent (ferme au tap) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-25 bg-black/50"
        onClick={() => setDrawerOpen(false)}
      />

      {/* Drawer lui-même */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className="
          fixed bottom-0 left-0 right-0 z-30
          max-h-[60vh]
          bg-[#0f1011]
          border-t border-[#23252a]/80
          rounded-t-2xl
          shadow-[0_-8px_32px_-12px_rgba(0,0,0,0.6)]
          overflow-y-auto
          pb-[calc(56px+env(safe-area-inset-bottom,0px))]  /* espace pour BottomSheetNav */
        "
      >
        {/* Handle visuel (barre de grip) */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-8 h-1 rounded-full bg-[#23252a]" />
        </div>

        {/* Header */}
        <div className="px-5 pb-3 border-b border-[#23252a]/50">
          <h3 className="text-xs font-medium text-[#f7f8f8] tracking-[0.02em]">
            Filtrer par type
          </h3>
          <p className="text-[10px] text-[#62666d] mt-0.5">
            {entries.length} entrées mémoire
          </p>
        </div>

        {/* Pills de filtres (verticales, larges, tactiles) */}
        <div className="p-3 space-y-1">
          {/* Bouton « Tous » — toujours en premier */}
          <button
            onClick={() => { onTypeChange(null); setDrawerOpen(false); }}
            className={`
              w-full flex items-center justify-between gap-3
              px-4 py-3.5 rounded-xl
              text-sm font-medium
              transition-all duration-150
              active:scale-[0.98]
              ${activeType === null
                ? 'bg-[#f59e0b] text-[#070708]'
                : 'bg-[#161718] text-[#8a8f98] border border-[#23252a]'
              }
            `}
          >
            <span>Tous les types</span>
            <span className="text-xs opacity-60">{entries.length}</span>
          </button>

          {/* Un bouton par type */}
          {types.map((t) => (
            <button
              key={t.id}
              onClick={() => { onTypeChange(activeType === t.id ? null : t.id); setDrawerOpen(false); }}
              className={`
                w-full flex items-center justify-between gap-3
                px-4 py-3.5 rounded-xl
                text-sm
                transition-all duration-150
                active:scale-[0.98]
                ${activeType === t.id
                  ? 'text-[#f7f8f8] font-medium'
                  : 'bg-[#0f1011] text-[#8a8f98] border border-[#23252a] hover:border-[#52525b]'
                }
              `}
              style={activeType === t.id ? {
                backgroundColor: t.color + '18',
                borderColor: t.color + '44',
              } : {}}
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: t.color }}
                />
                <span>{t.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#62666d]">{t.count}</span>
                {activeType === t.id && (
                  <svg className="w-4 h-4 text-[#f59e0b]" ... />  {/* check icon */}
                )}
              </div>
            </button>
          ))}
        </div>
      </motion.div>
    </>
  )}
</AnimatePresence>
```

#### Tablette (640px → 1024px)

Les pills compactes réapparaissent en haut à gauche, mais sur une ligne scrollable horizontalement si trop de types.

```tsx
// TypeFilter — tablette variant
<div className="
  fixed top-4 left-4 right-4 z-10
  max-lg:hidden   /* invisible sur mobile */
  sm:block         /* visible sur tablette+desktop */
  lg:top-6 lg:left-6  /* reprend position desktop à partir de 1024px */
">
  <div className="
    flex gap-1.5 overflow-x-auto
    scrollbar-none  /* cache scrollbar sur mobile/tablette */
    -mx-2 px-2     /* permet le scroll sans cacher les bords */
  ">
    {/* Mêmes pills qu'actuellement mais scrollables */}
    {/* ... (code CONCEPTION_UX.md section 6.4) */}
  </div>
</div>
```

**Points clés :**
- Sur tablette, les pills sont en haut à gauche mais **scrollables horizontalement** si trop nombreuses
- `scrollbar-none` masque la scrollbar (déjà fait via le CSS custom)
- Le padding négatif `-mx-2 px-2` permet au premier/dernier élément d'être visible sans être coupé par `overflow-hidden`

#### Desktop (> 1024px)

Inchangé — `lg:top-6 lg:left-6` avec les classes actuelles.

---

### 3.3 SearchBar → Floating Action Icon (mobile)

**Problème actuel :** La SearchBar centrée (`top-6 left-1/2 -translate-x-1/2 w-[420px]`) dépasse sur les écrans < 480px.

#### Mobile (< 640px)

La SearchBar devient un **FAB (Floating Action Button)** en haut à droite.

```tsx
// SearchFAB — mobile variant
// Un petit bouton icône qui ouvre le SearchOverlay full-screen

<button
  onClick={() => setSearchOpen(true)}
  className="
    fixed top-4 right-4 z-15
    w-10 h-10
    rounded-xl
    bg-[#0f1011]
    border border-[#23252a]/80
    shadow-[0_4px_16px_-8px_rgba(0,0,0,0.5)]
    flex items-center justify-center
    text-[#62666d]
    active:bg-[#161718] active:text-[#f59e0b] active:scale-90
    transition-all duration-150
    tap-highlight-transparent
    sm:hidden          /* caché sur tablette+ */
  "
>
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
</button>
```

#### Tablette (640px → 1024px)

La SearchBar apparaît mais réduite : `w-[320px]` au lieu de `w-[420px]`, padding réduit.

```tsx
// SearchBar — tablette variant
<button
  onClick={() => setSearchOpen(true)}
  className="
    fixed top-4 left-1/2 -translate-x-1/2 z-10
    hidden                /* caché par défaut (mobile-first) */
    sm:flex               /* visible sur tablette */
    lg:top-6              /* reposition desktop */
    items-center gap-2.5
    w-[320px] sm:w-[360px] lg:w-[420px]
    h-10 sm:h-11
    px-3.5 sm:px-4
    bg-[#0f1011]
    border border-[#23252a]/80 hover:border-[#f59e0b]/20
    rounded-xl
    text-sm text-[#8a8f98] hover:text-[#f7f8f8]
    transition-all duration-300
    shadow-[0_8px_32px_-12px_rgba(0,0,0,0.6)]
  "
>
  <svg className="w-4 h-4 text-[#62666d]" ... />
  <span className="tracking-[0.01em] flex-1 text-left text-[13px] sm:text-sm">
    Explorer la mémoire
  </span>
  <kbd className="hidden sm:inline-block text-[11px] font-mono text-[#62666d]
    px-2 py-0.5 rounded-md border border-[#23252a]">
    ⌘K
  </kbd>
</button>
```

**Transition :** Au passage tablette → desktop, la barre passe de `w-[320px]` à `w-[420px]`, le padding augmente, et la hauteur passe de 40px à 44px.

#### Desktop (> 1024px)

Inchangé — reprend les classes `lg:top-6 lg:w-[420px] lg:h-11`.

---

### 3.4 StatsBadge → Mini statut (mobile)

**Problème actuel :** StatsBadge en bas à droite, caché par le pouce, prend de la place inutile.

#### Mobile (< 640px)

Le StatsBadge disparaît de la vue principale et devient accessible via le drawer « Stats » de la BottomSheetNav.

```tsx
// StatsDrawer — mobile variant
// Même pattern que TypeFilterDrawer : slide depuis le bas

<AnimatePresence>
  {statsOpen && (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-25 bg-black/50"
        onClick={() => setStatsOpen(false)}
      />

      {/* Drawer */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className="
          fixed bottom-0 left-0 right-0 z-30
          bg-[#0f1011]
          border-t border-[#23252a]/80
          rounded-t-2xl
          shadow-[0_-8px_32px_-12px_rgba(0,0,0,0.6)]
          pb-[calc(56px+env(safe-area-inset-bottom,0px))]
        "
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-8 h-1 rounded-full bg-[#23252a]" />
        </div>

        {/* Contenu */}
        <div className="px-5 pb-6 space-y-4">
          <h3 className="text-xs font-medium text-[#f7f8f8] tracking-[0.02em]">
            Statistiques de l'espace mémoire
          </h3>

          {/* Stats cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#161718] border border-[#23252a] rounded-xl p-4">
              <p className="text-[10px] text-[#62666d] uppercase tracking-[0.06em] mb-1">
                Nœuds
              </p>
              <p className="text-xl font-semibold text-[#f7f8f8] tabular-nums">
                {entries.length}
              </p>
            </div>
            <div className="bg-[#161718] border border-[#23252a] rounded-xl p-4">
              <p className="text-[10px] text-[#62666d] uppercase tracking-[0.06em] mb-1">
                Arêtes
              </p>
              <p className="text-xl font-semibold text-[#f7f8f8] tabular-nums">
                {edgeCount}
              </p>
            </div>
          </div>

          {/* Dernière mise à jour */}
          <div className="bg-[#161718] border border-[#23252a] rounded-xl p-4">
            <p className="text-[10px] text-[#62666d] uppercase tracking-[0.06em] mb-1">
              Dernière mise à jour
            </p>
            <p className="text-sm text-[#a1a1aa] font-mono">
              {relativeTime(lastUpdated)}
            </p>
          </div>

          {/* Types distribution */}
          <div>
            <p className="text-[10px] text-[#62666d] uppercase tracking-[0.06em] mb-2">
              Répartition par type
            </p>
            <div className="space-y-2">
              {types.map((t) => (
                <div key={t.id} className="flex items-center gap-2.5">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: t.color }}
                  />
                  <span className="text-xs text-[#8a8f98] flex-1">{t.label}</span>
                  <span className="text-xs text-[#a1a1aa] font-medium tabular-nums">{t.count}</span>
                  <div className="w-20 h-1.5 rounded-full bg-[#23252a] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(t.count / entries.length) * 100}%`,
                        backgroundColor: t.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )}
</AnimatePresence>
```

#### Tablette (640px → 1024px)

Le StatsBadge réapparaît en version compacte, intégré à la barre de légende en bas à gauche.

```tsx
// StatsBadge — tablette variant (fusionné avec LegendBar)
<div className="
  fixed bottom-4 left-4 z-10
  max-sm:hidden     /* caché sur mobile */
">
  <div className="
    bg-[#0f1011] border border-[#23252a]/60
    rounded-xl px-3.5 py-2
    flex items-center gap-3
  ">
    {/* Legend items (max 4, puis +N) — identique à desktop mais compact */}
    <div className="flex items-center gap-2">
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

    {/* Separator */}
    <span className="w-px h-3 bg-[#23252a]" />

    {/* Mini stats */}
    <span className="text-[10px] text-[#62666d] font-mono whitespace-nowrap">
      {entries.length} nœuds
    </span>

    {lastUpdated && (
      <>
        <span className="w-px h-3 bg-[#23252a]" />
        <span className="text-[10px] text-[#52525b] font-mono whitespace-nowrap">
          {relativeTime(lastUpdated)}
        </span>
      </>
    )}
  </div>
</div>
```

#### Desktop (> 1024px)

Inchangé — `lg:top-6 lg:right-6` comme actuellement.

---

### 3.5 LegendBar → Intégrée au drawer TypeFilter (mobile)

**Problème actuel :** La barre de légende en bas à gauche mange de l'espace sur mobile.

#### Mobile (< 640px)

La légende n'est plus un composant séparé. Elle est intégrée **dans le drawer TypeFilter**, en bas de la liste des types.

```tsx
// Dans TypeFilterDrawer — section légende intégrée
<div className="px-5 pb-6">
  <div className="border-t border-[#23252a]/50 pt-4 mb-3">
    <p className="text-[10px] text-[#62666d] uppercase tracking-[0.06em] mb-3">
      Légende des types
    </p>
  </div>
  <div className="space-y-2">
    {types.map((t) => (
      <div key={t.id} className="flex items-center gap-2.5">
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: t.color }}
        />
        <span className="text-xs text-[#8a8f98]">{t.label}</span>
        <span className="ml-auto text-[10px] text-[#52525b] tabular-nums">{t.count}</span>
      </div>
    ))}
  </div>
</div>
```

#### Tablette (640px → 1024px)

La LegendBar est fusionnée avec les stats comme décrit en §3.4.

#### Desktop (> 1024px)

Inchangé — `lg:fixed lg:bottom-6 lg:left-6`.

---

### 3.6 Tooltip → Vers le haut (mobile)

**Problème actuel :** Le tooltip en bas au centre (`bottom-6 left-1/2`) entre en conflit avec la BottomSheetNav et la zone primaire du pouce.

#### Mobile (< 640px)

Le tooltip monte en **position haute** (`top-24`), juste sous la zone FAB, dans la zone neutre du milieu d'écran.

```tsx
// Tooltip — mobile variant
// Position : top-24 (pas bottom), devant le canvas mais au-dessus de la zone nav

<AnimatePresence>
  {hoveredEntry && !selectedId && (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.95 }}
      transition={{ type: 'spring', damping: 25, stiffness: 350 }}
      className="
        fixed top-24 left-4 right-4 z-20
        sm:left-1/2 sm:-translate-x-1/2 sm:max-w-sm
        lg:bottom-6 lg:top-auto   /* ← desktop : retour en bas */
        pointer-events-none
      "
    >
      <div className="
        bg-[#0f1011] border border-[#23252a]/60 rounded-xl
        px-4 py-3
        shadow-[0_8px_32px_-12px_rgba(0,0,0,0.6)]
      ">
        {/* Header: type dot + label + project tag */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: typeColor }} />
          <span className="text-[10px] font-semibold text-[#8a8f98]
            uppercase tracking-[0.06em]">
            {hoveredEntry.metadata.type || 'note'}
          </span>
          {hoveredEntry.metadata.project && (
            <span className="text-[9px] text-[#62666d] px-2 py-0.5
              rounded-md bg-[#23252a]">
              {hoveredEntry.metadata.project}
            </span>
          )}
        </div>

        {/* Body: texte tronqué à 2 lignes */}
        <p className="text-xs text-[#a1a1aa] leading-relaxed line-clamp-2">
          {hoveredEntry.text}
        </p>

        {/* Footer: timestamp discret */}
        <p className="text-[9px] text-[#52525b] font-mono mt-1.5">
          {hoveredEntry.id.slice(0, 12)}… · {relativeTime(hoveredEntry.metadata.timestamp || '')}
        </p>
      </div>
    </motion.div>
  )}
</AnimatePresence>
```

**Transition mobile → tablette → desktop :**

| Breakpoint | Position | Largeur | Animation entrée |
|------------|----------|---------|------------------|
| < 640px | `top-24 left-4 right-4` | 100% - 32px | Y: -8 → 0 |
| 640-1024px | `top-24 left-1/2 -translate-x-1/2` | `max-w-sm` | Y: -8 → 0 |
| > 1024px | `bottom-6 left-1/2 -translate-x-1/2` | `max-w-sm` | Y: +10 → 0 |

**Classes Tailwind précises pour le conteneur :**

```
fixed top-24 left-4 right-4 z-20
sm:left-1/2 sm:-translate-x-1/2 sm:max-w-sm
lg:bottom-6 lg:top-auto lg:left-1/2 lg:-translate-x-1/2
pointer-events-none
```

---

### 3.7 DetailPanel → Bottom Sheet plein écran (mobile)

**Problème actuel :** `max-w-sm` prend tout l'écran sur mobile → passe à `max-w-md` sur desktop mais aucun contrôle responsive.

#### Mobile (< 640px)

Le DetailPanel slide **depuis le bas** (pas depuis la droite) et occupe tout l'écran.

```tsx
// DetailPanel — mobile variant
// Slide depuis le bas, plein écran

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  className="fixed inset-0 z-30 bg-black/50"
  onClick={onClose}
/>

<motion.div
  initial={{ y: '100%' }}
  animate={{ y: 0 }}
  exit={{ y: '100%' }}
  transition={{ type: 'spring', damping: 28, stiffness: 300 }}
  className="
    fixed bottom-0 left-0 right-0 z-40
    max-h-[92vh]           /* ← pas tout l'écran : laisse voir un peu le canvas */
    bg-[#0f1011]
    border-t border-[#23252a]/80
    rounded-t-2xl
    shadow-[0_-12px_48px_-16px_rgba(0,0,0,0.6)]
    overflow-y-auto
    pb-[calc(56px+env(safe-area-inset-bottom,0px))]  /* espace pour nav */
    sm:max-w-sm sm:right-0 sm:top-0 sm:bottom-0 sm:left-auto   /* tablette : depuis la droite */
    sm:max-h-none sm:rounded-none sm:rounded-tl-none            /* tablette : plus de rounded */
    sm:border-l sm:border-t-0                                   /* tablette : bordure latérale */
    lg:max-w-md                                                 /* desktop : plus large */
  "
>
  {/* Handle visuel (mobile only) */}
  <div className="flex justify-center pt-3 pb-2 sm:hidden">
    <div className="w-8 h-1 rounded-full bg-[#23252a]" />
  </div>

  {/* Header (mobile : bordure visible) */}
  <div className="flex items-center justify-between px-5 pb-3 border-b border-[#23252a]/50">
    <button
      onClick={onClose}
      className="flex items-center gap-1.5 text-xs text-[#8a8f98]
        hover:text-[#f7f8f8] transition-colors"
    >
      <svg className="w-3.5 h-3.5" ... /> {/* chevron-left */}
      Retour
    </button>
    <button onClick={onClose} className="text-[#62666d] hover:text-[#f7f8f8]">
      <svg className="w-4 h-4" ... /> {/* X */}
    </button>
  </div>

  {/* Contenu (identique au desktop) */}
  <div className="p-5 space-y-4">
    <MemoryCard entry={entry} />
  </div>
</motion.div>
```

#### Tablette (640px → 1024px)

Le panel slide depuis la droite (comportement desktop) mais avec `max-w-sm` au lieu de `max-w-md`.

#### Desktop (> 1024px)

Inchangé — slide depuis la droite, `max-w-md`.

**Classes Tailwind précises pour le conteneur du panel :**

```
Composant           | Classe                                       | Breakpoint
--------------------|----------------------------------------------|------------------
Position            | fixed bottom-0 left-0 right-0 z-40           | base (mobile)
                    | sm:right-0 sm:top-0 sm:bottom-0 sm:left-auto | sm: (tablette+)
Hauteur             | max-h-[92vh]                                 | base (mobile)
                    | sm:max-h-none                                | sm: (tablette+)
Bordure haut        | border-t border-[#23252a]/80                 | base (mobile)
                    | sm:border-t-0                                | sm: (tablette+)
Bordure gauche      | sm:border-l sm:border-[#23252a]/80           | sm: (tablette+)
Arrondi             | rounded-t-2xl                                | base (mobile)
                    | sm:rounded-none                              | sm: (tablette+)
Largeur             | sm:max-w-sm                                  | sm: (tablette)
                    | lg:max-w-md                                  | lg: (desktop)
Ombres              | shadow-[0_-12px_48px_-16px_rgba(0,0,0,0.6)] | base (mobile)
                    | shadow-[-8px_0_32px_-12px_rgba(0,0,0,0.6)]  | sm: (tablette+)
```

---

### 3.8 SearchOverlay → Full-screen modal (mobile)

**Problème actuel :** L'overlay de recherche actuel est déjà bien conçu avec son overlay semi-transparent et ses résultats en cascade. Sur mobile, il suffit de l'ajuster pour occuper tout l'écran.

#### Mobile (< 640px)

```tsx
// SearchOverlay — ajustements mobile
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.15 }}
  className="
    fixed inset-0 z-50
    flex items-start justify-center
    pt-[4vh]                         /* moins de padding top sur mobile */
    sm:pt-[12vh]                     /* reprend le padding desktop */
  "
>
  {/* Overlay — ferme au tap */}
  <div className="absolute inset-0 bg-black/60" onClick={onClose} />

  {/* Conteneur — prend plus de largeur sur mobile */}
  <motion.div
    initial={{ y: -16, opacity: 0, scale: 0.96 }}
    animate={{ y: 0, opacity: 1, scale: 1 }}
    exit={{ y: -16, opacity: 0, scale: 0.96 }}
    transition={{ type: 'spring', damping: 28, stiffness: 320 }}
    className="
      relative z-10
      w-full
      mx-3 sm:mx-0                   /* marge latérale sur mobile */
      sm:max-w-lg                    /* centré large sur tablette+ */
    "
  >
    {/* Input + résultats — inchangé, juste les marges */}
    <div className="
      bg-[#0f1011] rounded-2xl overflow-hidden
      border border-[#23252a]/80
      shadow-[0_16px_48px_-12px_rgba(0,0,0,0.6)]
    ">
      {/* ... (même contenu que SearchOverlay actuel) */}
    </div>
  </motion.div>
</motion.div>
```

#### Desktop (> 1024px)

Inchangé — `pt-[12vh] max-w-lg`.

---

## 4. Tableau récapitulatif : positions par breakpoint

### 4.1 Composants visibles

| Composant | < 640px (mobile) | 640–1024px (tablette) | > 1024px (desktop) |
|-----------|------------------|----------------------|-------------------|
| **Canvas 3D** | `fixed inset-0` z-0 | `fixed inset-0` z-0 | `fixed inset-0` z-0 |
| **BottomSheetNav** | `fixed bottom-0 h-14` z-30 | Caché | Caché |
| **TypeFilter** | Caché → Drawer slide depuis bas | `fixed top-4 left-4` scrollable x | `fixed top-6 left-6` |
| **SearchBar** | Caché → FAB `top-4 right-4` w-10 h-10 | `fixed top-4 left-1/2` w-[320px] h-10 | `fixed top-6 left-1/2` w-[420px] h-11 |
| **StatsBadge** | Caché → Drawer slide depuis bas | Fusionné avec LegendBar (bottom-4 left-4) | `fixed top-6 right-6` |
| **LegendBar** | Intégré au Drawer TypeFilter | Fusionné avec StatsBadge (bottom-4 left-4) | `fixed bottom-6 left-6` |
| **Tooltip** | `fixed top-24 left-4 right-4` | `fixed top-24 left-1/2 -translate-x-1/2 max-w-sm` | `fixed bottom-6 left-1/2 -translate-x-1/2 max-w-sm` |
| **DetailPanel** | Slide depuis bas, plein écran | Slide depuis droite, max-w-sm | Slide depuis droite, max-w-md |
| **SearchOverlay** | Full-screen, `mx-3`, `pt-[4vh]` | `sm:pt-[12vh] sm:max-w-lg` | `max-w-lg pt-[12vh]` |

### 4.2 Visibilité conditionnelle (classes Tailwind)

```
Composant               | Visible mobile     | Visible tablette    | Visible desktop
------------------------|--------------------|--------------------|--------------------
BottomSheetNav          | block (base)       | sm:hidden          | lg:hidden
FAB Search              | block (base)       | sm:hidden          | lg:hidden
SearchBar (bouton)      | hidden             | sm:flex            | lg:flex (repick)
TypeFilter pills        | hidden             | sm:block           | lg:block
TypeFilter drawer       | block quand ouvert | N/A                | N/A
StatsBadge              | hidden             | sm:block           | lg:block
Stats drawer            | block quand ouvert | N/A                | N/A
LegendBar (autonome)    | hidden (intégrée)  | sm:block (fusionné)| lg:block
Tooltip                 | block (base)       | sm:block           | lg:block (repos)
DetailPanel             | block (base)       | sm:variant         | lg:variant
SearchOverlay           | block (base)       | sm:variant         | lg:variant
```

---

## 5. Interactions tactiles

### 5.1 Geste → Action (mobile)

| Geste | Action | Détails techniques |
|-------|--------|--------------------|
| **Touch drag** (1 doigt, espace vide) | Rotation scène 3D | `OrbitControls` — `enableRotate: true`, `rotateSpeed: 1.2` (plus rapide que desktop pour compenser la faible précision) |
| **Pinch** (2 doigts) | Zoom avant/arrière | `OrbitControls` — `zoomSpeed: 1.5`, `minDistance: 5`, `maxDistance: 25` |
| **Touch drag** (2 doigts) | Pan (déplacement latéral) | `OrbitControls` — `enablePan: true`, `panSpeed: 0.5` (plus lent que le zoom) |
| **Tap** (simple) sur nœud | Sélection / désélection | Déclenche le panel détail + fly-to caméra |
| **Tap** (simple) sur espace vide | Rien (laisse passer la rotation) | Pas de sélection accidentelle |
| **Double-tap** sur espace vide | Reset caméra | Retour à la position par défaut (z=10, centre 0,0,0) |
| **Swipe down** sur drawer/panel ouvert | Fermer le drawer | Geste natif via `drag="y"` Framer Motion + `dragConstraints` |
| **Tap** sur overlay (semi-transparent) | Fermer le drawer/panel | `onClick={onClose}` sur l'overlay |
| **Touch hold** (long press) sur nœud | Preview rapide | Affiche le tooltip (haut d'écran) sans ouvrir le panel |

### 5.2 Configuration OrbitControls mobile

```tsx
// neuron-scene.tsx — ajustements OrbitControls pour mobile
<OrbitControls
  ref={controlsRef}
  enablePan
  enableDamping
  dampingFactor={0.08}        /* ← plus de damping sur mobile (0.05 → 0.08) pour éviter l'effet flottant */
  minDistance={5}
  maxDistance={25}
  autoRotate={selectedId === null}
  autoRotateSpeed={0.3}       /* ← légèrement plus rapide que desktop (0.2 → 0.3) */
  rotateSpeed={1.2}           /* ← plus rapide que desktop (0.6 → 1.2) pour le touch */
  zoomSpeed={1.5}             /* ← zoom plus réactif */
  enableTouchRotate           /* ← activé par défaut dans drei */
/>
```

### 5.3 Prévention du conflit canvas ↔ UI mobile

```css
/* Dans globals.css — pour éviter que les gestes tactiles de la UI ne passent au canvas */

/* La BottomSheetNav et les drawers captent leurs propres gestes */
nav, [role="dialog"], [role="drawer"] {
  touch-action: pan-y;           /* autorise le scroll vertical dans les listes */
}

/* Le canvas DOIT recevoir les gestes tactiles */
canvas {
  touch-action: none;            /* tous les gestes vont au canvas */
  -webkit-touch-callout: none;   /* pas de popup contextuel iOS */
}

/* Les boutons de la BottomSheetNav */
nav button {
  touch-action: manipulation;    /* pas de double-tap zoom */
}
```

### 5.4 Swipe-to-close pour les drawers (Framer Motion)

```tsx
// Pattern générique pour tous les drawers mobiles
// Utiliser Framer Motion avec drag="y" pour le swipe down

<motion.div
  initial={{ y: '100%' }}
  animate={{ y: 0 }}
  exit={{ y: '100%' }}
  transition={{ type: 'spring', damping: 28, stiffness: 320 }}
  drag="y"
  dragConstraints={{ top: 0, bottom: 0 }}
  dragElastic={0.2}
  onDragEnd={(_, info) => {
    if (info.offset.y > 100) {
      onClose();  // swipe down > 100px → ferme
    }
  }}
  className="..."
>
```

### 5.5 Optimisation du hitbox tactile

```tsx
// Dans GlowNode, augmenter le hitbox pour le touch
// Le rayon du hitbox passe de baseSize*2.2 à baseSize*3.0 sur mobile

// neuron-scene.tsx — hitbox conditionnel
const hitboxRadius = isMobile
  ? Math.max(baseSize * 3.0, 0.6)   // mobile : hitbox plus large
  : Math.max(baseSize * 2.2, 0.4);  // desktop : hitbox standard

// Détection mobile (custom hook)
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}
```

---

## 6. Globals.css — Ajouts responsives

```css
/* --- À AJOUTER À globals.css --- */

/* Mobile tap highlight suppression */
.tap-highlight-transparent {
  -webkit-tap-highlight-color: transparent;
}

/* Safe area pour iPhone notch */
.pb-safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
.pt-safe-area-top {
  padding-top: env(safe-area-inset-top, 0px);
}

/* Canvas touch — tous les gestes au canvas, pas à l'UI */
canvas {
  touch-action: none;
  -webkit-touch-callout: none;
}

/* UI zones — uniquement scroll vertical */
nav, [role="dialog"], [role="drawer"] {
  touch-action: pan-y;
}

/* Boutons — pas de zoom par double-tap */
nav button {
  touch-action: manipulation;
}

/* Masquer scrollbar sur mobile/tablette tout en gardant le scroll */
.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-none::-webkit-scrollbar {
  display: none;
}

/* Réduction d'animation — déjà présent, juste ajouter les nouvelles classes */
@media (prefers-reduced-motion: reduce) {
  .animate-slide-up,
  .animate-slide-down,
  .animate-fade-in {
    animation: none !important;
  }
}
```

---

## 7. Hiérarchie d'information progressive

### 7.1 Principe « telescopique »

```
Vue d'ensemble           → Zoom dans un cluster     → Détail d'un nœud
(Scene 3D + Tooltip)       (Filtre par type)           (Panel détail)
     ↓                            ↓                         ↓
  PRIORITÉ 1                  PRIORITÉ 2               PRIORITÉ 3
  Visible immédiatement       Après tap sur             Après tap sur
  sans interaction            icône Filtres             un nœud
```

### 7.2 Ce qui est visible à chaque niveau

| Niveau | Mobile (< 640px) | Pourquoi |
|--------|------------------|----------|
| **Toujours visible** | Canvas 3D plein écran + FAB Search + BottomSheetNav | Expérience immersive immédiate — le canvas est le héros |
| **1 tap** | Drawer TypeFilter (avec légende intégrée) | Filtrer est la première action — l'utilisateur doit pouvoir réduire le bruit visuel |
| **1 tap** | Drawer Stats | Voir l'état de l'espace mémoire (stats, répartition) |
| **1 tap** | SearchOverlay | Chercher un contenu spécifique |
| **1 tap sur nœud** | DetailPanel (bottom sheet) | Voir le contenu complet d'une mémoire |
| **Survol** (touch hold) | Tooltip (haut d'écran) | Aperçu rapide sans ouvrir le panel |

### 7.3 Règles de progressive disclosure

```
1. Sur l'écran d'accueil : montrer UNIQUEMENT
   → Canvas 3D (interagissable)
   → FAB Search (top-right)
   → BottomSheetNav (3 icônes)
   → (optionnel) Welcome message qui disparaît

2. Pas de stats visibles en permanence
   → C'est de l'info secondaire, pas bloquante

3. Pas de légende visible en permanence
   → Les couleurs des nœuds sont intuitives
   → La légende n'est utile qu'au moment du filtre

4. Pas de barre de recherche texte en permanence
   → La recherche est un mode, pas un état permanent

5. Le tooltip de survol apparaît EN HAUT
   → Pas en conflit avec la zone pouce/nav
   → Visible sans obstruer le canvas principal
```

### 7.4 Transitions sémantiques

| Changement d'état | Animation | Mobile spécifique |
|-------------------|-----------|-------------------|
| **Navigation → Filtre** | Drawer slide up (spring) + overlay fade | Drawer depuis le bas |
| **Navigation → Recherche** | Full modal avec input auto-focus | Ouvert via FAB tap |
| **Navigation → Stats** | Drawer slide up (spring) | Drawer depuis le bas |
| **Navigation → Détail** | Panel slide up (spring) + overlay | Bottom sheet (pas depuis la droite) |
| **Navigation → Survol** | Tooltip fade/slide down (haut) | Depuis le haut, pas le bas |
| **Filtre → Navigation** | Drawer slide down + overlay fade | Swipe down géré |
| **Détail → Navigation** | Panel slide down | Swipe down géré |

---

## Références

- **CONCEPTION_UX.md** — Design system complet (desktop-first)
- **DESIGN_SYSTEM.md** — Tokens de couleurs, espacements, radius
- **src/app/globals.css** — Styles existants
- **src/components/** — Composants existants à modifier

> **Document :** Synapse Mobile-First Redesign v1.0
> **Designer :** Apex (Orion)
> **Statut :** ✅ Conception terminée
> **Prochaine étape :** Implémentation — commencer par BottomSheetNav + TypeFilterDrawer
