/**
 * PetConnect Design System
 * Unified design tokens for consistent styling across the entire app
 */

// ============ Colors ============
export const colors = {
  // Primary - Social blue (inspired by Facebook/LinkedIn)
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',  // Main primary
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  
  // Secondary - Warm orange for pets/warmth
  secondary: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',  // Main secondary
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
  },
  
  // Backgrounds
  background: {
    main: '#f3f4f6',        // Light gray (Facebook style)
    surface: '#ffffff',      // Cards, modals
    hover: '#f9fafb',        // Hover states
    border: '#e5e7eb',       // Default borders
    borderLight: '#f3f4f6',  // Lighter borders
  },
  
  // Text
  text: {
    primary: '#111827',      // Main text
    secondary: '#6b7280',    // Secondary text
    muted: '#9ca3af',        // Muted text
    disabled: '#d1d5db',     // Disabled state
  },
  
  // Status colors
  status: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  
  // Social media specific
  social: {
    like: '#ed4956',         // Instagram red
    comment: '#3b82f6',
    share: '#059669',
    save: '#f59e0b',
  },
} as const;

// ============ Spacing ============
export const spacing = {
  // Page layout
  page: {
    maxWidth: '1280px',      // Container max width
    padding: {
      mobile: '1rem',        // 16px
      tablet: '1.5rem',      // 24px
      desktop: '2rem',       // 32px
    },
    gap: '1.5rem',           // Gap between sections
  },
  
  // Component spacing
  card: {
    padding: {
      sm: '0.75rem',         // 12px
      md: '1rem',            // 16px
      lg: '1.5rem',          // 24px
    },
    gap: '0.75rem',          // 12px - Gap inside cards
    borderRadius: {
      sm: '0.5rem',          // 8px
      md: '0.75rem',         // 12px
      lg: '1rem',            // 16px
      full: '9999px',        // Fully rounded
    },
  },
  
  // Section spacing
  section: {
    marginY: {
      sm: '1rem',            // 16px
      md: '1.5rem',          // 24px
      lg: '2rem',            // 32px
    },
  },
  
  // Grid spacing
  grid: {
    gap: {
      sm: '0.75rem',         // 12px
      md: '1rem',            // 16px
      lg: '1.5rem',          // 24px
    },
  },
} as const;

// ============ Typography ============
export const typography = {
  fontFamily: {
    sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: '"Fira Code", "Courier New", monospace',
  },
  
  fontSize: {
    xs: '0.75rem',           // 12px
    sm: '0.875rem',          // 14px
    base: '1rem',            // 16px
    lg: '1.125rem',          // 18px
    xl: '1.25rem',           // 20px
    '2xl': '1.5rem',         // 24px
    '3xl': '1.875rem',       // 30px
    '4xl': '2.25rem',        // 36px
  },
  
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
} as const;

// ============ Shadows ============
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  
  // Social media specific
  card: '0 1px 2px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.1)',
  hover: '0 4px 8px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.08)',
} as const;

// ============ Transitions ============
export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  DEFAULT: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  
  // Specific properties
  colors: 'background-color 200ms, color 200ms, border-color 200ms',
  transform: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  all: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

// ============ Z-Index ============
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  notification: 1080,
} as const;

// ============ Breakpoints ============
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ============ Helper Functions ============

/**
 * Get color with opacity
 * @example getColor('primary.500', 0.5) => 'rgba(59, 130, 246, 0.5)'
 */
export function getColorWithOpacity(colorPath: string, opacity: number): string {
  // Simple implementation - can be enhanced
  return `rgba(59, 130, 246, ${opacity})`;
}

/**
 * Get responsive spacing
 */
export function getResponsiveSpacing(size: 'sm' | 'md' | 'lg'): string {
  return spacing.section.marginY[size];
}

// ============ Exports ============
export const designTokens = {
  colors,
  spacing,
  typography,
  shadows,
  transitions,
  zIndex,
  breakpoints,
} as const;

export default designTokens;
