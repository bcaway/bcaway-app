export const theme = {
  colors: {
    background: '#FFFFFF',
    surface: '#F8F9FA',
    primary: '#2563EB',
    accentLight: '#EFF6FF',
    absent: '#EF4444',
    absentBg: '#FEF2F2',
    present: '#16A34A',
    presentBg: '#F0FDF4',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    shadowColor: '#000000',
  },
  typography: {
    sizes: {
      title: 28,
      subtitle: 20,
      body: 16,
      bodySmall: 14,
      caption: 12,
      periodNumber: 24,
    },
    weights: {
      bold: 'bold' as const,
      semibold: '600' as const,
      regular: '400' as const,
    }
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  },
  shadows: {
    card: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    }
  }
};
