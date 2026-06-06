'use client';

import { useEffect, useRef } from 'react';

/**
 * Piège à focus pour les overlays modaux.
 * Maintient le focus à l'intérieur du conteneur.
 */
export function useFocusTrap(active: boolean) {
  const ref = useRef<HTMLDivElement>(null!);

  useEffect(() => {
    if (!active) return;

    const el = ref.current;
    if (!el) return;

    const focusable = el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    first?.focus();

    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [active]);

  return ref;
}
