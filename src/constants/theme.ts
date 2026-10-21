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
 * Authentic, untinted deep neutral dark mode.
 * Styled after Apple's System Dark appearance: pure OLED black base (#000000)
 * with neutral System Gray 6 (#1C1C1E) surfaces and System Gray 5 (#2C2C2E) elevated states.
 * Uses native System Blue (#0A84FF) calibrated specifically for neutral dark gray.
 * Zero artificial navy/indigo/slate tint.
 */
export const darkColors: typeof lightColors = {
  background: '#000000',
  surface: '#1C1C1E',
  surfaceSubtle: '#2C2C2E',
  card: '#1C1C1E',
  primary: '#0A84FF',
  primarySubtle: 'rgba(10, 132, 255, 0.15)',
  accentLight: 'rgba(10, 132, 255, 0.10)',
  absent: '#FF453A',
  absentBg: 'rgba(255, 69, 58, 0.15)',
  absentBorder: 'rgba(255, 69, 58, 0.28)',
  absentText: '#FF453A',
  present: '#30D158',
  presentBg: 'rgba(48, 209, 88, 0.15)',
  presentBorder: 'rgba(48, 209, 88, 0.28)',
  presentText: '#30D158',
  star: '#FFD60A',
  starBg: 'rgba(255, 214, 10, 0.16)',
  textPrimary: '#FFFFFF',
  textSecondary: '#8E8E93',
  textMuted: '#636366',
  textTertiary: '#48484A',
  border: '#2C2C2E',
  borderLight: '#242426',
  borderStrong: '#3A3A3C',
  divider: '#2C2C2E',
  searchBg: '#1C1C1E',
  inputBg: '#1C1C1E',
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
