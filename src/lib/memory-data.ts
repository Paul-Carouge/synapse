export interface MemoryEntry {
  id: string;
  text: string;
  metadata: {
    type?: string;
    project?: string;
    timestamp?: string;
  };
}

export async function loadMemoryData(): Promise<MemoryEntry[]> {
  try {
    const res = await fetch('/data.json');
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    const data = await res.json();
    if (!Array.isArray(data)) {
      throw new Error('Format invalide — tableau attendu');
    }
    return data;
  } catch (err) {
    console.error('[Synapse] Échec chargement mémoire:', err);
    return [];
  }
}

export function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    architecture: '#F59E0B',
    bug: '#EF4444',
    decision: '#3B82F6',
    learning: '#22C55E',
    preference: '#A855F7',
    system: '#06B6D4',
    note: '#71717A',
    design: '#f54e00',
  };
  return colors[type] ?? '#71717A';
}

export function getTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    architecture: 'cpu', bug: 'bug', decision: 'check-circle',
    learning: 'book', preference: 'heart', system: 'server', note: 'file-text', design: 'palette',
  };
  return icons[type] ?? 'file-text';
}
