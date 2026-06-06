# Recherche des Styles Refero.design

> **Source :** [https://styles.refero.design](https://styles.refero.design)
> **Date :** 2026-06-06
> **Styles analysés :** Cursor, Linear, Anthropic, ElevenLabs, Mercury, Vercel

---

## Sommaire

1. [Cursor](#1-cursor)
2. [Linear](#2-linear)
3. [Anthropic](#3-anthropic)
4. [ElevenLabs](#4-elevenlabs)
5. [Mercury](#5-mercury)
6. [Vercel](#6-vercel)
7. [Tableau comparatif](#7-tableau-comparatif)

---

## 1. Cursor

**Tagline :** *Warm paper command center*
**URL :** https://styles.refero.design/style/4e3b4717-84c8-4599-baaf-a343c3d619b6
**Theme :** light

### Palette

| Nom | Valeur | Token CSS | Rôle |
|-----|--------|-----------|------|
| Ember Orange | `#f54e00` | `--color-ember-orange` | Accent interactif unique — link underlines, hovers |
| Signal Green | `#4ade80` | `--color-signal-green` | Accent secondaire — tags, focus edges |
| Brass Gold | `#c08532` | `--color-brass-gold` | Accent décoratif chaud — icon strokes |
| Deep Moss | `#34785c` | `--color-deep-moss` | Boutons secondaires, outlined action borders |
| Deep Charcoal | `#141414` | `--color-deep-charcoal` | Accent dark pur — used sparingly |
| Espresso Ink | `#26251e` | `--color-espresso-ink` | **Primary text**, buttons filled dark |
| Muted Clay | `#7a7974` | `--color-muted-clay` | Body text secondaire |
| Edge Ash | `#8f8e89` | `--color-edge-ash` | Borders subtils, text tertiaire |
| Trace Smoke | `#a1a19f` | `--color-trace-smoke` | Faints borders, disabled states |
| Border Sand | `#d9d5cf` | `--color-border-sand` | Hairline dividers, card borders |
| Card Stone | `#e6e5e0` | `--color-card-stone` | Card surfaces, secondary button bg |
| Page Parchment | `#f7f7f4` | `--color-page-parchment` | **Page canvas** — base warm white |

### Typographie

- **CursorGothic** (400) — Primary brand, body to 72px display, single weight 400 avec tight negative tracking
- **berkeleyMono** (400, 500) — Code snippets, CLI commands
- **EB Garamond** (400, 500) — Accent serif occasionnel
- **Type scale :** Minor Third (1.2) from 15px base
- **Sizes :** 12px → 72px (11 steps)

### Border Radius

- tags/icons/inputs : 4px
- cards : 8px
- buttons : **9999px** (pill)

### Ombres / Élévation

- **Product Screenshot Card** : soft warm shadows (réservé aux cartes élevées et modales)
- Pas de drop shadows sur les boutons, nav items ou text

### Composants signature

1. **Bouton filled dark** (#26251e, pill 9999px)
2. **Ghost outlined button** (neutral Espresso Ink outline)
3. **Inline link Underline** (Ember Orange au hover uniquement)
4. **Tag** (4px radius, Signal Green outline)

### Règles clés

- 95%+ de la surface est achromatique warm neutrals
- Pure black #000 jamais utilisé — toujours chaudifié vers Espresso Ink
- Une seule couleur chromatique vive (orange) par écran
- Les boutons sont **toujours** pill radius

---

## 2. Linear

**Tagline :** *midnight command deck — acid-lime status light on obsidian instrument panel*
**URL :** https://styles.refero.design/style/90ce5883-bb24-4466-93f7-801cd617b0d1
**Theme :** dark

### Palette

| Nom | Valeur | Token CSS | Rôle |
|-----|--------|-----------|------|
| Acid Lime | `#e4f222` | `--color-acid-lime` | **Accent unique** — one filled CTA per screen |
| Indigo | `#5e6ad2` | `--color-indigo` | Icon accent, link emphasis |
| Emerald | `#27a644` | `--color-emerald` | Semantic supporting accent |
| Crimson | `#eb5757` | `--color-crimson` | Semantic supporting accent |
| Cyan | `#02b8cc` | `--color-cyan` | Teal wash for highlights |
| Onyx | `#08090a` | `--color-onyx` | **Page background** — deepest surface |
| Charcoal | `#0f1011` | `--color-charcoal` | Nav bar, card base |
| Obsidian | `#161718` | `--color-obsidian` | Deep card backgrounds |
| Graphite | `#23252a` | `--color-graphite` | Hairline borders |
| Iron | `#323334` | `--color-iron` | Medium borders |
| Steel | `#383b3f` | `--color-steel` | Input field backgrounds |
| Slate | `#62666d` | `--color-slate` | Muted text, placeholder |
| Fog | `#8a8f98` | `--color-fog` | Secondary text |
| Mist | `#d0d6e0` | `--color-mist` | Tertiary text |
| Platinum | `#e5e5e6` | `--color-platinum` | High-contrast borders |
| Snow | `#f7f8f8` | `--color-snow` | **Primary text** — near-white |

### Typographie

- **Inter Variable** (300, 400, 510, 590) — All UI text, 14 sizes
- **Berkeley Mono** (400) — Code, IDs, keyboard shortcuts
- **Type scale :** Minor Third (1.2) from 16px base
- **Tracking :** -0.0220em at 72px, scaling down

### Border Radius

- badges : 2px
- nav/inputs/buttons : 6px
- cards : 12px
- pills : 9999px

### Ombres / Élévation

| Token | Valeur |
|-------|--------|
| `--shadow-sm` | `rgba(0,0,0,0.4) 0px 2px 4px 0px` |
| `--shadow-md` | `rgba(0,0,0,0.2) 0px 0px 12px 0px inset` |
| `--shadow-subtle` | `rgb(35,37,42) 0px 0px 0px 1px inset` |
| `--shadow-xl` | `rgba(8,9,10,0.6) 0px 4px 32px 0px` |

### Composants signature

1. **Primary Lime CTA** (#e4f222 bg, #030404 text, 6px radius)
2. **Ghost Nav Button** (Fog text, transparent bg)
3. **Sign Up Pill** (1px white border, transparent bg, 9999px radius)
4. **Product Screenshot Card** (#0f1011, radius 12px, 1px inset border Graphite)
5. **Issue Card (Kanban)** (#161718, 1px border Graphite, radius 6px)
6. **Status Pill Badge** (2px radius, dot + label)
7. **Input Field** (#383b3f Steel bg, radius 6px, 1px inset shadow)

### Règles clés

- Acid Lime réservée **exclusivement** à une action primaire par écran
- Pas de gradients (sauf un scroll fade)
- Poids max 590 (jamais 700+)
- La lime est la seule couleur de remplissage chromatique du système

---

## 3. Anthropic

**Tagline :** *Research journal printed on warm stone*
**URL :** https://styles.refero.design/style/d469cba4-c448-4a43-a033-883f8bfcdc42
**Theme :** light

### Palette

| Nom | Valeur | Token CSS | Rôle |
|-----|--------|-----------|------|
| Clay | `#d97757` | `--color-clay` | **Accent terracotta** — use très rare |
| Accent Ember | `#c6613f` | `--color-accent-ember` | Hover state du clay |
| Olive | `#788c5d` | `--color-olive` | Thematic tag variant |
| Sky | `#6a9bcc` | `--color-sky` | Thematic tag variant |
| Fig | `#c46686` | `--color-fig` | Thematic tag variant |
| Cactus | `#bcd1ca` | `--color-cactus` | Thematic tag variant |
| Slate Dark | `#141413` | `--color-slate-dark` | **Primary text**, borders, dark cards |
| Slate Medium | `#3d3d3a` | `--color-slate-medium` | Mid-dark borders |
| Slate Light | `#5e5d59` | `--color-slate-light` | Tertiary text |
| Cloud Dark | `#87867f` | `--color-cloud-dark` | Secondary text |
| Cloud Medium | `#b0aea5` | `--color-cloud-medium` | Disabled borders |
| Cloud Light | `#d1cfc5` | `--color-cloud-light` | Dividers |
| Oat | `#e3dacc` | `--color-oat` | Tertiary surface bg |
| Ivory Dark | `#e8e6dc` | `--color-ivory-dark` | Text on dark bg |
| Ivory Medium | `#f0eee6` | `--color-ivory-medium` | Nav backgrounds |
| Ivory Light | `#faf9f5` | `--color-ivory-light` | **Page background** — warm parchment |

### Typographie

- **Anthropic Sans** (400, 500, 600, 700) — All UI chrome
- **Anthropic Serif** (400, 600) — Display headlines (91px!) sur dark cards
- **Anthropic Mono** (400) — Metadata labels, category tags
- **Type scale :** Major Third (1.25) from 12px base → up to 91px display
- **Tracking :** -0.02em at 61px display

### Border Radius

- buttons : **0px** (uniformément carrés)
- cards : 8px
- panels : 16px
- featuredCards : 24px
- "Try Claude" CTA : **0px 0px 8px 8px** (asymétrique — signature)

### Ombres / Élévation

**Zéro box-shadow.** La profondeur vient uniquement du contraste de surface
- Ivory (#faf9f5) → near-black (#141413) → oat (#e3dacc)

### Composants signature

1. **Primary Nav Button (Try Claude)** — Asymmetric radius (flat top, rounded bottom)
2. **Ghost Nav Button** (transparent, 1px solid #141413, radius 0px)
3. **Inline Text Link with Underline Emphasis** — Use thick underline au lieu de la couleur
4. **Feature Card (Dark)** (#141413, 24px radius, serif 91px headline)
5. **Release Card (Light)** (#f0eee6, 8px radius)
6. **Metadata Label** (Anthropic Mono, pure text, zero chrome)
7. **Arrow Text Link** (→ glyph appended)

### Règles clés

- Jamais de #fff ou #000 comme surface background
- Jamais de box-shadows
- Soulignement épais = seul mécanisme décoratif (remplace la couleur)
- Alternance stricte light/dark bands
- Couleur chromatique = un seul accent par section maximum

---

## 4. ElevenLabs

**Tagline :** *Parchment command terminal — warm paper surfaces beneath monochrome controls*
**URL :** https://styles.refero.design/style/031056ff-7af1-46db-8daa-115f731c5d26
**Theme :** light

### Palette

| Nom | Valeur | Token CSS | Rôle |
|-----|--------|-----------|------|
| Void Violet | `#0447ff` | `--color-void-violet` | **Décoratif uniquement** — SVG orbs |
| Ember Orange | `#ff4704` | `--color-ember-orange` | Décoratif uniquement — SVG orbs |
| Midnight Ink | `#000000` | `--color-midnight-ink` | **Primary text**, filled buttons |
| Driftwood | `#777169` | `--color-driftwood` | Secondary text |
| Fog | `#a59f97` | `--color-fog` | Tertiary text |
| Silver Mist | `#b1b0b0` | `--color-silver-mist` | Subtle bg washes |
| Ash Border | `#e5e5e5` | `--color-ash-border` | **All** hairline borders |
| Warm Sand | `#f5f3f1` | `--color-warm-sand` | Card surfaces |
| Parchment White | `#fdfcfc` | `--color-parchment-white` | **Page canvas** |

### Typographie

- **Waldenburg** (300) — Display headlines only (32-48px, -0.02em tracking)
- **WaldenburgFH** (700) — Logo wordmark only (0.05em tracking)
- **Inter** (400, 500) — All functional UI text
- **Geist Mono** (400) — Code snippets
- **Type scale :** Major Second (1.125) from 16px base

### Border Radius

Une variété de radius spécifiques par composant :

- inputs : 4px
- tooltips : 8px
- tags : 14px
- badges : 18px
- tabs : 20px
- cards : 20px
- cardLarge : 24px
- buttons : **9999px** (pill — tous les boutons)
- pills : 9999px

### Ombres / Élévation

| Token | Valeur |
|-------|--------|
| `--shadow-subtle` | `rgba(0,0,0,0.075) 0px 0px 0px 0.5px inset` |
| `--shadow-subtle-2` | Hairline ring + micro blur |
| `--shadow-subtle-6` | White elevated card shadow |

### Composants signature

1. **Black Filled Pill Button** (#000000, #ffffff text, 9999px)
2. **White Outlined Pill Button** (#fdfcfc bg, #e5e5e5 border, 9999px)
3. **Ghost Text Button** (transparent, text only)
4. **Rounded Tab Badge Button** (18px radius, active = white + inset shadow)
5. **Warm Sand Feature Card** (#f5f3f1, 20px radius, no border/shadow)
6. **White Elevated Card** (#ffffff, 20px radius, subtle hairlines)
7. **Ambient Voice Orb** (chromatic gradient violet→orange — only color in UI)

### Règles clés

- **Aucun bouton rectangulaire** — tous 9999px
- Violet et orange = décoration uniquement, jamais UI
- Waldenburg = headlines uniquement ; Inter = tout le reste
- Pas de système de couleurs sémantiques (green=success, etc.)

---

## 5. Mercury

**Tagline :** *Mountain Top Command Center*
**URL :** https://styles.refero.design/style/3172cd4d-118a-4a16-a259-6b634d32322e
**Theme :** dark

### Palette

| Nom | Valeur | Token CSS | Rôle |
|-----|--------|-----------|------|
| Mercury Blue | `#5266eb` | `--color-mercury-blue` | **Accent unique** — primary CTAs seulement |
| Ghost Blue | `#cdddff` | `--color-ghost-blue` | Secondary button bg, hover states |
| Deep Space | `#171721` | `--color-deep-space` | Outermost page background |
| Midnight Slate | `#1e1e2a` | `--color-midnight-slate` | Primary page background |
| Graphite | `#272735` | `--color-graphite` | Subtle button bg |
| Lead | `#70707d` | `--color-lead` | Borders, dividers |
| Silver | `#c3c3cc` | `--color-silver` | Secondary text, disabled |
| Starlight | `#ededf3` | `--color-starlight` | **Primary text** |
| Pure White | `#ffffff` | `--color-pure-white` | Text sur Mercury Blue buttons |

### Typographie

- **arcadiaDisplay** (360, 480, 530) — Headlines (signature : weight 360 à large size)
- **arcadia** (360, 400, 420, 480) — Body, UI labels, navigation
- **Type scale :** Major Second (1.125) from 20px base
- **Sizes :** 12px → 65px display

### Border Radius

- cards : **0px**
- containers : 4px
- inputs : **32px** (très arrondi)
- buttons : **32px, 40px** (pill extrême)

### Ombres / Élévation

**Zéro shadow.** L'élévation est gérée par des shifts de couleur/opacité.

### Composants signature

1. **Primary Pill Button** (#5266eb bg, #ffffff text, 32px radius)
2. **Header Pill Button** (#cdddff ~20% opacity bg, Starlight text, 40px radius)
3. **Ghost Nav Link** (transparent, text only)
4. **Hero Email Input** (32px left radius, 0px right radius — joint au bouton)
5. **Interactive Feature Link** (1px bottom border Lead)

### Règles clés

- Palette monochrome + un seul bleu accent
- Mercury Blue réservé aux CTAs — jamais pour text, backgrounds, décorations
- Poids max 530 — jamais heavy
- Pas de Pure White (#fff) pour le body text
- Espacement généreux : section gap 80-120px

---

## 6. Vercel

**Tagline :** *Prismatic monolith on graph paper*
**URL :** https://styles.refero.design/style/f24daf3a-d43f-4dec-85a9-8ac1d5148a03
**Theme :** light

### Palette

| Nom | Valeur | Token CSS | Rôle |
|-----|--------|-----------|------|
| Vercel Blue | `#0070f3` | `--color-vercel-blue` | Brand blue pour links et logo CTAs |
| Prism Blue | `#52aeff` | `--color-prism-blue` | Décoratif — gradient prism |
| Prism Red | `#e5484d` | `--color-prism-red` | Décoratif — gradient prism |
| Prism Teal | `#45dec5` | `--color-prism-teal` | Décoratif — gradient prism |
| Carbon | `#000000` | `--color-carbon` | SVG icon fills (sparingly) |
| Graphite | `#171717` | `--color-graphite` | **Primary text**, filled buttons |
| Felt Gray | `#4d4d4d` | `--color-felt-gray` | Secondary text |
| Smoke | `#666666` | `--color-smoke` | Tertiary text |
| Fog | `#7d7d7d` | `--color-fog` | Subtle body text |
| Ash | `#a8a8a8` | `--color-ash` | Placeholder text |
| Hairline | `#ebebeb` | `--color-hairline` | **Border par défaut** — structural |
| Ice Tint | `#f0fbff` | `--color-ice-tint` | Subtle cool wash |
| Marble White | `#fafafa` | `--color-marble-white` | **Page canvas** — warm off-white |
| Pearl | `#ffffff` | `--color-pearl` | Inset surface white |

### Typographie

- **Geist** (400, 500, 600, 700) — All UI, custom Vercel-built neo-grotesque
- **Geist Mono** (400, 500, 600) — Code blocks, terminal
- **Type scale :** Minor Third (1.2) from 15px base
- **Tracking :** -0.02em at 16px → -0.06em at 48px (très négatif)
- Substitute : Inter for Geist, JetBrains Mono for Geist Mono

### Border Radius

- cards/buttons : 6px
- tab : 64px
- large : 100px
- pills : 9999px

### Ombres / Élévation

Élévation via contraste de surface, pas d'ombres.
- Card/Button/Link : 1px ring + 2px tail
- Image/List : 1px ring + 8px tail
- Nav Border : 1px ring only

### Composants signature

1. **Filled Primary Button** (#171717 bg, #ffffff text, 6px radius)
2. **Outlined Secondary Button** (1px #171717 border, transparent bg, même taille)
3. **Pill Navigation Chip** (#ffffff, 1px #ebebeb, 9999px radius)
4. **Top Navigation Bar** (#fafafa, 1px bottom border, ~64px)
5. **Product Feature Card** (#ffffff, 1px #ebebeb, 6px radius, 24px padding)
6. **Hero Section** (faint engineer grid background)
7. **Prismatic Conic Gradient** (logo accent only — gold→red→steel blue→mint)
8. **Engineer Grid Overlay** (1px grid lines, 40-48px module)
9. **Code Block** (Geist Mono, restricted syntax highlighting)
10. **Tab Bar** (2px underline active state)

### Règles clés

- 99% achromatique — les couleurs prism sont décoratives uniquement
- #171717 pour les filled buttons, jamais #0070f3
- #fafafa canvas, jamais #fff
- Toujours paire filled + outlined button
- Gradient prismatique = 1x par section max, derrière le logo uniquement
- Geist avec tracking négatif proportionnel à la taille

---

## 7. Tableau comparatif

| Propriété | **Cursor** | **Linear** | **Anthropic** | **ElevenLabs** | **Mercury** | **Vercel** |
|-----------|-----------|------------|--------------|---------------|------------|-----------|
| **Theme** | light | dark | light | light | dark | light |
| **Canvas** | #f7f7f4 | #08090a | #faf9f5 | #fdfcfc | #1e1e2a | #fafafa |
| **Primary text** | #26251e | #f7f8f8 | #141413 | #000000 | #ededf3 | #171717 |
| **Accent unique** | #f54e00 orange | #e4f222 lime | #d97757 clay | (decorative only) | #5266eb blue | (prism decor) |
| **Police display** | CursorGothic 400 | Inter Variable 300-510 | Anthropic Sans/Serif | Waldenburg 300 | arcadiaDisplay 360 | Geist 400-600 |
| **Police body** | CursorGothic 400 | Inter Variable 400 | Anthropic Sans 400 | Inter 400/500 | arcadia 360-480 | Geist 400-600 |
| **Police mono** | berkeleyMono | Berkeley Mono | Anthropic Mono | Geist Mono | — | Geist Mono |
| **Display max** | 72px | 72px | 91px | 48px | 65px | 48px |
| **Base scale** | 1.2 (15px) | 1.2 (16px) | 1.25 (12px) | 1.125 (16px) | 1.125 (20px) | 1.2 (15px) |
| **Radius cards** | 8px | 12px | 8px | 20px | 0px | 6px |
| **Radius buttons** | 9999px (pill) | 6px | 0px | 9999px (pill) | 32-40px | 6px |
| **Shadows** | Soft warm only | Multi-layer | Aucun | Hairline micro | Aucun | Hairline only |
| **Signature** | Warm paper journal | Lime single CTA | Underline emphasis | Color-as-sound orbs | Mountain dark command | Prism logo gradient |
| **Densité** | compact | compact | compact | comfortable | spacious | compact |
| **Max width** | 1200px | 1200px | 1200px | 1200px | 1200px | 1200px |

---

## Notes d'analyse transversale

### Patterns communs

1. **Rationnement de la couleur** — Les 6 systèmes limitent fortement la couleur chromatique à 1-2 accents maximum, souvent réservés aux CTAs ou à la décoration uniquement.
2. **Palettes achromatiques dominantes** — Tous utilisent des neutres chauds (Cursor, Anthropic, ElevenLabs) ou froids (Linear, Mercury, Vercel) comme fondation.
3. **1200px max-width** — Tous partagent cette contrainte de layout.
4. **Polices custom** — Cursor, Anthropic, Vercel, Mercury et ElevenLabs ont leurs propres fontes.
5. **Anti-#000 black** — Cursor (#26251e), Vercel (#171717), Linear (#08090a) évitent le noir pur.

### Différences clés

- **Cursor & ElevenLabs** : Ambiance papier chaud, boutons pill, approche éditoriale
- **Linear & Mercury** : Dark mode instrument panel, accent hyper-rationné, zéro décoration
- **Anthropic & Vercel** : Light mode, structure géométrique, refus des ombres
- **Anthropic** : Le seul à utiliser un radius asymétrique (0px 0px 8px 8px)
- **Cursor & Linear** : Les seuls avec des radius différents par composant
- **Mercury** : Le plus extrême — cards à 0px radius mais inputs à 32px
- **ElevenLabs** : Le seul avec une palette de radius aussi variée (4px → 24px → 9999px)
- **Linear** : Le seul avec des poids de police custom (510, 590 Inter Variable)

---

*Document généré par exploration automatisée de https://styles.refero.design*
*Chaque style est disponible avec DESIGN.md, Tailwind v4, CSS Variables et Design Tokens exportables.*
