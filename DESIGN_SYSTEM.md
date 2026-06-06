# 🪐 Synapse Design System — « Cosmos de la mémoire »

> **Concept :** Un espace profond où chaque connaissance est un astre lumineux. Les nœuds sont des étoiles, planètes et galaxies miniatures ; les arêtes sont des filaments cosmiques. L'interface est un observatoire céleste minimaliste — noir spatial, lueurs chaudes, zéro bruit visuel.
>
> **Inspirations (différenciées) :** Refero research — Linear dark (structure), Cursor warm paper (chaleur), ElevenLabs (orbs décoratifs), Vercel (précision). Mais ici, tout est **cosmique** : la palette n'est ni chaude-papier ni froide-industrielle — elle est **noir spatial + lueurs stellaires**.
>
> **Statut :** Fondation. Prêt pour implémentation Tailwind v4 + CSS + Three.js/R3F.

---

## Table des matières

1. [Palette complète (15 couleurs nommées)](#1-palette-complète)
2. [Typographie](#2-typographie)
3. [Échelle d'espacements](#3-échelle-despacements)
4. [Radius system](#4-radius-system)
5. [Traitement des nœuds 3D](#5-traitement-des-nœuds-3d)
6. [Traitement des arêtes](#6-traitement-des-arêtes)
7. [Composants UI](#7-composants-ui)
8. [Animations et transitions](#8-animations-et-transitions)
9. [Règles Do / Don't](#9-règles-do--dont)

---

## 1. Palette complète

### Principe

La palette Synapse n'est **ni chaude-papier** (Cursor/Anthropic), **ni froide-industrielle** (Linear/Vercel). C'est un **noir spatial profond** avec des **lueurs stellaires chaudes**. Le fond est un vide cosmique — les couleurs vives sont réservées aux astres (nœuds) et à la navigation critique.

### Neutres (9 niveaux — fond cosmique → texte stellaire)

La surface la plus profonde (`#07070a` — Void Black) n'est pas du #000 pur : c'est un noir légèrement violacé, comme l'espace interstellaire réel.

| Nom | Hex | Oklch | Token CSS | Classe Tailwind | Rôle |
|-----|-----|-------|-----------|-----------------|------|
| **Void Black** | `#07070a` | `oklch(0.02 0.008 290)` | `--syn-void` | `bg-void` | Page canvas — fond cosmique le plus profond |
| **Nebula Black** | `#0c0c12` | `oklch(0.035 0.01 280)` | `--syn-nebula` | `bg-nebula` | Surface primaire (nav, cartes) |
| **Void Shadow** | `#11111a` | `oklch(0.05 0.012 275)` | `--syn-void-shadow` | `bg-void-shadow` | Cartes secondaires, panels |
| **Crater Gray** | `#1a1a26` | `oklch(0.08 0.015 270)` | `--syn-crater` | `bg-crater` | Surfaces tertiaires, inputs bg |
| **Meteor Gray** | `#28283a` | `oklch(0.12 0.018 265)` | `--syn-meteor` | `bg-meteor` | Borders, hr, outlines |
| **Dust Gray** | `#3d3d55` | `oklch(0.18 0.02 260)` | `--syn-dust` | `bg-dust` | Muted borders, placeholder |
| **Stardust** | `#6a6a85` | `oklch(0.32 0.022 255)` | `--syn-stardust` | `text-stardust` | Texte tertiaire, disabled |
| **Orbit Gray** | `#9e9eb8` | `oklch(0.50 0.025 250)` | `--syn-orbit` | `text-orbit` | Texte secondaire |
| **Starlight** | `#e8e8f0` | `oklch(0.82 0.01 260)` | `--syn-starlight` | `text-starlight` | **Texte primaire** — blanc stellaire légèrement bleuté |

### Couleurs chromatiques (5 couleurs — lueurs stellaires)

| Nom | Hex | Oklch | Token CSS | Classe Tailwind | Rôle |
|-----|-----|-------|-----------|-----------------|------|
| **Solar Flare** | `#ff6b35` | `oklch(0.62 0.18 45)` | `--syn-solar` | `text-solar` / `bg-solar` | **Accent primaire** — CTA unique, étoile active, hot nodes |
| **Nova Pink** | `#ff2d78` | `oklch(0.58 0.22 355)` | `--syn-nova` | `text-nova` / `bg-nova` | **Accent secondaire** — nœuds récents, highlights créatifs |
| **Plasma Cyan** | `#00d4c8` | `oklch(0.72 0.14 185)` | `--syn-plasma` | `text-plasma` / `bg-plasma` | **Arêtes actives** — connexions vivantes |
| **Deep Indigo** | `#6c5ce7` | `oklch(0.48 0.16 275)` | `--syn-indigo` | `text-indigo` / `bg-indigo` | **Nœuds catégorisés** — tags, clusters |
| **Solar White** | `#fff4e5` | `oklch(0.95 0.02 80)` | `--syn-solar-white` | `text-solar-white` | Texte **sur fond Solar Flare** |

### Couleurs sémantiques (3 couleurs)

| Nom | Hex | Oklch | Token CSS | Classe Tailwind | Rôle |
|-----|-----|-------|-----------|-----------------|------|
| **Emerald Orbit** | `#34d399` | `oklch(0.72 0.16 160)` | `--syn-success` | `text-success` / `bg-success` | Succès, connecté, synced |
| **Red Giant** | `#ef4444` | `oklch(0.58 0.22 25)` | `--syn-error` | `text-error` / `bg-error` | Erreur, déconnecté, critique |
| **Solar Yellow** | `#eab308` | `oklch(0.72 0.16 95)` | `--syn-warning` | `text-warning` / `bg-warning` | Avertissement, attention |
| **Nebula Blue** | `#60a5fa` | `oklch(0.62 0.14 240)` | `--syn-info` | `text-info` / `bg-info` | Information, indice |

### Glow tokens (lueurs pour effets CSS)

Ces tokens ne sont pas des couleurs de fond/text — ce sont des valeurs `box-shadow` et `filter: drop-shadow()` pour les effets de glow cosmique.

| Nom | Valeur | Token CSS | Usage |
|-----|--------|-----------|-------|
| **Glow Solar** | `0 0 12px rgba(255, 107, 53, 0.4), 0 0 40px rgba(255, 107, 53, 0.15)` | `--syn-glow-solar` | Étoile active, CTA hover |
| **Glow Nova** | `0 0 12px rgba(255, 45, 120, 0.35), 0 0 40px rgba(255, 45, 120, 0.12)` | `--syn-glow-nova` | Nœud récent, highlight créatif |
| **Glow Plasma** | `0 0 10px rgba(0, 212, 200, 0.35), 0 0 35px rgba(0, 212, 200, 0.1)` | `--syn-glow-plasma` | Arête active |
| **Glow Indigo** | `0 0 10px rgba(108, 92, 231, 0.3), 0 0 30px rgba(108, 92, 231, 0.1)` | `--syn-glow-indigo` | Nœud cluster |
| **Glow Soft** | `0 0 6px rgba(255, 255, 255, 0.08), 0 0 20px rgba(255, 255, 255, 0.03)` | `--syn-glow-soft` | Hover générique, lueur ambiante |

### Exemple d'implémentation Tailwind v4

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  /* Neutres cosmiques */
  --color-void: #07070a;
  --color-nebula: #0c0c12;
  --color-void-shadow: #11111a;
  --color-crater: #1a1a26;
  --color-meteor: #28283a;
  --color-dust: #3d3d55;
  --color-stardust: #6a6a85;
  --color-orbit: #9e9eb8;
  --color-starlight: #e8e8f0;

  /* Couleurs stellaires */
  --color-solar: #ff6b35;
  --color-nova: #ff2d78;
  --color-plasma: #00d4c8;
  --color-indigo: #6c5ce7;
  --color-solar-white: #fff4e5;

  /* Sémantiques */
  --color-success: #34d399;
  --color-error: #ef4444;
  --color-warning: #eab308;
  --color-info: #60a5fa;
}
```

---

## 2. Typographie

### Philosophy

Synapse utilise **Outfit** comme police principale — une géométrique humaniste avec une personnalité spatiale : formes rondes comme des orbites, ouvertures larges, claire en toutes tailles. En fallback : **Inter**.

**Pourquoi Outfit ?** Plus chaleureux que Inter, plus lisible que Geist, plus distinctif que Space Grotesk. Ses courbes évoquent des trajectoires orbitales.

### Police primaire : Outfit

| Propriété | Valeur |
|-----------|--------|
| **Font family** | `"Outfit", "Inter", ui-sans-serif, system-ui, sans-serif` |
| **Weights** | 300 (Light), 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold) |
| **Fichier** | Google Fonts / auto-captured via `@fontsource/outfit` |

### Police mono : JetBrains Mono

| Propriété | Valeur |
|-----------|--------|
| **Font family** | `"JetBrains Mono", "Fira Code", ui-monospace, monospace` |
| **Weights** | 400 (Regular), 500 (Medium) |
| **Usage** | IDs de nœuds, keyboard shortcuts, code, métadonnées, timestamps |

### Type scale cosmique

Échelle **Perfect Fourth (1.25)** à partir de 14px de base — crée une progression ample et aérée, comme les distances planétaires.

| Niveau | Taille | Line-height | Weight | Tracking | Usage | Classe Tailwind |
|--------|--------|-------------|--------|----------|-------|-----------------|
| **Caption** | 11px | 1.3 | 400 | 0.04em | Badges, timestamps, labels mini | `text-caption` |
| **Small** | 12px | 1.4 | 400 | 0.02em | Métadonnées, dates | `text-small` |
| **Meta** | 13px | 1.45 | 500 | 0.01em | Labels UI, nav secondaire | `text-meta` |
| **Body** | 14px | 1.6 | 400 | normal | **Texte de base** | `text-body` |
| **Body Large** | 16px | 1.65 | 400 | normal | Paragraphes, descriptions | `text-body-lg` |
| **Subtitle** | 18px | 1.5 | 500 | -0.01em | Sous-titres, meta importantes | `text-subtitle` |
| **Heading 4** | 20px | 1.4 | 600 | -0.01em | Titres de panels, card titles | `text-h4` |
| **Heading 3** | 24px | 1.35 | 600 | -0.015em | Section headers | `text-h3` |
| **Heading 2** | 30px | 1.3 | 600 | -0.02em | Page titles | `text-h2` |
| **Heading 1** | 38px | 1.25 | 600 | -0.025em | Écrans principaux | `text-h1` |
| **Display** | 48px | 1.15 | 300 | -0.03em | Hero, titres de section larges | `text-display` |
| **Cosmic** | 60px | 1.1 | 300 | -0.035em | Grands titres, branding, espace | `text-cosmic` |

> **Note :** Les tracking négatifs augmentent avec la taille — proportionnels, pas linéaires. Les grands titres utilisent weight 300 (Light) pour un effet « flottant dans l'espace ».

### Exemple d'implémentation Tailwind v4

```css
@theme {
  --font-sans: "Outfit", "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", "Fira Code", ui-monospace, monospace;

  --font-size-caption: 0.6875rem;
  --font-size-caption--line-height: 1.3;
  --font-size-caption--letter-spacing: 0.04em;
  --font-size-small: 0.75rem;
  --font-size-small--line-height: 1.4;
  --font-size-small--letter-spacing: 0.02em;
  --font-size-meta: 0.8125rem;
  --font-size-meta--line-height: 1.45;
  --font-size-meta--letter-spacing: 0.01em;
  --font-size-body: 0.875rem;
  --font-size-body--line-height: 1.6;
  --font-size-body-lg: 1rem;
  --font-size-body-lg--line-height: 1.65;
  --font-size-subtitle: 1.125rem;
  --font-size-subtitle--line-height: 1.5;
  --font-size-subtitle--letter-spacing: -0.01em;
  --font-size-h4: 1.25rem;
  --font-size-h4--line-height: 1.4;
  --font-size-h4--letter-spacing: -0.01em;
  --font-size-h3: 1.5rem;
  --font-size-h3--line-height: 1.35;
  --font-size-h3--letter-spacing: -0.015em;
  --font-size-h2: 1.875rem;
  --font-size-h2--line-height: 1.3;
  --font-size-h2--letter-spacing: -0.02em;
  --font-size-h1: 2.375rem;
  --font-size-h1--line-height: 1.25;
  --font-size-h1--letter-spacing: -0.025em;
  --font-size-display: 3rem;
  --font-size-display--line-height: 1.15;
  --font-size-display--letter-spacing: -0.03em;
  --font-size-cosmic: 3.75rem;
  --font-size-cosmic--line-height: 1.1;
  --font-size-cosmic--letter-spacing: -0.035em;
}
```

---

## 3. Échelle d'espacements

### Principe : « Orbital Spacing »

Les espacements suivent une séquence **arithmético-géométrique** : pas de 2px pour les petits, pas de 4px pour les moyens, pas de 8px pour les grands. Les valeurs sont nommées comme des orbites planétaires.

| Token | Valeur | Classe Tailwind | Usage |
|-------|--------|-----------------|-------|
| `--syn-space-orbit-1` | 2px | `space-orbit-1` / `p-orbit-1` | Micro-ajustements, inner padding de badges |
| `--syn-space-orbit-2` | 4px | `space-orbit-2` | Gaps entre icône et texte dans un tag |
| `--syn-space-orbit-3` | 6px | `space-orbit-3` | Padding interne des petits composants |
| `--syn-space-orbit-4` | 8px | `space-orbit-4` | Gap standard entre éléments dans un row |
| `--syn-space-orbit-5` | 12px | `space-orbit-5` | Padding interne des boutons, inputs |
| `--syn-space-orbit-6` | 16px | `space-orbit-6` | Gap entre sections dans une card, padding card |
| `--syn-space-orbit-7` | 20px | `space-orbit-7` | Padding card large, gap entre items de liste |
| `--syn-space-orbit-8` | 24px | `space-orbit-8` | Gap entre sections de page |
| `--syn-space-orbit-9` | 32px | `space-orbit-9` | Margin entre composants majeurs |
| `--syn-space-orbit-10` | 40px | `space-orbit-10` | Section padding vertical |
| `--syn-space-orbit-11` | 48px | `space-orbit-11` | Large section gap |
| `--syn-space-orbit-12` | 64px | `space-orbit-12` | Hero padding, écran complet |
| `--syn-space-orbit-13` | 80px | `space-orbit-13` | Page section break |
| `--syn-space-orbit-14` | 96px | `space-orbit-14` | Maximum — grands espaces de respiration |

### Implémentation Tailwind v4

```css
@theme {
  /* Orbital spacing scale */
  --spacing-orbit-1: 2px;
  --spacing-orbit-2: 4px;
  --spacing-orbit-3: 6px;
  --spacing-orbit-4: 8px;
  --spacing-orbit-5: 12px;
  --spacing-orbit-6: 16px;
  --spacing-orbit-7: 20px;
  --spacing-orbit-8: 24px;
  --spacing-orbit-9: 32px;
  --spacing-orbit-10: 40px;
  --spacing-orbit-11: 48px;
  --spacing-orbit-12: 64px;
  --spacing-orbit-13: 80px;
  --spacing-orbit-14: 96px;
}
```

---

## 4. Radius system

### Principe : « Celestial Curvature »

Les radius suivent une échelle précise qui évoque les formes célestes — du micro-arrondi (poussière d'étoile) au circulaire parfait (planètes).

| Token | Valeur | Usage | Classe Tailwind | Exemple |
|-------|--------|-------|-----------------|---------|
| `--syn-radius-dust` | 0px | **Zéro radius** — badges statut, tags data | `rounded-dust` | Badge « connected », tag inactif |
| `--syn-radius-meteor` | 2px | Micro-arrondi — coin de tooltip, inner shadow | `rounded-meteor` | Tooltip corner |
| `--syn-radius-crater` | 4px | Input fields, search bar, selects | `rounded-crater` | Search bar, input text |
| `--syn-radius-orbit` | 6px | Boutons, small cards, dropdowns | `rounded-orbit` | Primary button, dropdown menu |
| `--syn-radius-nebula` | 8px | Cards standards, modals, panels | `rounded-nebula` | Detail panel, card |
| `--syn-radius-stellar` | 12px | Large cards, elevated panels, containers | `rounded-stellar` | Graph container, full panel |
| `--syn-radius-galaxy` | 16px | Hero containers, large modals | `rounded-galaxy` | Feature card, hero section |
| `--syn-radius-planet` | 24px | Floating elements, orbs décoratifs | `rounded-planet` | Node glow rings |
| `--syn-radius-celestial` | 9999px | **Pill** — boutons pill, tags, badges | `rounded-celestial` | Nav tags, mode toggle |

### Implémentation Tailwind v4

```css
@theme {
  --radius-dust: 0px;
  --radius-meteor: 2px;
  --radius-crater: 4px;
  --radius-orbit: 6px;
  --radius-nebula: 8px;
  --radius-stellar: 12px;
  --radius-galaxy: 16px;
  --radius-planet: 24px;
  --radius-celestial: 9999px;
}
```

---

## 5. Traitement des nœuds 3D

### Principe : « Stellar Bodies »

Chaque nœud dans l'espace 3D Synapse est un **corps céleste** — étoile, planète, ou lune selon son type et état. La taille, la couleur, la lueur et l'animation sont déterminées par des tokens précis.

### 5.1 Taille des nœuds

Les nœuds ont 4 tailles, basées sur leur **importance sémantique** (pas leur degré — c'est le contenu qui prime).

| Type | Diamètre 3D (unités Three.js) | Rayon | Classe CSS | Usage |
|------|-------------------------------|-------|------------|-------|
| **Star** (nœud central actif) | 1.2u | 0.6u | `node-star` | Nœud sélectionné, focus actuel |
| **Planet** (nœud standard) | 0.8u | 0.4u | `node-planet` | Nœud de connaissance, mémoire |
| **Moon** (nœud satellite) | 0.5u | 0.25u | `node-moon` | Tag, propriété, sous-mémoire |
| **Dwarf** (nœud miniature) | 0.3u | 0.15u | `node-dwarf` | Métadonnée, timestamp, lien faible |

### 5.2 Couleurs des nœuds

Les couleurs des nœuds suivent la palette stellaire. Un nœud peut avoir une **couleur primaire** et une **couleur de glow** (souvent plus saturée).

| Type de nœud | Couleur primaire | Couleur glow | Token glow | Hex | Usage |
|-------------|------------------|-------------|------------|-----|-------|
| **Active / Focus** | `--syn-solar` | `--syn-glow-solar` | Solar Flare | `#ff6b35` | Nœud sélectionné, recherche en cours |
| **Recent / New** | `--syn-nova` | `--syn-glow-nova` | Nova Pink | `#ff2d78` | Nœud créé < 24h |
| **Category / Group** | `--syn-indigo` | `--syn-glow-indigo` | Deep Indigo | `#6c5ce7` | Nœud cluster, groupe |
| **Connected / Synced** | `--syn-success` | (soft green glow) | Emerald Orbit | `#34d399` | Nœud synchronisé |
| **Default / Neutral** | `--syn-starlight` | `--syn-glow-soft` | Starlight | `#e8e8f0` | Nœud standard |
| **Edge / Peripheral** | `--syn-stardust` | `--syn-glow-soft` (weaker) | Stardust | `#6a6a85` | Nœud faible, distant |
| **Error / Critical** | `--syn-error` | (red glow) | Red Giant | `#ef4444` | Nœud en erreur |

### 5.3 Lueur (Glow) — matériau Three.js

Le glow d'un nœud est composé de **deux couches** :

```
Couche 1 (inner glow) : Sphère principale + émission
  - MeshStandardMaterial avec emissive = couleur primaire
  - emissiveIntensity: [0.3 (dwarf) → 0.8 (star)]
  - emissive: couleur × 0.6 (atténuée)

Couche 2 (outer glow) : Sphère transparente + bloom
  - Sphère légèrement plus grande (×1.4)
  - MeshBasicMaterial, transparent, opacity: 0.08-0.15
  - Post-process bloom (EffectComposer + UnrealBloomPass)
    - strength: 0.5
    - radius: 0.2
    - threshold: 0.1
```

```typescript
// Exemple : Material d'un nœud actif (Star)
const starMaterial = new THREE.MeshStandardMaterial({
  color: 0xff6b35,        // Solar Flare
  emissive: 0xcc5522,     // Solar Flare atténué
  emissiveIntensity: 0.8,
  metalness: 0.1,
  roughness: 0.3,
});

const glowMaterial = new THREE.MeshBasicMaterial({
  color: 0xff6b35,
  transparent: true,
  opacity: 0.12,
  side: THREE.BackSide,
});

// Sphère de glow (×1.4 de la taille du nœud)
const glowGeometry = new THREE.SphereGeometry(0.84, 32, 32); // 0.6 * 1.4
```

### 5.4 Animations des nœuds

Chaque nœud a un **comportement orbital** unique — léger mouvement perpétuel pour suggérer la vie cosmique.

| Propriété | Star | Planet | Moon | Dwarf |
|-----------|------|--------|------|-------|
| **Float (oscillation Y)** | `sin(t × 0.8) × 0.08` | `sin(t × 0.6) × 0.05` | `sin(t × 1.0) × 0.03` | aucun |
| **Rotation** | auto-rotation lente `0.2 rad/s` | aucune | orbite autour du parent | aucune |
| **Pulse (scale breathing)** | `1 + sin(t × 1.2) × 0.04` | `1 + sin(t × 0.8) × 0.03` | `1 + sin(t × 1.5) × 0.02` | aucun |
| **Glow pulse** | `0.6 + sin(t × 1.5) × 0.2` | `0.4 + sin(t × 1.0) × 0.15` | `0.3 + sin(t × 1.8) × 0.1` | aucun |

```typescript
// Animation chart — utiliser dans un useFrame() R3F
const pulse = 1 + Math.sin(time * 1.2) * 0.04;
const floatY = Math.sin(time * 0.8) * 0.08;
const glowIntensity = 0.6 + Math.sin(time * 1.5) * 0.2;
```

### 5.5 Rayonnement (particules ambiantes)

Autour des nœuds **Star** et **Planet**, un halo de 6-12 particules minuscules orbite doucement :

```typescript
// Config particules orbitales
const particleConfig = {
  count: 8,             // 8 particules
  radius: 1.0,          // rayon d'orbite (autour du nœud)
  speed: 0.3,           // vitesse orbitale
  size: 0.03,           // taille de chaque particule
  color: 0xff8c5a,      // couleur légèrement décalée
  opacity: 0.4,
};
```

### 5.6 Classes CSS pour nœuds (rendu 2D fallback / Canvas overlay)

```css
.node-star {
  width: 24px; height: 24px;
  border-radius: 9999px;
  background: var(--syn-solar);
  box-shadow: var(--syn-glow-solar);
  animation: node-pulse 2s ease-in-out infinite;
}
.node-planet {
  width: 16px; height: 16px;
  border-radius: 9999px;
  background: var(--syn-starlight);
  box-shadow: var(--syn-glow-soft);
}
.node-moon {
  width: 10px; height: 10px;
  border-radius: 9999px;
  background: var(--syn-stardust);
}
.node-dwarf {
  width: 6px; height: 6px;
  border-radius: 9999px;
  background: var(--syn-dust);
}
```

---

## 6. Traitement des arêtes

### Principe : « Cosmic Filaments »

Les arêtes entre nœuds sont des **filaments cosmiques** — traits fins, luminescents, qui relient les astres. Pas de lignes épaisses ni d'ombres portées.

### 6.1 Arêtes — propriétés de base

| Propriété | Valeur par défaut | Arête active | Arête faible |
|-----------|------------------|-------------|-------------|
| **Épaisseur** | 1px (0.01u en 3D) | 2px | 0.5px |
| **Couleur** | `oklch(0.4 0.02 260)` — Dust Gray | `--syn-plasma` (#00d4c8) | `oklch(0.18 0.02 260)` — Dust (faible) |
| **Opacité** | 0.3 | 0.6 | 0.15 |
| **Style** | solid line | dotted avec animation flow | solid |
| **Glow** | aucun | `var(--syn-glow-plasma)` | aucun |

### 6.2 Arêtes 3D — matériau Three.js

```typescript
// Arête standard
const edgeMaterial = new THREE.LineBasicMaterial({
  color: 0x3d3d55,      // Dust Gray
  opacity: 0.3,
  transparent: true,
});

// Arête active (filament lumineux)
const activeEdgeMaterial = new THREE.LineBasicMaterial({
  color: 0x00d4c8,      // Plasma Cyan
  opacity: 0.6,
  transparent: true,
});

// Arête avec flow animation (particules qui voyagent le long de l'arête)
// Option : LineDashedMaterial + dash animation
const flowEdgeMaterial = new THREE.LineDashedMaterial({
  color: 0x00d4c8,
  dashSize: 0.2,
  gapSize: 0.3,
  opacity: 0.5,
  transparent: true,
});
```

### 6.3 Animation « data flow » sur les arêtes

Les arêtes actives ont un **effet de flux de données** — une particule lumineuse voyage le long du trait.

```typescript
// Animation data flow : déplacement de `dashOffset`
// Dans un useFrame() :
const flowSpeed = 0.5; // unités par seconde
material.dashOffset = time * flowSpeed;

// Particule voyageuse (optionnel — point lumineux)
// Lerp le long de l'arête
const t = (Math.sin(time * flowSpeed) + 1) / 2; // 0 → 1 → 0
const particlePos = new THREE.Vector3().lerpVectors(startPos, endPos, t);
```

### 6.4 Variantes d'arêtes

| Type | Apparence | Usage |
|------|-----------|-------|
| **Solid** | Trait continu, opacité 0.3 | Connexion standard entre nœuds proches |
| **Dotted** | Points espacés `4px 6px` | Connexion faible, relation indirecte |
| **Dashed** | Tirets `8px 4px` | Connexion temporaire, en cours d'établissement |
| **Glowing** | Trait fin + glow plasma | Arête activement utilisée, navigation |
| **Dual-line** | Deux traits parallèles (épaisseur 0.5px chacun, gap 2px) | Connexion bidirectionnelle, forte |

### 6.5 Classes CSS pour arêtes (rendu 2D)

```css
.edge-solid {
  stroke: var(--syn-dust);
  stroke-width: 1;
  opacity: 0.3;
}
.edge-active {
  stroke: var(--syn-plasma);
  stroke-width: 2;
  opacity: 0.6;
  filter: drop-shadow(0 0 4px rgba(0, 212, 200, 0.4));
}
.edge-dotted {
  stroke: var(--syn-dust);
  stroke-width: 1;
  stroke-dasharray: 4 6;
  opacity: 0.25;
}
.edge-flow {
  stroke: var(--syn-plasma);
  stroke-width: 1.5;
  stroke-dasharray: 8 12;
  opacity: 0.5;
  animation: edge-flow 3s linear infinite;
}
@keyframes edge-flow {
  to { stroke-dashoffset: -20; }
}
```

---

## 7. Composants UI

### 7.1 Search Bar (« Cosmic Search »)

La barre de recherche est le **radiotélescope** de l'interface — elle scrute l'espace des mémoires.

| Propriété | Valeur |
|-----------|--------|
| **Background** | `var(--syn-crater)` — `#1a1a26` |
| **Border** | `1px solid var(--syn-meteor)` — `#28283a` |
| **Border (focus)** | `1px solid var(--syn-solar)` — `#ff6b35` |
| **Radius** | `var(--syn-radius-crater)` — `4px` |
| **Padding** | `10px 14px` (Y: orbit-4 + orbit-4, X: orbit-6 + orbit-6) |
| **Text** | `var(--syn-starlight)` — `#e8e8f0` |
| **Placeholder** | `var(--syn-stardust)` — `#6a6a85` |
| **Icon (left)** | Magnifying glass, `var(--syn-stardust)` |
| **Clear button (right)** | X icon, `var(--syn-orbit)` |
| **Glow (focus)** | `var(--syn-glow-solar)` — léger |
| **Height** | `40px` |
| **Transition** | `border-color 200ms ease, box-shadow 200ms ease` |

```tsx
// Composant SearchBar
<div className="
  flex items-center gap-orbit-2
  bg-crater border border-meteor
  rounded-crater px-orbit-6 py-orbit-4
  h-10
  has-[input:focus]:border-solar
  has-[input:focus]:shadow-[var(--syn-glow-solar)]
  transition-all duration-200
">
  <SearchIcon className="w-4 h-4 text-stardust" />
  <input
    type="text"
    placeholder="Chercher dans le cosmos…"
    className="
      flex-1 bg-transparent
      text-starlight placeholder:text-stardust
      text-body outline-none
    "
  />
  <button className="text-orbit hover:text-starlight transition-colors duration-150">
    <XIcon className="w-3.5 h-3.5" />
  </button>
</div>
```

### 7.2 Detail Panel (« Star Chart Panel »)

Le panneau de détails s'ouvre à droite (ou en overlay) quand on sélectionne un nœud.

| Propriété | Valeur |
|-----------|--------|
| **Background** | `var(--syn-nebula)` — `#0c0c12` |
| **Border (left)** | `1px solid var(--syn-meteor)` — `#28283a` |
| **Radius** | `var(--syn-radius-nebula)` — `8px` (ou 0 si latéral) |
| **Width** | `360px` (standard), `480px` (large) |
| **Padding** | `--syn-space-orbit-8` — `24px` |
| **Header** | Titre en `text-h4`, subtitle en `text-meta text-orbit` |
| **Body** | `text-body text-starlight` |
| **Tags row** | `flex gap-orbit-2 flex-wrap mt-orbit-5` |
| **Close button** | Top-right, `text-orbit hover:text-starlight` |
| **Divider** | `border-b border-meteor` |
| **Animation** | `translateX(20px) → 0, opacity 0 → 1, 300ms ease-out` |

```tsx
// Composant DetailPanel
<aside className="
  w-[360px] h-full
  bg-nebula border-l border-meteor
  p-orbit-8
  animate-panel-in
">
  {/* Header */}
  <div className="flex items-start justify-between mb-orbit-6">
    <div>
      <div className="flex items-center gap-orbit-2 mb-orbit-2">
        <span className="w-3 h-3 rounded-celestial bg-solar shadow-[var(--syn-glow-solar)]" />
        <h3 className="text-h4 text-starlight">Titre du nœud</h3>
      </div>
      <p className="text-meta text-orbit">ID: mem_7x3k ... • il y a 2h</p>
    </div>
    <button className="text-orbit hover:text-starlight transition-colors duration-150">
      <XIcon className="w-4 h-4" />
    </button>
  </div>

  {/* Body */}
  <p className="text-body text-starlight leading-relaxed mb-orbit-6">
    Contenu de la mémoire extraite du graphe…
  </p>

  {/* Tags */}
  <div className="flex gap-orbit-2 flex-wrap">
    <span className="tag">concept</span>
    <span className="tag">cosmos</span>
  </div>
</aside>
```

### 7.3 Tooltip (« Star Gaze Tooltip »)

Un tooltip minimal — planète lointaine qu'on observe.

| Propriété | Valeur |
|-----------|--------|
| **Background** | `var(--syn-void-shadow)` — `#11111a` |
| **Border** | `1px solid var(--syn-meteor)` — `#28283a` |
| **Radius** | `var(--syn-radius-meteor)` — `2px` |
| **Padding** | `6px 10px` (orbit-3 orbit-5) |
| **Text** | `text-small text-starlight` |
| **Arrow** | `8px` triangle, bottom/center, `var(--syn-void-shadow)` |
| **Max width** | `240px` |
| **Z-index** | `50` |
| **Animation** | `opacity 0 → 1, translateY(4px) → 0, 150ms ease-out` |
| **Delay** | `200ms` avant apparition (évite le flicker) |

```tsx
// Composant Tooltip
<div className="
  group relative inline-flex
">
  {children}
  <div className="
    absolute bottom-full left-1/2 -translate-x-1/2 mb-orbit-2
    px-orbit-5 py-orbit-3
    bg-void-shadow border border-meteor
    rounded-meteor
    text-small text-starlight
    whitespace-nowrap max-w-[240px]
    opacity-0 translate-y-1
    group-hover:opacity-100 group-hover:translate-y-0
    transition-all duration-150 ease-out
    delay-200 pointer-events-none z-50
  ">
    {label}
    <div className="
      absolute top-full left-1/2 -translate-x-1/2
      w-0 h-0
      border-l-[6px] border-r-[6px] border-t-[6px]
      border-l-transparent border-r-transparent
      border-t-[var(--syn-void-shadow)]
    " />
  </div>
</div>
```

### 7.4 Count Badge (« Nebula Badge »)

Petit badge de comptage — comme une étoile qui clignote au-dessus d'un nœud.

| Propriété | Valeur |
|-----------|--------|
| **Background** | `var(--syn-solar)` — `#ff6b35` (standard), `var(--syn-dust)` (muted) |
| **Text** | `var(--syn-solar-white)` — `#fff4e5` |
| **Radius** | `var(--syn-radius-celestial)` — `9999px` |
| **Padding** | `2px 6px` (orbit-1 orbit-3) |
| **Font** | `text-caption text-solar-white font-medium` |
| **Min width** | `18px` |
| **Height** | `16px` |
| **Position** | `absolute -top-1.5 -right-1.5` |
| **Glow** | `box-shadow: 0 0 4px rgba(255, 107, 53, 0.5)` |

```tsx
// Composant CountBadge
<span className="
  inline-flex items-center justify-center
  min-w-[18px] h-4
  px-orbit-3
  bg-solar text-solar-white
  text-caption font-medium
  rounded-celestial
  shadow-[0_0_4px_rgba(255,107,53,0.5)]
">
  {count}
</span>

// Variante muted (non prioritaire)
<span className="
  inline-flex items-center justify-center
  min-w-[16px] h-3.5
  px-orbit-2
  bg-dust text-orbit
  text-caption
  rounded-celestial
">
  {count}
</span>
```

### 7.5 Primary Button (« Launch CTA »)

| Propriété | Valeur |
|-----------|--------|
| **Background** | `var(--syn-solar)` — `#ff6b35` |
| **Text** | `var(--syn-solar-white)` — `#fff4e5` |
| **Radius** | `var(--syn-radius-orbit)` — `6px` |
| **Padding** | `10px 20px` (orbit-4 orbit-7) |
| **Font** | `text-meta font-medium` |
| **Hover bg** | `brightness(1.15)` — via `filter` ou couleur `#ff8555` |
| **Hover glow** | `var(--syn-glow-solar)` |
| **Active transform** | `scale(0.97)` |
| **Transition** | `all 150ms ease-out` |
| **Disabled** | `opacity: 0.4; cursor: not-allowed; filter: none` |

```tsx
<button className="
  inline-flex items-center justify-center gap-orbit-2
  px-orbit-7 py-orbit-4
  bg-solar text-solar-white
  text-meta font-medium
  rounded-orbit
  hover:brightness-110 hover:shadow-[var(--syn-glow-solar)]
  active:scale-[0.97]
  transition-all duration-150 ease-out
  disabled:opacity-40 disabled:cursor-not-allowed disabled:filter-none
">
  <RocketIcon className="w-4 h-4" />
  Lancer l'analyse
</button>

// Variante ghost (secondaire)
<button className="
  inline-flex items-center justify-center gap-orbit-2
  px-orbit-7 py-orbit-4
  bg-transparent text-starlight
  border border-meteor
  text-meta font-medium
  rounded-orbit
  hover:bg-crater hover:border-dust
  transition-all duration-150 ease-out
">
  Annuler
</button>
```

### 7.6 Tag / Chip

```tsx
<span className="
  inline-flex items-center gap-orbit-2
  px-orbit-4 py-orbit-2
  bg-crater text-orbit
  text-small
  rounded-celestial
  border border-meteor
">
  <span className="w-1.5 h-1.5 rounded-celestial bg-plasma" />
  mémoire
</span>
```

### 7.7 Divider

```tsx
<hr className="border-0 h-px bg-gradient-to-r from-transparent via-meteor to-transparent" />
```

---

## 8. Animations et transitions

### Principe : « Celestial Motion »

Toute animation Synapse doit sembler **naturelle, orbitale, légère** — comme des corps célestes en mouvement. Les easing sont organiques (cubic-bezier personnalisé), jamais linéaires.

### 8.1 Easing tokens

| Token | Valeur cubic-bezier | Usage |
|-------|---------------------|-------|
| `--syn-ease-cosmic` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Entrées — rebond léger, comme une orbite |
| `--syn-ease-stellar` | `cubic-bezier(0.22, 1, 0.36, 1)` | Sorties — décélération douce |
| `--syn-ease-float` | `cubic-bezier(0.45, 0, 0.55, 1)` | Mouvements perpétuels (float, pulse) |
| `--syn-ease-fade` | `cubic-bezier(0, 0, 0.2, 1)` | Fade in/out — accélération douce |

### 8.2 Duration tokens

| Token | Valeur | Usage |
|-------|--------|-------|
| `--syn-duration-instant` | `50ms` | Retours visuels micro (hover scale) |
| `--syn-duration-fast` | `150ms` | Tooltips, hover states |
| `--syn-duration-normal` | `250ms` | Transitions standard, panel slide |
| `--syn-duration-slow` | `400ms` | Page transitions, modal open |
| `--syn-duration-cosmic` | `800ms` | Grandes transitions, hero entrance |

### 8.3 Keyframe animations

```css
/* 1. Node pulse — respiration stellaire */
@keyframes node-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.06); opacity: 0.85; }
}

/* 2. Edge flow — données qui voyagent */
@keyframes edge-flow {
  to { stroke-dashoffset: -20; }
}

/* 3. Float — flottement orbital */
@keyframes orbital-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

/* 4. Glow pulse — lueur variable */
@keyframes glow-pulse {
  0%, 100% { box-shadow: 0 0 8px rgba(255, 107, 53, 0.3); }
  50% { box-shadow: 0 0 16px rgba(255, 107, 53, 0.5), 0 0 32px rgba(255, 107, 53, 0.15); }
}

/* 5. Panel slide in */
@keyframes panel-slide-in {
  from {
    transform: translateX(20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 6. Fade in — apparition cosmique */
@keyframes cosmic-fade-in {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 7. Spin — rotation lente (pour orbes décoratifs) */
@keyframes celestial-spin {
  to { transform: rotate(360deg); }
}

/* 8. Twinkle — scintillement d'étoile */
@keyframes twinkle {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}
```

### 8.4 Classes d'animation utilitaires

```css
.animate-node-pulse {
  animation: node-pulse 2.5s var(--syn-ease-float) infinite;
}
.animate-float {
  animation: orbital-float 3s var(--syn-ease-float) infinite;
}
.animate-glow-pulse {
  animation: glow-pulse 2s var(--syn-ease-float) infinite;
}
.animate-panel-in {
  animation: panel-slide-in 300ms var(--syn-ease-stellar) forwards;
}
.animate-fade-in {
  animation: cosmic-fade-in 400ms var(--syn-ease-cosmic) forwards;
}
.animate-twinkle {
  animation: twinkle 1.5s var(--syn-ease-float) infinite;
}
.animate-spin-slow {
  animation: celestial-spin 20s linear infinite;
}

/* Stagger children — apparition en cascade */
.stagger-children > * {
  opacity: 0;
  animation: cosmic-fade-in 400ms var(--syn-ease-cosmic) forwards;
}
.stagger-children > *:nth-child(1) { animation-delay: 0ms; }
.stagger-children > *:nth-child(2) { animation-delay: 80ms; }
.stagger-children > *:nth-child(3) { animation-delay: 160ms; }
.stagger-children > *:nth-child(4) { animation-delay: 240ms; }
.stagger-children > *:nth-child(5) { animation-delay: 320ms; }
.stagger-children > *:nth-child(6) { animation-delay: 400ms; }
/* Continue le pattern si besoin */
```

### 8.5 Three.js / R3F animation guidelines

```
Toute animation 3D DOIT utiliser :
  • useFrame() (R3F) ou requestAnimationFrame (vanilla Three.js)
  • Des deltas (clock.getDelta()) — PAS de framerate-dependent animation
  • Des easing functions importées (gsap, popmotion, ou math personnalisé)
  • Un cleanup dans useEffect return (dispose geometries, materials)

Framer Motion (pour UI 2D) :
  • variants avec { type: "spring", stiffness: 300, damping: 25 }
  • exit animations avec AnimatePresence
  • layoutId pour les transitions de layout
```

---

## 9. Règles Do / Don't

### 9.1 Couleur

| ✅ DO | ❌ DON'T |
|-------|---------|
| Utiliser Solar Flare **exactement une fois** par écran — le CTA primaire | Utiliser Solar Flare pour du texte body, des backgrounds de section |
| Utiliser les neutres cosmiques pour 90%+ de la surface | Utiliser du `#000000` pur — toujours utiliser `var(--syn-void)` ou `var(--syn-nebula)` |
| Réserver Nova Pink aux nœuds récents / créatifs (<24h) | Appliquer Nova Pink à des éléments d'interface statiques |
| Utiliser Plasma Cyan **uniquement** pour les arêtes actives | Mettre du Plasma en background de bouton |
| Appliquer les glow tokens uniquement sur les nœuds et arêtes | Mettre un glow sur un bouton standard (sauf CTA hover) |
| Utiliser Solar White **uniquement** comme texte sur Solar Flare | Utiliser Solar White comme couleur de texte générale |

### 9.2 Typographie

| ✅ DO | ❌ DON'T |
|-------|---------|
| Utiliser `text-body` (14px) comme taille de base pour tout l'UI | Descendre en dessous de `text-small` (12px) pour du contenu lisible |
| Appliquer `text-cosmic` (60px, weight 300) pour les grands titres | Utiliser weight 700+ sur des textes >30px |
| Utiliser `text-meta` (13px, weight 500) pour les labels UI | Utiliser du text en dessous de 11px |
| Respecter le tracking négatif proportionnel à la taille | Mettre du tracking négatif sur du body text (<16px) |
| Utiliser JetBrains Mono pour les IDs, métadonnées, raccourcis | Mixer mono et sans-serif dans la même phrase sans séparation |

### 9.3 Espacements

| ✅ DO | ❌ DON'T |
|-------|---------|
| Utiliser `orbit-6` (16px) comme gap standard entre sections | Utiliser des valeurs arbitraires (<2px ou >96px) |
| Utiliser `orbit-10` (40px) minimum pour le padding vertical des sections | Laisser moins de `orbit-8` (24px) entre deux sections majeures |
| Utiliser `orbit-4` (8px) comme gap standard entre éléments inline | Mélanger 3+ échelles d'espacement différentes sur la même page |

### 9.4 Radius

| ✅ DO | ❌ DON'T |
|-------|---------|
| Utiliser `rounded-orbit` (6px) pour les boutons standard | Utiliser `rounded-celestial` (pill) pour les boutons de formulaire |
| Utiliser `rounded-crater` (4px) pour les inputs et search bars | Mettre des radius opposés (ex: 4px gauche + 9999px droite) sauf cas délibéré |
| Utiliser `rounded-nebula` (8px) pour les cards standards | Mélanger 3+ radius différents dans le même composant |
| Utiliser `rounded-celestial` pour les tags et badges | Appliquer 9999px à un élément qui n'est pas ovale par nature |

### 9.5 Nœuds 3D

| ✅ DO | ❌ DON'T |
|-------|---------|
| Utiliser les 4 tailles de nœud (Star/Planet/Moon/Dwarf) strictement selon le rôle sémantique | Avoir des nœuds de taille arbitraire hors des 4 catégories |
| Appliquer un glow visible uniquement sur les nœuds Star et Planet | Mettre un glow sur les nœuds Dwarf |
| Animer le pulse respiratoire sur tous les nœuds sauf Dwarf | Animer tous les nœuds avec la même amplitude — chaque type a son rythme |
| Ajouter des particules orbitales **uniquement** autour des Stars (focus) | Saturer l'espace avec trop de particules — max 12 par nœud Star |
| Nettoyer les geometries/materials Three.js au démontage | Laisser des fuites mémoire — chaque `useEffect` retourne un cleanup |

### 9.6 Arêtes

| ✅ DO | ❌ DON'T |
|-------|---------|
| Utiliser `opacity: 0.3` pour les arêtes standard | Dépasser `opacity: 0.6` même pour les arêtes actives |
| Réserver le `dashed` animation flow aux arêtes activement parcourues | Animer toutes les arêtes simultanément — distrayant |
| Utiliser `Dust Gray` (`#3d3d55`) comme couleur par défaut des arêtes | Utiliser des couleurs chaudes (Solar/Nova) pour les arêtes |

### 9.7 Animations

| ✅ DO | ❌ DON'T |
|-------|---------|
| Utiliser `cubic-bezier(0.34, 1.56, 0.64, 1)` pour les entrées (cosmique) | Utiliser `ease-in` ou `linear` — toujours des easings organiques |
| Limiter les animations simultanées à 3-4 max sur la page | Animer plus de 6 éléments en parallèle — performance et distraction |
| Utiliser `200ms` delay sur les tooltips avant apparition | Faire apparaître les tooltips instantanément — crée du flicker |
| Préférer `transform` et `opacity` aux `width`/`height` pour les animations | Animer `box-shadow` ou `filter` directement — utiliser une pseudo-couche |
| Utiliser `will-change: transform` sur les éléments animés en 3D | Mettre `will-change` sur trop d'éléments à la fois — crée l'effet inverse |

### 9.8 Layout

| ✅ DO | ❌ DON'T |
|-------|---------|
| Garder le graphe 3D en **full viewport** — l'UI est superposée | Mettre le graphe dans un container avec scroll |
| Utiliser un max-width de `1200px` pour le contenu textuel superposé | Dépasser `720px` de largeur pour les panneaux latéraux |
| Positionner la Search Bar en haut (fixed/absolute, z-10+) | Enterrer la search bar — elle est le point d'entrée principal |
| Laisser 20-30% de l'écran en « espace vide » cosmique | Remplir tout l'écran — le vide fait partie du thème |

### 9.9 Accessibilité cosmique

| ✅ DO | ❌ DON'T |
|-------|---------|
| Maintenir un ratio de contraste ≥ 4.5:1 pour tout le texte | Utiliser `Stardust` (#6a6a85) pour du texte body — trop clair sur fond sombre |
| Ajouter `aria-label` sur les boutons d'action sans texte | Laisser les icônes seules sans label accessible |
| Assurer que les glow effects sont **non essentiels** à la compréhension | Transmettre de l'information uniquement via la couleur ou la lueur |
| Fournir un `prefers-reduced-motion` fallback pour toutes les animations | Animer des éléments déclencheurs de migraine (flashs rapides, rotations 3D) |

```css
/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  .animate-node-pulse,
  .animate-float,
  .animate-glow-pulse,
  .animate-twinkle {
    animation: none !important;
  }
}
```

### 9.10 Anti-patterns visuels

```
❌ « Solar Flare overload » — Trop de orange partout.
   → Règle : Solar Flare = 1 CTA par écran. Point.

❌ « Glow everything » — Tous les nœuds avec un gros glow.
   → Règle : Glow fort = uniquement Star (focus). Les autres = soft ou rien.

❌ « Rainbow cosmos » — Toutes les couleurs stellaires simultanément.
   → Règle : Max 2 couleurs stellaires visibles en même temps + neutres.

❌ « Flat space » — Fond noir sans profondeur.
   → Règle : Toujours superposer 2-3 couches de fond (void → nebula → void-shadow).

❌ « Text on glow » — Texte superposé sur un fond avec glow.
   → Règle : Jamais de texte directement sur un élément avec glow actif.
```

---

## Annexe A : Récapitulatif — Fichier CSS Tailwind v4 complet

Voir le fichier `app/globals.css` pour l'implémentation complète des `@theme` tokens ci-dessus.

## Annexe B : Arbre de décision — Quel composant utiliser

```
Tu veux représenter une information dans le graphe ?
├─ C'est un concept/entité principal(e) → Nœud Planet (0.8u)
├─ C'est le focus actuel → Nœud Star (1.2u, glow solar)
├─ C'est un détail/sous-élément → Nœud Moon (0.5u)
├─ C'est une métadonnée/lien faible → Nœud Dwarf (0.3u)
└─ C'est une relation → Arête (solid/dotted/dashed selon force)

Tu veux un élément d'interface ?
├─ L'utilisateur cherche → SearchBar (radio-télescope)
├─ L'utilisateur explore un nœud → DetailPanel (star chart)
├─ L'utilisateur survole → Tooltip (observation lointaine)
├─ Un comptage est nécessaire → CountBadge (étoile clignotante)
├─ L'utilisateur agit → Primary Button (Launch CTA)
└─ Séparer des sections → Divider (gradient cosmique)
```

## Annexe C : Exemple de page complète (concept)

```
┌──────────────────────────────────────────────────┐
│  [Solar Logo]  [SearchBar ⭐]        [🔔] [👤]  │  ← Nav fixed (bg-nebula, border-b meteor)
│                                                  │
│              ┌──────────────────────────────┐    │
│              │                              │    │
│              │      ✦   ✧                  │    │  ← Cosmos 3D (full viewport bg-void)
│              │         ★ (focus)           │    │
│              │    ╱────╲                    │    │     Nodes: Star, Planet, Moon, Dwarf
│              │   ╱      ╲  ⚫              │    │     Edges: Solid + dotted filaments
│              │  ⚪───────★──────⚫          │    │
│              │       ╲   │  ╱              │    │
│              │        ╲  │ ╱               │    │
│              │         ╲ │╱                │    │
│              │          ⚫                  │    │
│              │                              │    │
│              └──────────────────────────────┘    │
│                                      ┌──────────┤
│  [Solar] [Plasma] [Nova]             │ ★ Titre  │  ← DetailPanel (right overlay)
│                                      │ ID: ...   │
│                                      │           │
│                                      │ Contenu…  │
│                                      │           │
│                                      │ [tag] [tg]│
│                                      └──────────┘
│  Nœuds: 142 │ Arêtes: 389 │ Dernière synchro: 2min  │  ← Status bar (bg-void-shadow)
└──────────────────────────────────────────────────┘
```

---

> **Document :** Synapse Design System v1.0 — « Cosmos de la mémoire »
> **Date :** 2026-06-06
> **État :** ✅ Prêt pour implémentation
> **Prochaines étapes :** 1) Créer `app/globals.css` avec les tokens Tailwind v4  2) Créer les composants React  3) Intégrer Three.js/R3F pour les nœuds 3D
