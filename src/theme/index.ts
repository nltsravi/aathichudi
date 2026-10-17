export interface ThemeColors {
  background: string;
  cardBackground: string;
  cardSurface: string;
  primary: string;
  primaryDark: string;
  primaryLight: string;
  accent: string;
  accentSoft: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderLight: string;
  tabBar: string;
  tabBarBorder: string;
  badgeBg: string;
  badgeText: string;
  success: string;
  danger: string;
}

export const lightColors: ThemeColors = {
  background: '#FBF9F4',
  cardBackground: '#FFFFFF',
  cardSurface: '#F6F1E8',
  primary: '#6B1420',
  primaryDark: '#4A0E17',
  primaryLight: '#8E2835',
  accent: '#C59B27',
  accentSoft: '#F8F1DA',
  textPrimary: '#241816',
  textSecondary: '#5C4842',
  textMuted: '#8A766F',
  border: '#E8DFD1',
  borderLight: '#F2ECE1',
  tabBar: '#FFFFFF',
  tabBarBorder: '#E9E0D2',
  badgeBg: '#F3EAE1',
  badgeText: '#6B1420',
  success: '#2E7D32',
  danger: '#C62828',
};

export const darkColors: ThemeColors = {
  background: '#131110',
  cardBackground: '#1C1917',
  cardSurface: '#26221E',
  primary: '#D1495B',
  primaryDark: '#8E2835',
  primaryLight: '#E57381',
  accent: '#E5BA42',
  accentSoft: '#38301B',
  textPrimary: '#F5EFE6',
  textSecondary: '#C2B6A6',
  textMuted: '#877B6E',
  border: '#332D26',
  borderLight: '#26211C',
  tabBar: '#171513',
  tabBarBorder: '#28231E',
  badgeBg: '#2E2224',
  badgeText: '#E57381',
  success: '#4CAF50',
  danger: '#EF5350',
};

export const defaultSettings = {
  poemFontSize: 24,
  meaningFontSize: 16,
  lineSpacingMultiplier: 1.5,
  includeAttribution: true,
  hapticsEnabled: true,
};
