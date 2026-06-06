# PLAN ARCHITECTURE — Refonte Synapse

**Auteur :** Axiom
**Date :** 2026-06-06
**Références :** `RECHERCHE_REFERO.md` (design system), `CRITIQUE_MOMUS.md` (audit code)

---

## Résumé exécutif

Synapse est un visualiseur 3D de mémoire (graphe de nœuds). L'architecture 3D (`neuron-scene.tsx`, `graph-layout.ts`) est excellente. Le frontend souffre de **3 composants orphelins**, de **classes CSS cassées**, de **duplication de logique**, d'**absence de gestion d'erreur**, et de **0 tests**.

**État actuel :** 10 fichiers source ~1200 lignes
**État cible :** 18 fichiers source + tests
**Ratio :** ~40% refactor, ~30% création, ~30% conservé

---

## 1. Fichiers à SUPPRIMER

### `src/components/bento-grid.tsx`
- **Raison :** Jamais importé nulle part. `lg:grid-cols-1` est un bug (inversion logique). Inutilisé.
- **Lignes :** 49
- **Dépendances aval :** Aucune

### `src/components/magnetic-button.tsx`
- **Raison :** Jamais importé nulle part. Variable `Component` assignée mais jamais utilisée (ligne 34). Duplication de logique de rendu (`as === 'button'` fait deux fois).
- **Lignes :** 68
- **Dépendances aval :** Aucune

### `src/components/memory-modal.tsx`
- **Raison :** Jamais importé nulle part. Classes CSS **inexistantes** (`bg-obsidian`, `border-graphite`, `shadow-elevated`, `bg-iron` — lignes 107, 123, 126). `import { MemoryEntry }` au lieu de `import type` (ligne 5). **REMARQUE :** Ce fichier est supprimé MAIS son contenu (variants de modale, bottom sheet mobile) est intégré dans le nouveau `detail-panel.tsx` (fichier de remplacement, voir section 3).
- **Lignes :** 137
- **Dépendances aval :** `import MemoryCard` (recréé dans le nouveau fichier)

---

## 2. Fichiers à MODIFIER

### 2.1 `src/lib/graph-layout.ts` — ✅ Aucune modification nécessaire
- **Qualité :** Excellent. Interfaces claires, layout cluster déterministe, taille proportionnelle au degré.
- **Modifications :** 0 (conservé tel quel)

---

### 2.2 `src/lib/memory-data.ts` — 2 modifications

#### M1 — Gestion d'erreur dans `loadMemoryData`
```ts
// AVANT
export async function loadMemoryData(): Promise<MemoryEntry[]> {
  const res = await fetch('/data.json');
  const data = await res.json();
  return data;
}

// APRÈS
export async function loadMemoryData(): Promise<MemoryEntry[]> {
  try {
    const res = await fetch('/data.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: unknown = await res.json();
    if (!Array.isArray(data)) throw new Error('Format de données invalide');
    return data as MemoryEntry[];
  } catch (err) {
    console.error('[memory-data] Échec chargement:', err);
    throw err;
  }
}
```
- **Lignes concernées :** 11-16 → 11-22
- **Risque :** ⚠️ Les appelants (page.tsx) doivent gérer le rejet de la promesse

#### M2 — Ajout d'une interface `MemoryDataError`
```ts
export class MemoryLoadError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'MemoryLoadError';
  }
}
```

---

### 2.3 `src/app/globals.css` — 1 modification

#### M3 — Harmonisation `font-family` avec `next/font/google`
```css
/* AVANT */
--font-sans: "Inter Variable", system-ui, -apple-system, sans-serif;
--font-mono: "JetBrains Mono Variable", monospace;

/* APRÈS */
--font-sans: var(--font-inter), system-ui, -apple-system, sans-serif;
--font-mono: "JetBrains Mono Variable", monospace;
```
- **Lignes concernées :** 6-7
- **Raison :** Évite le FOUT (Flash Of Unstyled Text). `layout.tsx` charge Inter via `next/font/google` avec `variable: "--font-inter"` mais `globals.css` référence `"Inter Variable"` directement — les deux sont redondants.

---

### 2.4 `src/app/layout.tsx` — 1 modification

#### M4 — Correction de la référence font dans `<html>`
```tsx
// AVANT
<html lang="fr" className={`${inter.variable}`}>

// APRÈS
<html lang="fr" className={inter.variable}>
```
- **Lignes concernées :** 18
- **Raison :** Template literal inutile quand il n'y a qu'une seule classe. Style, pas critique.

#### M5 — Ajout d'`ErrorBoundary` wrapper
```tsx
// APRÈS
import { ErrorBoundary } from '@/components/error-boundary';

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={inter.variable}>
      <body>
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  );
}
```

---

### 2.5 `src/components/neuron-scene.tsx` — 3 modifications critiques

#### M6 — Rendre `Math.random()` déterministe (Float speed/intensity)
```tsx
// AVANT (lignes 45-47)
<Float
  speed={1.5 + Math.random() * 0.5}
  rotationIntensity={0.1}
  floatIntensity={0.3 + Math.random() * 0.2}
  position={node.position}
>

// APRÈS
const floatSpeed = useMemo(
  () => 1.5 + (hashString(node.id) % 100) / 100 * 0.5,
  [node.id]
);
const floatIntensity = useMemo(
  () => 0.3 + (hashString(node.id + '_int') % 100) / 100 * 0.2,
  [node.id]
);
```
- **Lignes concernées :** 45-47
- **Raison :** `Math.random()` à chaque rendu → SSR mismatch potentiel, instabilité. Utiliser la seed de l'ID du nœud.
- **Dépendance :** Importer `hashString` depuis `@/lib/graph-layout` (actuellement non exportée)

#### M7 — Dépendances `useMemo` des EdgeLine points
```tsx
// AVANT (lignes 136-142)
const points = useMemo(
  () => [
    new THREE.Vector3(...source.position),
    new THREE.Vector3(...target.position),
  ],
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [],
);

// APRÈS
const points = useMemo(
  () => [
    new THREE.Vector3(...source.position),
    new THREE.Vector3(...target.position),
  ],
  [source.position, target.position],
);
```
- **Lignes concernées :** 136-142, 148-150, 152-154
- **Raison :** Si `source.position` ou `target.position` changent (layout recalculé), les arêtes restent figées aux anciennes positions.
- **Même correction pour** `mid` (ligne 148) et `direction` (ligne 152)

#### M8 — `as any` → typage correct Three.js
```tsx
// AVANT (ligne 170)
(meshRef.current.material as any).dashOffset

// APRÈS
import { LineDashedMaterial } from 'three';
(meshRef.current.material as LineDashedMaterial).dashOffset
```
- **Lignes concernées :** 170
- **Raison :** TypeScript unsafe. `LineDashedMaterial.dashOffset` existe dans les types Three.js.

#### M9 — Export de `hashString` depuis `graph-layout.ts`
- **Ajout :** `export function hashString` (actuellement privée)
- **Raison :** `neuron-scene.tsx` en a besoin pour M6

---

### 2.6 `src/components/memory-card.tsx` — 1 modification

#### M10 — Extraction de `relativeTime` vers `lib/time.ts`
```tsx
// AVANT (lignes 4-15)
function relativeTime(ts?: string): string { ... }

// APRÈS
import { relativeTime } from '@/lib/time';
```
- **Lignes concernées :** 4-15 supprimées, import ajouté ligne 1
- **Raison :** Évite la duplication si d'autres composants ont besoin de la même fonction. Fonction exportée depuis un module partagé.

---

### 2.7 `src/app/page.tsx` — 4 modifications majeures

#### M11 — Remplacer 3× `entries.find()` par une `Map`
```tsx
// AVANT (lignes 262, 265, 269)
{entries.find(e => e.id === hoveredId)?.metadata.type}
{entries.find(e => e.id === hoveredId)?.text}

// APRÈS — Ajout en haut du composant Home()
const entriesMap = useMemo(
  () => new Map(entries.map(e => [e.id, e])),
  [entries]
);

// Puis dans le tooltip :
{entriesMap.get(hoveredId)?.metadata.type}
{entriesMap.get(hoveredId)?.text}
```
- **Lignes concernées :** 188 (selectedEntry), 262, 265, 269
- **Raison :** O(n) × 3 à chaque rendu → O(1) × 3. Critique pour 300+ entrées.

#### M12 — Extraction de `SearchOverlay` → `src/components/search-overlay.tsx`
- Supprimer les lignes 10-109 de page.tsx
- Les remplacer par `import SearchOverlay from '@/components/search-overlay'`
- **Raison :** Composant inline de 100 lignes dans le fichier principal. Violation de séparation des responsabilités.

#### M13 — Extraction de `DetailPanel` → `src/components/detail-panel.tsx`
- Supprimer les lignes 111-161 de page.tsx
- Les remplacer par `import DetailPanel from '@/components/detail-panel'`
- Ce nouveau fichier **intègre** la logique du `MemoryModal` supprimé (variants desktop/mobile, spring animations, bottom sheet mobile) + les classes CSS corrigées
- **Raison :** Remplace l'ancien `MemoryModal` (cassé) et l'`DetailPanel` inline (duplication Escape). Unifie en un seul composant.

#### M14 — Gestion d'erreur pour `loadMemoryData` dans page.tsx
```tsx
// AVANT
const [entries, setEntries] = useState<MemoryEntry[]>([]);

useEffect(() => {
  if (loaded.current) return;
  loaded.current = true;
  loadMemoryData().then(setEntries);
}, []);

// APRÈS
const [entries, setEntries] = useState<MemoryEntry[]>([]);
const [error, setError] = useState<string | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  if (loaded.current) return;
  loaded.current = true;
  setLoading(true);
  loadMemoryData()
    .then(setEntries)
    .catch((err) => setError(err instanceof Error ? err.message : 'Erreur inconnue'))
    .finally(() => setLoading(false));
}, []);

// Nouvel état d'erreur dans le rendu :
if (error) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#070708]">
      <div className="flex flex-col items-center gap-4">
        <p className="text-sm text-[#ef4444]">Erreur : {error}</p>
        <button onClick={() => { loaded.current = false; /* re-run */ }}
          className="text-xs text-[#8a8f98] hover:text-[#f7f8f8] underline">
          Réessayer
        </button>
      </div>
    </div>
  );
}
```
- **Lignes concernées :** 163-175 (Home component)
- **Raison :** Sans cela, l'application reste bloquée sur « Connexion à la mémoire... » indéfiniment si le fetch échoue.

---

## 3. Fichiers à CRÉER

### 3.1 `src/lib/time.ts` — Utilitaire temps
```ts
export function relativeTime(ts?: string): string {
  if (!ts) return '';
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "À l'instant";
  if (mins < 60) return `Il y a ${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `Il y a ${days}j`;
  return new Date(ts).toLocaleDateString('fr-FR');
}
```
- **Extrait de :** `memory-card.tsx` (lignes 4-15)
- **Dépendances :** Aucune

### 3.2 `src/hooks/useEscape.ts` — Hook Escape partagé
```ts
'use client';
import { useEffect } from 'react';

export function useEscape(onEscape: () => void, active = true) {
  useEffect(() => {
    if (!active) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onEscape();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onEscape, active]);
}
```
- **Remplace :** 3 implémentations manuelles (SearchOverlay, DetailPanel, MemoryModal → maintenant unified dans detail-panel.tsx)
- **Dépendances :** Aucune

### 3.3 `src/hooks/useFocusTrap.ts` — Piège à focus pour modale
```ts
'use client';
import { useEffect, useRef } from 'react';

export function useFocusTrap(active: boolean) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !ref.current) return;
    const focusableSelector = 'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])';
    const container = ref.current;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !container) return;
      const focusable = container.querySelectorAll<HTMLElement>(focusableSelector);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [active]);

  return ref;
}
```
- **Raison :** Accessibilité — les modales doivent piéger le focus
- **Dépendances :** Aucune

### 3.4 `src/hooks/useBodyScrollLock.ts` — Blocage du scroll
```ts
'use client';
import { useEffect } from 'react';

export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [locked]);
}
```
- **Raison :** Quand le détail panel est ouvert, le body ne doit pas scroller derrière

### 3.5 `src/components/error-boundary.tsx` — ErrorBoundary global
```tsx
'use client';
import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="fixed inset-0 flex items-center justify-center bg-[#070708]">
          <div className="flex flex-col items-center gap-4 max-w-md text-center">
            <p className="text-sm text-[#ef4444]">
              Une erreur est survenue
            </p>
            <p className="text-xs text-[#62666d]">
              {this.state.error?.message}
            </p>
            <button onClick={() => this.setState({ hasError: false, error: null })}
              className="text-xs text-[#8a8f98] hover:text-[#f7f8f8] underline">
              Réessayer
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
```

### 3.6 `src/components/search-overlay.tsx` — Extrait de page.tsx
- **Contenu :** Copier les lignes 10-109 de page.tsx, exporter par défaut
- **Modifications :** 
  - Ajouter `useEscape` hook
  - Ajouter `aria-label`, `role="dialog"`, `aria-modal="true"`
  - Ajouter `prefers-reduced-motion` support
  - `import { useEscape } from '@/hooks/useEscape'`
  - Remplacer le `useEffect` Escape inline par `useEscape(onClose, true)`

### 3.7 `src/components/detail-panel.tsx` — Remplace MemoryModal + DetailPanel inline
- **Contenu :** Fusion de `MemoryModal` (supprimé) et du `DetailPanel` inline de page.tsx
- **Décision de design :** Centered modal desktop + bottom sheet mobile (de MemoryModal) avec les classes CSS corrigées
  - `bg-obsidian` → `bg-[#0f1011]`
  - `border-graphite` → `border-[#23252a]/80`
  - `shadow-elevated` → `shadow-[0_16px_48px_-12px_rgba(0,0,0,0.6)]`
  - `bg-iron` → `bg-[#23252a]`
- **Nouveautés :**
  - `useEscape(onClose, open)`
  - `useFocusTrap(open)`
  - `useBodyScrollLock(open)`
  - `aria-modal="true"`, `role="dialog"`, `aria-label="Détail de la mémoire"`
  - `prefers-reduced-motion` support

### 3.8 `src/__tests__/graph-layout.test.ts` — Tests unitaires
```ts
import { describe, it, expect } from 'vitest';
import { computeGraphLayout } from '@/lib/graph-layout';
import type { MemoryEntry } from '@/lib/memory-data';

const mockEntries: MemoryEntry[] = [
  { id: '1', text: 'Test', metadata: { type: 'note', project: 'proj1', timestamp: '2025-01-01' } },
  { id: '2', text: 'Test 2', metadata: { type: 'note', project: 'proj1', timestamp: '2025-01-02' } },
  { id: '3', text: 'Test 3', metadata: { type: 'architecture', project: 'proj2', timestamp: '2025-01-03' } },
];

describe('computeGraphLayout', () => {
  it('retourne des nœuds et des arêtes', () => {
    const { nodes, edges } = computeGraphLayout(mockEntries);
    expect(nodes).toHaveLength(3);
    expect(edges.length).toBeGreaterThan(0);
  });

  it('assigne une position 3D à chaque nœud', () => {
    const { nodes } = computeGraphLayout(mockEntries);
    for (const node of nodes) {
      expect(node.position).toHaveLength(3);
      expect(node.position.every(v => typeof v === 'number')).toBe(true);
    }
  });

  it('est déterministe (même seed = mêmes positions)', () => {
    const { nodes: nodes1 } = computeGraphLayout(mockEntries);
    const { nodes: nodes2 } = computeGraphLayout(mockEntries);
    for (let i = 0; i < nodes1.length; i++) {
      expect(nodes1[i].position).toEqual(nodes2[i].position);
    }
  });

  it('taille proportionnelle au degré', () => {
    const { nodes } = computeGraphLayout(mockEntries);
    for (const node of nodes) {
      expect(node.size).toBeGreaterThan(0);
    }
  });
});
```

### 3.9 `src/__tests__/memory-data.test.ts` — Tests unitaires
```ts
import { describe, it, expect } from 'vitest';
import { getTypeColor, getTypeIcon } from '@/lib/memory-data';

describe('getTypeColor', () => {
  it('retourne une couleur pour chaque type connu', () => {
    for (const type of ['architecture', 'bug', 'decision', 'learning', 'preference', 'system', 'note']) {
      expect(getTypeColor(type)).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
  it('retourne zinc (#71717A) pour un type inconnu', () => {
    expect(getTypeColor('unknown')).toBe('#71717A');
  });
});

describe('getTypeIcon', () => {
  it('retourne une icône pour chaque type', () => {
    expect(getTypeIcon('architecture')).toBe('cpu');
    expect(getTypeIcon('unknown')).toBe('file-text');
  });
});
```

### 3.10 `src/__tests__/memory-card.test.tsx` — Test de rendu
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MemoryCard from '@/components/memory-card';
import type { MemoryEntry } from '@/lib/memory-data';

const entry: MemoryEntry = {
  id: '1',
  text: 'Contenu de test pour la carte mémoire.',
  metadata: { type: 'note', project: 'Projet Alpha', timestamp: new Date().toISOString() },
};

describe('MemoryCard', () => {
  it('affiche le texte', () => {
    render(<MemoryCard entry={entry} />);
    expect(screen.getByText(/Contenu de test/)).toBeDefined();
  });

  it('affiche le type en uppercase', () => {
    render(<MemoryCard entry={entry} />);
    expect(screen.getByText('NOTE')).toBeDefined();
  });

  it('tronque à 100 caractères en mode compact', () => {
    const longEntry = { ...entry, text: 'A'.repeat(200) };
    render(<MemoryCard entry={longEntry} compact />);
    expect(screen.getByText(/…/)).toBeDefined();
  });
});
```

---

## 4. Arbre des fichiers (avant → après)

```
AVANT (11 fichiers)                          APRÈS (17 fichiers)
────────────────────                         ────────────────────
src/app/layout.tsx                           src/app/layout.tsx          ✅ modifié (ErrorBoundary)
src/app/globals.css                          src/app/globals.css         ✅ modifié (font-family)
src/app/page.tsx                             src/app/page.tsx            ✅ modifié (Map, erreur, extraction)
src/app/favicon.ico                          src/app/favicon.ico         ✅ conservé
src/components/neuron-scene.tsx              src/components/neuron-scene.tsx   ✅ modifié (3 fixes)
src/components/memory-card.tsx               src/components/memory-card.tsx    ✅ modifié (import time)
src/components/memory-modal.tsx              ~~ SUPPRIMÉ ~~
src/components/bento-grid.tsx                ~~ SUPPRIMÉ ~~
src/components/magnetic-button.tsx           ~~ SUPPRIMÉ ~~
src/lib/graph-layout.ts                      src/lib/graph-layout.ts     ✅ conservé (+ export hashString)
src/lib/memory-data.ts                       src/lib/memory-data.ts      ✅ modifié (error handling)
                                             src/lib/time.ts             ✨ NOUVEAU
                                             src/hooks/useEscape.ts      ✨ NOUVEAU
                                             src/hooks/useFocusTrap.ts   ✨ NOUVEAU
                                             src/hooks/useBodyScrollLock.ts ✨ NOUVEAU
                                             src/components/error-boundary.tsx ✨ NOUVEAU
                                             src/components/search-overlay.tsx ✨ NOUVEAU
                                             src/components/detail-panel.tsx ✨ NOUVEAU
                                             src/__tests__/graph-layout.test.ts ✨ NOUVEAU
                                             src/__tests__/memory-data.test.ts ✨ NOUVEAU
                                             src/__tests__/memory-card.test.tsx ✨ NOUVEAU
```

---

## 5. Ordre d'exécution

### Phase 0 — Préparation (sans risque)
| Ordre | Action | Fichier | Justification |
|-------|--------|---------|---------------|
| 0.1 | Exporter `hashString` | `src/lib/graph-layout.ts` | Dépendance nécessaire pour M6 |
| 0.2 | Créer `src/lib/time.ts` | Nouveau | Dépendance pour M10 |
| 0.3 | Créer `src/hooks/useEscape.ts` | Nouveau | Dépendance pour search-overlay + detail-panel |
| 0.4 | Créer `src/hooks/useFocusTrap.ts` | Nouveau | Dépendance pour detail-panel |
| 0.5 | Créer `src/hooks/useBodyScrollLock.ts` | Nouveau | Dépendance pour detail-panel |
| 0.6 | Créer `src/components/error-boundary.tsx` | Nouveau | Dépendance pour layout.tsx |

### Phase 1 — Corrections sans changement d'interface
| Ordre | Action | Fichier | Justification |
|-------|--------|---------|---------------|
| 1.1 | M1 : Error handling | `src/lib/memory-data.ts` | Ne casse rien, ajoute seulement |
| 1.2 | M3 : font-family fix | `src/app/globals.css` | CSS only, safe |
| 1.3 | M6 : Math.random → déterministe | `src/components/neuron-scene.tsx` | Safe, même comportement visuel |
| 1.4 | M7 : useMemo deps | `src/components/neuron-scene.tsx` | Safe, meilleures dépendances |
| 1.5 | M8 : as any → LineDashedMaterial | `src/components/neuron-scene.tsx` | Safe, typage only |
| 1.6 | M10 : relativeTime → import | `src/components/memory-card.tsx` | Changement d'import, safe |

### Phase 2 — Extraction de composants
| Ordre | Action | Fichier | Justification |
|-------|--------|---------|---------------|
| 2.1 | Créer `src/components/search-overlay.tsx` | Nouveau | Copie depuis page.tsx + hooks |
| 2.2 | Créer `src/components/detail-panel.tsx` | Nouveau | Fusion MemoryModal + DetailPanel |
| 2.3 | M12 : Importer SearchOverlay | `src/app/page.tsx` | Remplacer inline |
| 2.4 | M13 : Importer DetailPanel | `src/app/page.tsx` | Remplacer inline |

### Phase 3 — Modifications majeures de page.tsx
| Ordre | Action | Fichier | Justification |
|-------|--------|---------|---------------|
| 3.1 | M11 : entries Map + tooltip | `src/app/page.tsx` | Performance + refactor tooltip |
| 3.2 | M14 : Error state | `src/app/page.tsx` | Gestion d'erreur data loading |
| 3.3 | M4-M5 : ErrorBoundary dans layout | `src/app/layout.tsx` | Wrapper global |

### Phase 4 — Nettoyage
| Ordre | Action | Fichier | Justification |
|-------|--------|---------|---------------|
| 4.1 | Supprimer `bento-grid.tsx` | Suppression | Orphelin |
| 4.2 | Supprimer `magnetic-button.tsx` | Suppression | Orphelin |
| 4.3 | Supprimer `memory-modal.tsx` | Suppression | Remplacé par detail-panel.tsx |

### Phase 5 — Tests
| Ordre | Action | Fichier | Justification |
|-------|--------|---------|---------------|
| 5.1 | Tests graph-layout | `src/__tests__/graph-layout.test.ts` | Critique, déterministe |
| 5.2 | Tests memory-data | `src/__tests__/memory-data.test.ts` | Utile, fonctions pures |
| 5.3 | Tests memory-card | `src/__tests__/memory-card.test.tsx` | Rendu composant |

---

## 6. Pièges à éviter

### 🔴 Bloquants

| # | Piège | Explication | Solution |
|---|-------|------------|----------|
| 1 | **Supprimer `memory-modal.tsx` avant d'avoir créé `detail-panel.tsx`** | `DetailPanel` de page.tsx n'a pas les variants mobile/desktop. Si on supprime MemoryModal trop tôt, on perd son code de bottom sheet mobile. | Créer `detail-panel.tsx` EN PREMIER (Phase 2), puis supprimer `memory-modal.tsx` (Phase 4). |
| 2 | **M6 sans exporter `hashString`** | `hashString` est privée dans `graph-layout.ts`. `neuron-scene.tsx` ne peut pas l'importer. | Phase 0.1 AVANT Phase 1.3. |
| 3 | **M13 qui casse l'import de `MemoryCard`** | `detail-panel.tsx` doit importer `MemoryCard`. Si `memory-card.tsx` a été modifié (M10), vérifier que l'import est correct. | Ajouter explicitement `import MemoryCard from '@/components/memory-card'` dans le nouveau fichier. |
| 4 | **M14 qui crée une boucle infinie de rechargement** | Le bouton « Réessayer » doit réinitialiser `loaded.current = false` ET `error = null` ET `loading = true`. Si l'un manque, le `useEffect` ne se réexécute pas. | Tester que `loaded.current = false; setError(null); setLoading(true)` sont tous appelés. |
| 5 | **Conflit entre `globals.css` et `layout.tsx` après M3** | Si `globals.css` utilise `var(--font-inter)` mais que `layout.tsx` n'applique pas `inter.variable` correctement, la police tombe en fallback système. | Vérifier que `<html>` a bien la classe `inter.variable`. M4 le fait explicitement. |

### 🟡 Attention

| # | Piège | Explication | Solution |
|---|-------|------------|----------|
| 6 | **M6 : `useMemo` avec `hashString` non mémorisé peut être + lent** | `hashString` est O(n) sur la longueur de l'ID. Pour 300 nœuds, négligeable. Mais ne pas mettre l'appel dans le render direct. | Garder `useMemo` — c'est déjà fait. |
| 7 | **M7 : `source.position` est un tuple `[number, number, number]`** | Three.js `Vector3` est passé par référence. `useMemo` compare par référence. Si le tuple change, `useMemo` se recalcule. | ✅ C'est correct : si les positions changent, on veut recalculer. |
| 8 | **M11 : La `Map` est créée à chaque rendu de `Home()`** | Si `useMemo` n'est pas utilisé, une nouvelle Map est créée à chaque render. | ✅ `useMemo([entries])` est présent. |
| 9 | **Accessibilité : `prefers-reduced-motion`** | Les animations Framer Motion peuvent causer des nausées chez certains utilisateurs. Aucun support actuellement. | Dans les composants extraits, ajouter `import { useReducedMotion } from 'framer-motion'` et conditionner les animations. |
| 10 | **Les imports `@/` path alias** | Next.js `@/` alias doit être configuré dans `tsconfig.json` ou `jsconfig.json`. Vérifier qu'il existe. | Vérifier `compilerOptions.paths["@/*"]` dans `tsconfig.json` avant toute modification d'import. |
| 11 | **Test setup : Vitest + React Testing Library** | Le projet n'a pas de config test. `vitest.config.ts` doit être créé, et `@testing-library/react` installé. | Ajouter `npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom` ou avec `pnpm`/`yarn`. |
| 12 | **Suppression des composants orphelins qui pourrait casser une feature future** | `BentoGrid` et `MagneticButton` pourraient être utiles. Mais le code mort est un anti-pattern. Si nécessaire, les ressusciter depuis git. | `git rm` puis `git commit`. Si besoin plus tard, `git checkout HEAD~1 -- <file>`. |

---

## 7. Dépendances entre fichiers (graphe)

```
layout.tsx
  └── error-boundary.tsx (nouveau)
  └── globals.css

page.tsx
  ├── neuron-scene.tsx
  │     ├── graph-layout.ts (hashString exporté)
  │     └── memory-data.ts (MemoryEntry type)
  ├── memory-card.tsx
  │     └── lib/time.ts (nouveau — relativeTime extrait)
  ├── search-overlay.tsx (nouveau — extrait de page.tsx)
  │     └── hooks/useEscape.ts (nouveau)
  ├── detail-panel.tsx (nouveau — remplace MemoryModal + DetailPanel)
  │     ├── hooks/useEscape.ts
  │     ├── hooks/useFocusTrap.ts
  │     ├── hooks/useBodyScrollLock.ts
  │     └── memory-card.tsx
  └── memory-data.ts
        ├── MemoryEntry type
        ├── loadMemoryData() (try/catch ajouté)
        ├── getTypeColor()
        └── getTypeIcon()
```

**Aucune dépendance cyclique** — le graphe est un DAG propre. La Phase 0 doit être exécutée en premier car elle crée les feuilles du graphe (hooks, librairies) dont les phases suivantes dépendent.

---

## 8. Design system (orientation Refero)

La refonte **n'applique pas** encore un style Refero complet, mais les modifications CSS et les nouveaux composants suivent les principes identifiés dans `RECHERCHE_REFERO.md` :

| Principe Refero | Application dans Synapse |
|-----------------|-------------------------|
| **Palette achromatique dominante** | Conserver `bg-[#070708]`, `bg-[#0f1011]`, `border-[#23252a]` — déjà aligné Linear/Mercury |
| **Un seul accent chromatique** | L'ambre `#f59e0b` est déjà l'accent unique — cohérent |
| **Anti-#000** | Déjà respecté (`#070708` pour le fond) |
| **Boutons pill radius** | À implémenter dans les futurs boutons |
| **Zéro shadow (Anthropic/Vercel/Mercury)** | Déjà minimal (`shadow-[...]` seulement pour les cartes élevées) |
| **Max-width 1200px** | Déjà implicite dans le layout |
| **Police variable Inter + JetBrains Mono** | Déjà configuré |

---

*Plan rédigé par **Axiom**, le 6 juin 2026, sur la base de `RECHERCHE_REFERO.md` et `CRITIQUE_MOMUS.md`.*
