import { MemoryEntry, getTypeColor } from './memory-data';

export interface GraphNode {
  id: string;
  position: [number, number, number];
  color: string;
  size: number;
  type: string;
  entry: MemoryEntry;
}

export interface GraphEdge {
  source: string;
  target: string;
}

const CLUSTER_CENTERS: Record<string, [number, number, number]> = {
  architecture: [-4, 2, 0],
  bug: [4, -2, 0],
  decision: [0, 4, 2],
  learning: [0, -4, -2],
  preference: [3, 3, -2],
  system: [-3, -3, 2],
  note: [2, -1, 4],
  design: [-2, 1, -4],
};

export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

export function computeGraphLayout(entries: MemoryEntry[]): {
  nodes: GraphNode[];
  edges: GraphEdge[];
} {
  // Assign each node to a cluster center based on type
  const nodePositions: Map<string, [number, number, number]> = new Map();

  // Count how many nodes per type for spreading
  const typeCounts: Record<string, number> = {};
  const typeIndex: Record<string, number> = {};
  for (const entry of entries) {
    const t = entry.metadata.type || 'note';
    typeCounts[t] = (typeCounts[t] || 0) + 1;
    typeIndex[t] = typeIndex[t] ?? 0;
  }

  for (const entry of entries) {
    const t = entry.metadata.type || 'note';
    const center = CLUSTER_CENTERS[t] || [0, 0, 0];
    const idx = typeIndex[t];
    typeIndex[t] = idx + 1;
    const total = typeCounts[t] || 1;

    // Spread nodes in a sphere around the cluster center
    const seed = hashString(entry.id);
    const phi = (idx / total) * Math.PI * 2 + seededRandom(seed) * 0.5;
    const theta = Math.acos(2 * (idx / total) - 1) + seededRandom(seed + 1000) * 0.3;
    const radius = 1.5 + seededRandom(seed + 2000) * 1.0;

    const x = center[0] + radius * Math.sin(theta) * Math.cos(phi);
    const y = center[1] + radius * Math.sin(theta) * Math.sin(phi);
    const z = center[2] + radius * Math.cos(theta);

    nodePositions.set(entry.id, [x, y, z]);
  }

  // Create edges: connect nodes that share the same type or same project
  const edgeSet = new Set<string>();
  const edges: GraphEdge[] = [];

  const entriesByType: Record<string, MemoryEntry[]> = {};
  const entriesByProject: Record<string, MemoryEntry[]> = {};

  for (const entry of entries) {
    const t = entry.metadata.type || 'note';
    const p = entry.metadata.project || 'general';
    (entriesByType[t] ??= []).push(entry);
    (entriesByProject[p] ??= []).push(entry);
  }

  // Edges within same type (connect each node to others with some limit)
  for (const group of Object.values(entriesByType)) {
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < Math.min(i + 3, group.length); j++) {
        const key = [group[i].id, group[j].id].sort().join('--');
        if (!edgeSet.has(key)) {
          edgeSet.add(key);
          edges.push({ source: group[i].id, target: group[j].id });
        }
      }
    }
  }

  // Edges within same project
  for (const group of Object.values(entriesByProject)) {
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < Math.min(i + 3, group.length); j++) {
        const key = [group[i].id, group[j].id].sort().join('--');
        if (!edgeSet.has(key)) {
          edgeSet.add(key);
          edges.push({ source: group[i].id, target: group[j].id });
        }
      }
    }
  }

  // Compute node sizes based on edge count (importance)
  const edgeCounts: Record<string, number> = {};
  for (const edge of edges) {
    edgeCounts[edge.source] = (edgeCounts[edge.source] || 0) + 1;
    edgeCounts[edge.target] = (edgeCounts[edge.target] || 0) + 1;
  }

  const maxEdges = Math.max(1, ...Object.values(edgeCounts));

  const nodes: GraphNode[] = entries.map((entry) => {
    const pos = nodePositions.get(entry.id) || [0, 0, 0];
    const count = edgeCounts[entry.id] || 0;
    const size = 0.25 + (count / maxEdges) * 0.35;
    const color = getTypeColor(entry.metadata.type || 'note');
    return {
      id: entry.id,
      position: pos,
      color,
      size,
      type: entry.metadata.type || 'note',
      entry,
    };
  });

  return { nodes, edges };
}
