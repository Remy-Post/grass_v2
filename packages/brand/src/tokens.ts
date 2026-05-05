export const colors = {
  brand: '#1f5a3a',
  brandDark: '#163f29',
  grass: '#7cb342',
  accent: '#f5c518',
  bg: '#f7f6f1',
  surface: '#ffffff',
  surfaceAlt: '#efeee7',
  ink: '#1a1f1a',
  inkSoft: '#4a534a',
  inkMuted: '#7a807a',
  line: '#e2e0d6',
} as const;

export type ColorToken = keyof typeof colors;

export const fonts = {
  sans: 'var(--font-geist), system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  display: 'var(--font-fraunces), Georgia, "Times New Roman", serif',
} as const;

export const radii = {
  sm: '0.375rem',
  md: '0.625rem',
  lg: '1rem',
  xl: '1.5rem',
  pill: '9999px',
} as const;

export const motionDurations = {
  fast: '120ms',
  base: '220ms',
  slow: '420ms',
} as const;
