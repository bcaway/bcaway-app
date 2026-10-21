export const lightColors = {
  background: '#FFFFFF',
  surface: '#F8FAFC',
  surfaceSubtle: '#F1F5F9',
  card: '#FFFFFF',
  primary: '#2563EB',
  primarySubtle: '#EFF6FF',
  accentLight: '#EEF4FE',
  absent: '#DC2626',
  absentBg: '#FEF2F2',
  absentBorder: '#FECACA',
  absentText: '#B91C1C',
  present: '#16A34A',
  presentBg: '#F0FDF4',
  presentBorder: '#BBF7D0',
  presentText: '#15803D',
  star: '#F59E0B',
  starBg: '#FEF3C7',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textTertiary: '#94A3B8',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  borderStrong: '#CBD5E1',
  divider: '#E2E8F0',
  searchBg: '#F1F5F9',
  inputBg: '#F8FAFC',
};

/**
 * VS Code-inspired deep charcoal dark theme.
 * Completely untinted neutral palette: soft dark charcoal background (#181818)
 * sitting close to card surfaces (#222222) with subtle separators (#303030).
 * Features VS Code signature focal blue (#3794FF) and soft white typography (#F0F0F0).
 */
export const darkColors: typeof lightColors = {
  background: '#181818',
  surface: '#222222',
  surfaceSubtle: '#2D2D2D',
  card: '#222222',
  primary: '#3794FF',
  primarySubtle: 'rgba(55, 148, 255, 0.15)',
  accentLight: 'rgba(55, 148, 255, 0.10)',
  absent: '#F14C4C',
  absentBg: 'rgba(241, 76, 76, 0.15)',
  absentBorder: 'rgba(241, 76, 76, 0.28)',
  absentText: '#F14C4C',
  present: '#73C991',
  presentBg: 'rgba(115, 201, 145, 0.15)',
  presentBorder: 'rgba(115, 201, 145, 0.28)',
  presentText: '#73C991',
  star: '#CCA700',
  starBg: 'rgba(204, 167, 0, 0.16)',
  textPrimary: '#F0F0F0',
  textSecondary: '#9E9E9E',
  textMuted: '#6E6E6E',
  textTertiary: '#555555',
  border: '#303030',
  borderLight: '#282828',
  borderStrong: '#3E3E3E',
  divider: '#2D2D2D',
  searchBg: '#222222',
  inputBg: '#222222',
};

export type ThemeColors = typeof lightColors;

export const theme = {
  colors: lightColors,
  typography: {
    sizes: {
      screenTitle: 22,
      sectionTitle: 13,
      body: 15,
      bodySmall: 13,
      caption: 11,
      periodNumber: 15,
      tabularNum: 14,
    },
    weights: {
      bold: '700' as const,
      semibold: '600' as const,
      medium: '500' as const,
      regular: '400' as const,
    },
  },
  spacing: {
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  borderRadius: {
    xs: 3,
    sm: 4,
    md: 6,
    lg: 8,
    full: 9999,
  },
  layout: {
    maxContentWidth: 640,
  },
};
