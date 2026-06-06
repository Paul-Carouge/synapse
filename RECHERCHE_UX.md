# RECHERCHE UX — Synapse Visualiseur 3D de Mémoire

**Auteur :** Atlas (Équipe Orion)
**Date :** 06/06/2026
**Contexte :** Synapse est un visualiseur 3D de la mémoire ChromaDB. Design actuel jugé moche avec UX terrible. Ce document compile les inspirations, patterns et recommandations pour un redesign complet.

---

## SOMMAIRE
1. [État des lieux : Synapse actuel](#1-état-des-lieux--synapse-actuel)
2. [Design Systems de refero.design](#2-design-systems-de-referodesign)
3. [Inspirations outils de connaissance](#3-inspirations-outils-de-connaissance)
4. [Inspirations spatial computing & 3D](#4-inspirations-spatial-computing--3d)
5. [Patterns concrets à appliquer](#5-patterns-concrets-à-appliquer)
6. [3 Recommandations Prioritaires](#6-3-recommandations-prioritaires)

---

## 1. État des lieux : Synapse actuel

**URL :** https://synapse-tawny-sigma.vercel.app

**Ce qui a été observé :**
- Page d'accueil minimaliste : « Connexion à la mémoire... »
- Aucune interface visible, probablement un écran de chargement/login
- Le projet est un visualiseur 3D ChromaDB — potentiellement Three.js/R3F

**Problèmes probables (basé sur la description « moche / UX terrible ») :**
- Palette de couleurs par défaut ou non travaillée
- Absence de hiérarchie visuelle claire
- Navigation confuse
- Le rendu 3D domine sans cadre UI structuré
- Pas de design system cohérent

---

## 2. Design Systems de refero.design

### 2.1 Linear — « Midnight command deck — acid-lime »

**Tagline :** midnight command deck — acid-lime against deep obsidian

**Palette :**

| Nom | Hex | Rôle |
|-----|-----|------|
| Onyx | `#08090a` | Fond de page, canvas primaire |
| Charcoal | `#0f1011` | Barre de navigation, cartes |
| Obsidian | `#161718` | Fond de cartes profond, modales |
| Graphite | `#23252a` | Bordures fines, séparateurs |
| Acid Lime | `#e4f222` | **Action primaire** — boutons remplis, états sélectionnés |
| Indigo | `#5e6ad2` | Accent secondaire — icônes, liens |
| Emerald | `#27a644` | Accent vert — tags, bordures |
| Crimson | `#eb5757` | Accent rouge — tags, alertes |

**Typographie :** Inter (UI), iA Writer Mono (code)
- Poids 300 pour le body — « whisper-weight »
- Tracking négatif sur les titres (-0.02em)
- Poids 500-600 pour navigation et boutons

**Composants signatures :**
- **Sidebar** : fond `#0f1011`, icônes ton sur ton, sélecteur d'item actif en Acid Lime
- **Primary Button** : Acid Lime `#e4f222` rempli, texte noir, coins 8px
- **Command Menu** : palette Cmd+K avec overlay semi-transparent
- **Kanban/Board** : cartes sur fond Charcoal avec bordures Graphite
- **Tags** : Emerald/Crimson en outline, taille 11px, tracking large

**Patterns UX :**
- Commande palette (Cmd+K) comme centre de navigation
- Sidebar rétractable avec icônes uniquement
- Barre supérieure fine avec breadcrumbs et status
- Feedback immédiat sur les actions (optimistic UI)
- Transition fluide entre états (loading → empty → data)

**Ce qui est bon :**
- Palette ultra-contrastée, l'Acid Lime sur fond noir est iconique
- Sobriété extrême — chaque pixel a une fonction
- La command palette comme centre de tout
- États vides informatifs et élégants

**Ce qui ne l'est pas :**
- Peut sembler froid / trop « dev tool »
- Courbe d'apprentissage pour la command palette

**Patterns à appliquer pour Synapse :**
- Commande palette globale pour chercher/explorer la mémoire
- Sidebar fine avec icônes (collections, tags, recherche)
- Fond ultra-foncé `#08090a` comme base de la scène 3D
- Accent néon unique (Acid Lime ou autre) pour les interactions clés

---

### 2.2 Dala — « Particle cosmos on a void — violet pulse against infinite black »

**Tagline :** Particle cosmos on a void — violet pulse against infinite black

**Palette :**

| Nom | Hex | Rôle |
|-----|-----|------|
| Void | `#000000` | Fond de page — le cosmos |
| Bone | `#ffffff` | Texte primaire, icônes, bordures fines |
| Ash | `#bdbdbd` | Texte secondaire |
| Smoke | `#9a9a9a` | Texte tertiaire |
| Plum Voltage | `#8052ff` | **Action primaire** — violet saturé, seul bouton rempli |
| Amber Spark | `#ffb829` | Accent jaune — bordures outline, labels |
| Lichen | `#15846e` | Accent décoratif — nœuds de constellation |

**Composants signatures :**
- **Particle Constellation** : des milliers de micro-formes (triangles, cercles, diamants) flottant sur le vide noir
- **Pill Button** : `#8052ff` rempli, coins 24px, texte Bone, pas d'ombre
- **Hairline Border** : 1px `#ffffff` à faible alpha
- **Nav Text Link** : texte Smoke au repos → Bone au hover, simple changement de couleur

**Patterns UX :**
- Profondeur par contraste de couleur, pas par ombres
- Pas de cartes ni d'élévations — juste des bordures sur le vide
- Une seule couleur chromée remplie (Plum Voltage)
- Les particules/constellations sont l'identité visuelle — pas une décoration

**Ce qui est bon :**
- Approche « cosmos de la connaissance » parfaite pour Synapse
- La constellation de particules comme métaphore des embeddings ChromaDB
- Absence totale d'ombres/glow — pureté du noir
- Police ultra-fine pour les titres (weight 200 à 113px) — « etched in light »

**Ce qui ne l'est pas :**
- Peut manquer de repères visuels pour la navigation complexe
- Pas adapté à des listes/données denses sans adaptation

**Patterns à appliquer pour Synapse :**
- **Constellation 3D** comme fond/incarnation des embeddings — chaque point = un document
- Palette noire pure `#000000` comme toile de fond 3D
- Violet `#8052ff` comme accent principal pour les interactions clés
- Pas d'ombres portées sur l'UI — la profondeur vient du rendu 3D lui-même
- Type ultra-fin pour les titres

---

### 2.3 Cursor — « Warm paper command center »

**Tagline :** Warm paper command center

**Palette clé :**

| Nom | Hex | Rôle |
|-----|-----|------|
| Ember Orange | `#f54e00` | Accent principal — soulignés de liens, hover |
| Signal Green | `#4ade80` | Accent vert — tags, bordures |
| (Neutres chauds) | Gris chauds | Fond éditeur, panneaux |

**Composants signatures :**
- **Split Editor/Preview** : moitié code, moitié rendu
- **Command Bar** : barre de chat/command en bas
- **Floating Elements** : bulles d'info contextuelles

**Patterns UX :**
- Interface orientée productivité avec IA intégrée
- Feedback visuel riche (syntax highlighting, diff)
- Commandes accessibles au clavier

**Ce qui est bon :**
- Intégration naturelle d'une barre de commande/chat dans l'interface
- Palette chaude qui réduit la fatigue oculaire

**Ce qui ne l'est pas :**
- Palette trop chaude pour un rendu 3D immersif

**Patterns à appliquer pour Synapse :**
- Barre de chat/commande en bas de l'écran pour requêter ChromaDB en langage naturel
- Split view entre exploration 3D et détails d'un embedding

---

### 2.4 Resend — « Obsidian developer terminal »

**Tagline :** Obsidian developer terminal

**Palette :**

| Nom | Hex | Rôle |
|-----|-----|------|
| Electric Blue | `#3b9eff` | Action primaire bleue |
| Resend Violet | Gradient | Code syntax highlighting |

**Patterns UX :**
- Terminal aesthetic avec fond très foncé
- Grille serrée, densité d'information élevée
- Micro-interactions sur les listes

**À appliquer :**
- Les logs/requêtes ChromaDB peuvent s'afficher en style terminal
- Badges de statut avec couleurs vives

---

### 2.5 Sequel — « Blackbox gallery, lit by cinema »

**Tagline :** blackbox gallery, lit by cinema

**Palette 100% achromatique :**

| Nom | Hex | Rôle |
|-----|-----|------|
| Void Black | `#000000` | Canvas de page |
| Carbon | `#202020` | Surfaces élevées, cartes |
| Graphite | `#333333` | Bordures fines |
| Linen | `#f5f5f0` | Unique surface chaude (contraste) |
| Chalk | `#ffffff` | Texte primaire |

**Composants signatures :**
- **Editorial Image Card** : image plein bord, 10px radius, ombre multi-couche
- **Centered Headline Block** : titre unique 58-128px en serif
- **Pill Button** : blanc sur noir, radius 9999px

**Patterns UX :**
- Galerie plutôt que dashboard
- Contenu = roi, UI = invisible
- Photographie cinématographique en pleine page

**Ce qui est bon :**
- L'approche « galerie » où le contenu (les données 3D) est la star
- Pas de chrome UI superflu

**Ce qui ne l'est pas :**
- 0% de couleur peut être trop austère pour une app de visualisation

**Patterns à appliquer :**
- La scène 3D est le hero — l'UI n'est que de fins overlays
- Les cartes d'info/modales avec fond `#202020` (Carbon)
- Boutons pills pour actions secondaires

---

### 2.6 Monopo Saigon — « Cinematic darkroom with floating elements »

**Tagline :** cinematic darkroom with floating elements

**Éléments pertinents :**
- Éléments 3D flottants dans l'UI
- Typographie aérienne avec beaucoup d'espace négatif
- Palette noire profonde avec accents vifs

**Patterns :**
- Éléments UI « flottant » au-dessus de la scène 3D (glassmorphism subtil)
- Titres qui semblent gravés dans la lumière
- Transitions douces entre les états

---

### 2.7 ORYZO AI — « Cork coaster in a blackout studio »

**Tagline :** cork coaster in a blackout studio

**Éléments pertinents :**
- Studio Black `#100904` (noir avec sous-ton chaud)
- Burnt Sienna `#dc5000` comme accent unique
- Approche « tactile » avec textures fines

**À retenir :**
- Un noir chaud peut être plus accueillant qu'un noir pur
- Un seul accent couleur (orange brûlé) suffit

---

### 2.8 Mercury — « Mountain Top Command Center »

**Palette :**

| Nom | Hex | Rôle |
|-----|-----|------|
| Deep Space | `#171721` | Fond externe |
| Midnight Slate | `#1e1e2a` | Fond principal |
| Mercury Blue | `#5266eb` | Accent CTA unique |
| Starlight | `#ededf3` | Texte primaire |

**Composants signatures :**
- Primary Pill Button : 32px radius, Mercury Blue
- Hero Email Input : champ avec bord arrondi

**Patterns :**
- Commande center esthétique — parfait pour une app de visualisation
- Fond bleu nuit `#1e1e2a` pour une alternative au noir pur
- Espacement généreux (80-120px entre sections)

**À appliquer :**
- Le fond `#171721` ou `#1e1e2a` comme alternative au `#000000`
- Boutons pills avec grand radius
- Sensation de « mission control » pour la visualisation de données

---

## 3. Inspirations outils de connaissance

### 3.1 Obsidian — Graphe de connaissance

**Site :** obsidian.md

**Ce qui est bon :**
- Graph view : visualisation en force-directed graph des notes connectées
- Chaque note = un nœud, les liens = des arêtes
- Possibilité de filtrer par tags, dossiers, chemins de recherche
- Animation fluide quand on clique sur un nœud : il devient le centre
- Interface sobre qui laisse le graphe respirer
- Canvas (espace infini) pour disposer visuellement les idées
- Thèmes sombres nombreux et bien conçus

**Ce qui ne l'est pas :**
- Le graph view devient illisible au-delà de ~500 nœuds
- Pas de 3D — tout est en 2D
- Pas de clustering visuel intelligent
- Les interactions sont limitées (zoom, cliquer, faire glisser)

**Patterns à appliquer pour Synapse :**
- **Force-directed layout** en 3D pour les embeddings ChromaDB
- **Focus+Context** : cliquer sur un nœud = il s'anime au centre avec ses connexions
- **Filtres par collection/tag** pour réduire le bruit visuel
- **Recherche textuelle** avec surlignage des nœuds correspondants
- **Tooltip au hover** : preview du contenu du document

### 3.2 Anytype — Memory Graph

**Ce qui est bon (recherche générale) :**
- Graph view en 3D isométrique
- Chaque objet (note, tâche, bookmark) est un nœud
- Relations typées entre objets (linked to, contains, etc.)
- Interface graphique épurée avec sidebar
- Palette de couleurs par type d'objet

**Ce qui ne l'est pas :**
- Performance parfois limitée avec beaucoup d'objets
- La 3D isométrique peut être désorientante

**Patterns à appliquer :**
- **Relations typées** : visualiser différents types de liens ChromaDB avec couleurs/styles d'arêtes différents
- **Catégories visuelles** : couleur/taille de nœud selon le type de document

### 3.3 Roam Research

**Ce qui est bon :**
- Structure en outline (hiérarchie) avec références bidirectionnelles
- Block-level referencing : chaque bloc de texte est un nœud potentiel du graphe
- Daily Notes comme point d'entrée principal
- Recherche instantanée avec résultats en temps réel

**Ce qui ne l'est pas :**
- Pas de visualisation graphique native (besoin de plugin tiers)
- UI très text-heavy, pas de rendu visuel

**Patterns à appliquer :**
- **Recherche temps réel** sur les embeddings avec résultats filtrés dans le graphe 3D
- **Entrées quotidiennes** comme point d'entrée dans la mémoire

---

## 4. Inspirations Spatial Computing & 3D

### 4.1 Apple Vision Pro — visionOS Spatial Computing

**Éléments clés du design spatial :**

1. **Fenêtres flottantes** : applications qui flottent dans l'espace avec reflets et ombres portées réalistes
2. **Navigation oculaire** : regarder pour sélectionner, tap des doigts pour valider
3. **Glassmorphism** : matériaux vitrés avec flou derrière (UIView with .glass material)
4. **Widgets** : informations disposées dans l'espace, persistantes entre sessions
5. **Environnements** : arrière-plans 360° qui transforment la pièce (Yosemite, Bora Bora, Jupiter)
6. **Mac Virtual Display** : écran géant incurvé équivalent à deux 5K
7. **EyeSight** : les yeux de l'utilisateur visibles à travers le casque

**Patterns UX :**
- Les apps occupent l'espace sans contrainte d'écran
- Les fenêtres peuvent être redimensionnées, repositionnées librement
- La lumière naturelle de la pièce affecte le rendu des apps (shadows, reflections)
- Transitions douces : fondu, glissement, scale
- Tap + regard comme interaction principale

**Ce qui est bon :**
- Métaphore spatiale naturelle — les données existent dans l'espace
- Les fenêtres vitrées avec flou sont élégantes et fonctionnelles
- Pas de barres de défilement traditionnelles — contenu qui s'étend dans l'espace

**Ce qui ne l'est pas :**
- Hardware coûteux, adoption limitée
- Certaines interactions (regarder pour sélectionner) ne sont pas adaptées au desktop

**Patterns à appliquer pour Synapse :**
- **Fenêtres d'info flottantes** au-dessus de la scène 3D (glassmorphism)
- **Widgets mémoire** : stats, collections récentes, tags disposés autour de la scène
- **Mode focus** : un embedding sélectionné s'anime au centre, entouré d'anneaux info
- **Transitions spatiales** : les nœuds qui s'écartent pour laisser place au focus
- **Éclairage** : la scène 3D réagit à l'heure ou à la « météo mémoire »

### 4.2 NASA Eyes — Visualisation de données spatiales

**Éléments clés (Eyes on the Solar System / Exoplanets) :**

- **Navigation 3D fluide** : orbite, zoom, pan, sélection d'objets célestes
- **Labels contextuels** : noms d'objets qui apparaissent au zoom
- **Timeline** : contrôle temporel pour voir l'évolution
- **Layers** : basculer entre différentes données (orbites, textures, grilles)
- **Mode guide** : visites guidées automatiques avec narration

**Patterns UX :**
- Le HUD est minimal — juste l'essentiel pour ne pas obstruer la vue
- Les informations contextuelles apparaissent au clic (info panel)
- La timeline est essentielle pour explorer des données temporelles
- Différents modes de visualisation (orbite, surface, carte)

**Ce qui est bon :**
- Contrôle caméra intuitif (OrbitControls amélioré)
- Hiérarchie d'information : vue d'ensemble → zoom → détails
- Timeline pour l'exploration temporelle

**Ce qui ne l'est pas :**
- Interface parfois technique (trop de paramètres visibles)
- Performance sur machines modestes

**Patterns à appliquer :**
- **Timeline ChromaDB** : voir l'évolution des embeddings dans le temps
- **OrbitControls** pour la navigation 3D principale
- **Info panel coulissant** au clic sur un nœud
- **Layers** : basculer clusters, timelines, connections, heatmaps
- **Mode présentation** : visites guidées de la mémoire

### 4.3 Tendances 3D Data Visualization

**CES 2024-2026 / Siggraph / Awwwards :**

- **Voxel/Splat rendering** pour datasets massifs (3D Gaussian Splatting)
- **Point cloud aesthetics** : les données comme nuage de points lumineux
- **Neon wireframe** : structures filaires néon sur fond sombre
- **Data as landscape** : embeddings visualisés comme des montagnes/vallées (UMAP/t-SNE landscapes)
- **Particle systems** : données comme particules interconnectées
- **Spatial audio feedback** : sons qui changent selon la densité/proximité des données

**Patterns :**
- Effet de profondeur de champ (blur) entre plans de données
- Animation perpétuelle douce (particules qui dérivent, connexions qui pulsent)
- Couleur = métadonnée (gradients, clusters, âge)
- Grille 3D subtile pour donner un repère spatial

---

## 5. Patterns concrets à appliquer

### 5.1 Architecture de l'interface Synapse

```
┌─────────────────────────────────────────────────┐
│ [Logo]   🔍 Cherche dans la mémoire...    ⚙️  │ ← Top bar (transparent/fond sombre)
├─────────┬───────────────────────────────────────┤
│         │                                       │
│  📂     │       ┌─────────────────────┐         │ ← Sidebar gauche
│  🏷️     │       │                     │         │   rétractable
│  🔥     │       │    SCÈNE 3D         │         │   icônes uniquement
│  ⏱️     │       │    (Three.js)       │         │
│         │       │                     │         │
│         │       │  •  •  •  •  •      │         │
│         │       │   •  •  •  •  •  •  │         │
│         │       │  •  •  ★  •  •      │         │
│         │       │   •  •  •  •  •  •  │         │
│         │       └─────────────────────┘         │
│         │                                       │
│         │  ┌─────────────────────────┐          │ ← Info panel
│         │  │  Document sélectionné   │          │   coulissant depuis
│         │  │  Titre / Résumé / Tags  │          │   la droite
│         │  └─────────────────────────┘          │
├─────────┴───────────────────────────────────────┤
│  💬 Commandez votre mémoire...           ⚡   │ ← Barre de commande/chat
└─────────────────────────────────────────────────┘
```

### 5.2 Composants UI spécifiques

#### A. Scene Canvas (composant principal)
- **Fond :** `#08090a` (Linear Onyx) ou `#000000` (Dala Void)
- **Grille subtile :** lignes fines `rgba(255,255,255,0.03)` pour repères 3D
- **OrbitControls** : rotation, zoom, pan
- **Auto-rotation** lente au repos

#### B. Force-Directed Graph 3D
- Nœuds = documents/embeddings
  - Taille = importance/fréquence d'accès
  - Couleur = collection/tag cluster
  - Forme = type de document (sphère, cube, icosaèdre)
  - Opacité = pertinence par rapport à la recherche
- Arêtes = similarités cosinus
  - Épaisseur = score de similarité
  - Couleur = type de relation
- Animation : les nœuds flottent doucement (particule Dala)
- Au clic : le nœud s'anime au centre avec un halo

#### C. Command Palette (Cmd+K)
- **Style :** Linear + Resend terminal aesthetic
- **Fond :** `#161718` (Obsidian) avec overlay semi-transparent
- **Fonctions :**
  - Recherche full-text dans tous les documents
  - Navigation : "va à la collection X"
  - Actions : "créer un snapshot de cette vue"
  - Filtres : "montre seulement les PDF"
  - Query : "trouve les documents sur l'architecture"

#### D. Info Panel (coulissant droite)
- **Style :** Sequel Carbon + Apple Vision Pro glassmorphism
- **Fond :** `#202020` (Carbon) ou glass `rgba(32,32,32,0.85)`
- **Largeur :** 360-420px
- **Contenu :**
  - Titre du document avec métadonnées
  - Résumé généré par IA
  - Tags avec couleurs
  - Embeddings similaires (mini graphe)
  - Actions : ouvrir, éditer, partager snapshot

#### E. Mini-Map / Overview
- Coin inférieur gauche
- Vue 2D réduite du graphe
- Cliquer = naviguer rapidement
- Option : montrer la densité de données comme heatmap

#### F. Timeline
- Barre horizontale en bas de la scène
- Curseur temporel pour voir l'évolution des embeddings
- Marqueurs pour les événements (imports, modifications)
- Animation : les nœuds apparaissent/disparaissent selon la date

#### G. Chat/Command Bar
- **Style :** Cursor AI bar
- En bas de l'écran, juste au-dessus de la timeline
- Prompt : « Décris ce que tu cherches dans ta mémoire... »
- Réponses contextuelles : « J'ai trouvé 12 documents similaires, les voici dans le graphe »

### 5.3 Palette Synapse Recommandée

**Version A (Dala/Linear Fusion) :**

| Rôle | Hex | Usage |
|------|-----|-------|
| Void | `#000000` | Fond scène 3D |
| Surface | `#0f1011` | Sidebar, top bar |
| Elevated | `#161718` | Modales, command palette |
| Border | `#23252a` | Bordures fines, séparateurs |
| Primary Text | `#ededf3` | Texte principal |
| Secondary Text | `#9a9a9a` | Texte secondaire |
| **Accent** | `#8052ff` | **Boutons, sélections, interactions** |
| Accent 2 | `#e4f222` | Highlights, tags importants |
| Success | `#27a644` | Status OK, connected |
| Warning | `#ffb829` | Alertes, attention |
| Node Color 1-6 | Palette | Gradient violet → cyan pour clusters |

**Version B (Mercury/Mission Control) :**

| Rôle | Hex | Usage |
|------|-----|-------|
| Deep Space | `#171721` | Fond scène |
| Midnight Slate | `#1e1e2a` | UI panels |
| **Accent** | `#5266eb` | **Interactions, CTAs** |
| Starlight | `#ededf3` | Texte primaire |
| Lead | `#70707d` | Bordures |

**Police recommandée :** Inter (UI), Space Grotesk (titres), JetBrains Mono (code/data)
**Base unit :** 4px
**Border radius :** 8px (containers), 9999px (pills), 4px (inputs)

### 5.4 Micro-Interactions

1. **Hover sur nœud** : léger scale (1.05), glow subtil, tooltip avec nom
2. **Click sur nœud** : animation smooth vers le centre + info panel s'ouvre
3. **Sélection multiple** : drag pour lasso en 3D
4. **Recherche** : les nœuds non-pertinents deviennent semi-transparents
5. **Transition de timeline** : nœuds qui apparaissent/fusionnent en fondu
6. **Ouverture command palette** : lancer radial avec blur sur la scène
7. **Loading/Streaming** : les nœuds arrivent en vague (wave animation)

---

## 6. 3 Recommandations Prioritaires

### 🔴 RECO #1 : Adopter un design system « Deep Void » (Dala + Linear)

**Action immédiate :**
- Implémenter la palette noire profonde (`#000000` / `#08090a`)
- Un seul accent néon (`#8052ff` violet ou `#e4f222` lime) pour tous les CTAs
- Une seule police UI (Inter) avec body en weight 300
- Supprimer toutes les ombres et dégradés de l'UI — la seule profondeur vient du rendu Three.js

**Justification :** Le design actuel souffre d'un manque de cohérence visuelle. Un design system strict, inspiré des meilleures apps de productivité, donnera immédiatement une identité premium à Synapse. Le « vide profond » est parfait pour une scène 3D de visualisation de données — il crée un contraste maximum avec les nœuds lumineux.

**Livrables :**
- [ ] Palette de couleurs définie en CSS custom properties
- [ ] Composants UI de base (boutons, inputs, modales, sidebar)
- [ ] Typography scale complète
- [ ] Thème dark uniquement (pas de light theme)

---

### 🟡 REC #2 : Architecture « Scene-First UI » (Apple Vision Pro + Sequel)

**Action immédiate :**
- La scène 3D Three.js occupe 100% de l'écran — pas de panneaux fixes qui la cachent
- Les éléments UI (sidebar, top bar, info panel) sont des **overlays flottants** semi-transparents
- L'info panel est un tiroir coulissant depuis la droite (ne couvre pas la scène entièrement)
- Au focus sur un nœud : la scène s'anime (zoom + rotation) comme transition naturelle
- Éviter les fenêtres modales classiques — préférer des panneaux latéraux

**Justification :** Les visualiseurs de données moches cachent les données derrière trop d'UI. Dans Synapse, les embeddings ChromaDB sont la star — l'interface doit s'effacer. L'approche « scene-first, UI as overlay » est la signature du design spatial d'Apple Vision Pro.

**Livrables :**
- [ ] Layout principal : scene plein écran + overlays positionnés
- [ ] Transition animation : nœud → focus center
- [ ] Info panel coulissant (right drawer)
- [ ] Glassmorphism sur les overlays (backdrop-filter: blur)

---

### 🟢 REC #3 : Command Palette + Timeline comme métaphores de navigation

**Action immédiate :**
- **Cmd+K Palette** : accès universel à tout (recherche, navigation, filtres, actions). C'est le centre de commande de Synapse.
- **Timeline** : barre temporelle en bas de la scène pour voir l'évolution de la mémoire. Les embeddings sont disposés dans l'espace 3D ET dans le temps.
- **Chat bar** (optionnel) : barre de langage naturel en bas pour interroger la mémoire sans connaitre les filtres complexes.

**Justification :** Le problème UX #1 de Synapse est probablement « comment trouver ce que je cherche dans cette masse de données 3D ». Une command palette type Linear résout la navigation. Une timeline résout la compréhension temporelle. Un chat résout la barrière technique.

**Livrables :**
- [ ] Composant CommandPalette avec recherche full-text + actions
- [ ] Timeline interactive (scrub, play/pause, events markers)
- [ ] (Stretch) Barre de chat pour questions en langage naturel vers ChromaDB

---

## Annexe : Références visuelles clés

1. **Linear** (linear.app) — Design system de référence pour la productivité dark mode
2. **Dala** (dala.craftedbygc.com) — Constellation de connaissances sur le vide cosmique
3. **Apple Vision Pro** (apple.com/apple-vision-pro) — Fenêtres flottantes, verre spatial
4. **NASA Eyes** (eyes.nasa.gov) — Navigation 3D de données spatiales
5. **Obsidian** (obsidian.md) — Graphe de connaissance en force-directed layout
6. **Fey** (feyapp.com) — Terminal trading avec design obsidienne
7. **Sequel** (sequel.co) — Galerie noire, approche éditoriale
8. **Mercury** (mercury.com) — Command center, mission control aesthetic
9. **Resend** (resend.com) — Terminal developer aesthetic
10. **Cursor** (cursor.com) — AI command bar intégrée

---

*Document généré par Atlas (Équipe Orion) pour le redesign de Synapse.*
*Prochaine étape : création du DESIGN.md pour l'agent de développement.*
