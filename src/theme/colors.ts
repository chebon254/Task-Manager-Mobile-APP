// Updated theme colors with your new gradient
export const Colors = {
  // Primary gradient colors (your new design)
  primary: "#cb1a68", // Pink
  primaryDark: "#340f45", // Dark purple
  primaryLight: "#e91e63",

  // Secondary colors
  secondary: "#cb1a68",
  secondaryDark: "#340f45",

  // Background gradients (your new colors)
  gradientStart: "#cb1a68", // Pink
  gradientEnd: "#340f45", // Dark purple

  // UI Colors
  cardBackground: "rgba(255, 255, 255, 0.1)", // Transparent cards
  cardBackgroundLight: "rgba(255, 255, 255, 0.05)",

  // Status colors
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#3B82F6",

  // Text colors (white and secondary as requested)
  textPrimary: "#FFFFFF", // White text
  textSecondary: "#e6cfe1", // Your requested secondary text color
  textMuted: "#c8a8c1",
  textDark: "#1F2937",

  // Background colors - now using gradient throughout
  background: "#340f45", // Dark purple as fallback
  backgroundLight: "rgba(255, 255, 255, 0.05)",
  backgroundCard: "rgba(255, 255, 255, 0.1)", // Transparent cards

  // Category colors
  categories: {
    work: "#3B82F6",
    personal: "#10B981",
    health: "#F59E0B",
    learning: "#8B5CF6",
    shopping: "#EF4444",
    meeting: "#EC4899",
    dev: "#06B6D4",
  },

  // Input colors (transparent to work with gradient)
  inputBackground: "rgba(255, 255, 255, 0.1)",
  inputBorder: "rgba(255, 255, 255, 0.2)",
  inputFocused: "#FFFFFF",

  // Other UI colors
  border: "rgba(255, 255, 255, 0.1)",
  shadow: "rgba(0, 0, 0, 0.3)",
  overlay: "rgba(0, 0, 0, 0.5)",

  // Button colors
  buttonPrimary: "#FFFFFF",
  buttonSecondary: "rgba(255, 255, 255, 0.1)",
  buttonSuccess: "#10B981",
  buttonDanger: "#EF4444",
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
  normal: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
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
    shadowOpacity: 0.3,
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
