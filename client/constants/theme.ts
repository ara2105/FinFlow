import { Platform } from "react-native";

const primaryColor = "#2E7D32";
const primaryColorDark = "#4CAF50";

export const Colors = {
  light: {
    text: "#212121",
    textSecondary: "#757575",
    buttonText: "#FFFFFF",
    tabIconDefault: "#687076",
    tabIconSelected: primaryColor,
    link: "#2E7D32",
    backgroundRoot: "#FFFFFF",
    backgroundDefault: "#F5F5F5",
    backgroundSecondary: "#EEEEEE",
    backgroundTertiary: "#E0E0E0",
    primary: "#2E7D32",
    primaryLight: "#4CAF50",
    primaryDark: "#1B5E20",
    income: "#4CAF50",
    expense: "#F44336",
    warning: "#FF9800",
    success: "#4CAF50",
    border: "#E0E0E0",
    cardBackground: "#FFFFFF",
  },
  dark: {
    text: "#FFFFFF",
    textSecondary: "#B0B0B0",
    buttonText: "#FFFFFF",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: primaryColorDark,
    link: "#4CAF50",
    backgroundRoot: "#121212",
    backgroundDefault: "#1E1E1E",
    backgroundSecondary: "#252525",
    backgroundTertiary: "#2C2C2C",
    primary: "#4CAF50",
    primaryLight: "#66BB6A",
    primaryDark: "#2E7D32",
    income: "#4CAF50",
    expense: "#EF5350",
    warning: "#FFB74D",
    success: "#4CAF50",
    border: "#333333",
    cardBackground: "#1E1E1E",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  inputHeight: 48,
  buttonHeight: 52,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 18,
  lg: 24,
  xl: 30,
  "2xl": 40,
  "3xl": 50,
  full: 9999,
};

export const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 28,
    fontWeight: "700" as const,
  },
  h3: {
    fontSize: 24,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 20,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 14,
    fontWeight: "400" as const,
  },
  link: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
  amountLarge: {
    fontSize: 32,
    fontWeight: "700" as const,
  },
  caption: {
    fontSize: 12,
    fontWeight: "400" as const,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const Categories = [
  { id: "food", name: "Food", icon: "coffee" as const, color: "#FF7043" },
  { id: "shopping", name: "Shopping", icon: "shopping-bag" as const, color: "#AB47BC" },
  { id: "transport", name: "Transport", icon: "truck" as const, color: "#42A5F5" },
  { id: "entertainment", name: "Entertainment", icon: "film" as const, color: "#EC407A" },
  { id: "bills", name: "Bills", icon: "file-text" as const, color: "#78909C" },
  { id: "healthcare", name: "Healthcare", icon: "heart" as const, color: "#EF5350" },
  { id: "salary", name: "Salary", icon: "dollar-sign" as const, color: "#66BB6A" },
  { id: "other", name: "Other", icon: "more-horizontal" as const, color: "#8D6E63" },
];
