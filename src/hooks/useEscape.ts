'use client';

import { useEffect } from 'react';

/**
 * Hook partagé pour la gestion de la touche Escape.
 * Évite la duplication dans SearchOverlay et DetailPanel.
 */
export function useEscape(handler: () => void) {
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handler();
    };
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [handler]);
}
