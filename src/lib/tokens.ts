// ── Design Tokens ──
// Synapse v3.0 — Knowledge Graph Terminal
// Inspiré de Mercury, Linear, Ramp

export const tokens = {
  // Colors
  deep: '#0c0a09',
  surface: '#141315',
  raised: '#1c1b1e',
  border: '#272629',
  borderLight: '#3b3a3d',
  textPrimary: '#e8e7e8',
  textSecondary: '#a1a0a4',
  textTertiary: '#636266',
  accent: '#f59e0b',
  accentSubtle: 'rgba(245, 158, 11, 0.12)',

  // Typography (in pixels)
  caption: 10,
  label: 11,
  bodySm: 12,
  body: 13,
  bodyLg: 14,
  subheading: 15,

  // Spacing (4px base)
  spacing: {
    px2: 2,
    px4: 4,
    px6: 6,
    px8: 8,
    px10: 10,
    px12: 12,
    px14: 14,
    px16: 16,
    px18: 18,
    px20: 20,
    px24: 24,
    px28: 28,
    px32: 32,
    px40: 40,
  },

  // Radius
  radius: {
    sm: 4,
    md: 6,
    lg: 10,
  },
} as const;

// Helper: surface elevation (no shadows — use color)
export function surface(level: 0 | 1 | 2): string {
  return [tokens.deep, tokens.surface, tokens.raised][level];
}

// Helper: border style
export const border = `1px solid ${tokens.border}`;
export const borderLight = `1px solid ${tokens.borderLight}`;
