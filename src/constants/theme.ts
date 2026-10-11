export const theme = {
  colors: {
    background: '#0F031E', // Spooky twilight midnight purple from official Halloween icon
    surface: '#18072B',    // Clean dark night-sky card surface
    surfaceSubtle: '#220B3E',
    primary: '#EA580C',    // BCAway pumpkin orange accent
    primaryLight: '#F97316',
    primarySubtle: 'rgba(234, 88, 12, 0.12)',
    accentLight: 'rgba(254, 240, 138, 0.12)',
    moon: '#FEF08A',
    absent: '#EF4444',
    absentBg: 'rgba(239, 68, 68, 0.15)',
    absentText: '#FCA5A5',
    present: '#22C55E',
    presentBg: 'rgba(34, 197, 94, 0.15)',
    textPrimary: '#F8FAFC',   // Moonlit bright white
    textSecondary: '#CBD5E1', // Starlight soft white/lavender
    textMuted: '#94A3B8',
    textTertiary: '#64748B',
    border: 'rgba(255, 255, 255, 0.08)',
    borderLight: 'rgba(255, 255, 255, 0.05)',
    borderStrong: 'rgba(255, 255, 255, 0.15)',
    divider: 'rgba(255, 255, 255, 0.08)',
    halloween: {
      nightSky: '#0F031E',
      nightSkyDeep: '#0D021A',
      cardSurface: '#18072B',
      orange: '#EA580C',
      orangeLight: '#F97316',
      orangeSubtle: 'rgba(234, 88, 12, 0.12)',
      moon: '#FEF08A',
      spiderWeb: 'rgba(255, 255, 255, 0.35)',
      bat: '#0D021A',
      pumpkin: '#F97316',
    },
  },
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
