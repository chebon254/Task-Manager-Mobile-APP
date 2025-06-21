
// Theme colors based on your design images
export const Colors = {
  // Primary gradient colors (from your theme image)
  primary: '#6366F1', // Indigo
  primaryDark: '#4F46E5',
  primaryLight: '#8B5CF6',
  
  // Secondary colors
  secondary: '#EC4899', // Pink
  secondaryDark: '#DB2777',
  
  // Background gradients
  gradientStart: '#EC4899', // Pink
  gradientEnd: '#8B5CF6',   // Purple
  
  // UI Colors from your design
  cardBackground: '#1F2937', // Dark gray
  cardBackgroundLight: 'rgba(255, 255, 255, 0.1)',
  
  // Status colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Text colors
  textPrimary: '#FFFFFF',
  textSecondary: '#D1D5DB',
  textMuted: '#9CA3AF',
  textDark: '#1F2937',
  
  // Background colors
  background: '#111827',
  backgroundLight: '#1F2937',
  backgroundCard: 'rgba(255, 255, 255, 0.1)',
  
  // Category colors (from your UI design)
  categories: {
    work: '#3B82F6',      // Blue
    personal: '#10B981',   // Green
    health: '#F59E0B',     // Amber
    learning: '#8B5CF6',   // Purple
    shopping: '#EF4444',   // Red
    meeting: '#EC4899',    // Pink
    dev: '#06B6D4',       // Cyan
  },
  
  // Input colors
  inputBackground: 'rgba(255, 255, 255, 0.1)',
  inputBorder: 'rgba(255, 255, 255, 0.2)',
  inputFocused: '#6366F1',
  
  // Other UI colors
  border: 'rgba(255, 255, 255, 0.1)',
  shadow: 'rgba(0, 0, 0, 0.3)',
  overlay: 'rgba(0, 0, 0, 0.5)',
  
  // Button colors
  buttonPrimary: '#6366F1',
  buttonSecondary: 'rgba(255, 255, 255, 0.1)',
  buttonSuccess: '#10B981',
  buttonDanger: '#EF4444',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const FontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const FontWeights = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const Shadows = {
  small: {
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  medium: {
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
  large: {
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,
  },
};
