export const colors = {
  primary: '#0F6E64', // deep teal — buttons, links, active states
  primaryDark: '#0A4A44', // bottom CTA button
  mint: '#E7F5F2', // light mint backgrounds (badges, countdown banner)
  mintBorder: '#CFE9E3',

  background: '#F4F6F7',
  card: '#FFFFFF',
  border: '#E7EAEC',

  textPrimary: '#12181B',
  textSecondary: '#6B7680',
  textMuted: '#98A2AC',

  success: '#1E9E6B',
  warning: '#D97706',
  danger: '#DC2626',

  gold: '#F0B429',
  silver: '#9AA5B1',
  bronze: '#C97B41',

  white: '#FFFFFF',
  overlay: 'rgba(15, 23, 25, 0.45)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
};

export const typography = {
  h1: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  h2: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  body: { fontSize: 14, fontWeight: '400', color: colors.textPrimary },
  bodyBold: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  caption: { fontSize: 12, fontWeight: '400', color: colors.textSecondary },
  captionBold: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  small: { fontSize: 11, fontWeight: '400', color: colors.textMuted },
};
