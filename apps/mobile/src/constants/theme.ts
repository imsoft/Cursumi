/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/**
 * Paleta de MARCA Cursumi — fuente única de verdad para los colores de marca y
 * semánticos. Alineada con los tokens de la web (`--primary` oklch(0.541 0.281 293)
 * ≈ #6d28d9 y los morados de marca #4f00f6 / #a400e3 / #1f1147).
 *
 * Úsala en vez de hardcodear hexadecimales: `import { Brand } from "@/constants/theme"`.
 */
export const Brand = {
  /** Morado principal (= web --primary). Acento por defecto. */
  primary: '#6d28d9',
  /** Morado profundo de marca (cabeceras, fondos de marca). */
  deep: '#1f1147',
  /** Acento vívido (splash, gradientes, CTAs destacados). */
  vivid: '#4f00f6',
  /** Magenta de marca (extremo del gradiente). */
  accent: '#a400e3',
  /** Texto/icono sobre superficies de marca. */
  onBrand: '#ffffff',

  // Semánticos (familia Tailwind, igual que la web)
  success: '#16a34a',
  danger: '#dc2626',
  warning: '#f59e0b',
  /** Texto atenuado / placeholders. */
  muted: '#9ca3af',
} as const;

/** Gradiente de marca (morado profundo → vívido → magenta) para cabeceras/CTAs. */
export const BrandGradient = [Brand.deep, Brand.vivid, Brand.accent] as const;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
