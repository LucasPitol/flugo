/**
 * Design tokens — guia de estilo centralizado da aplicação.
 * Única fonte de verdade para cores, tipografia, espaçamentos e estados.
 * Alterações aqui refletem em toda a aplicação.
 */

/** Cores da marca e semânticas */
export const colors = {
  /** Primária (ação principal, links, sucesso) */
  primary: {
    main: '#2ECC71',
    light: '#58D68D',
    dark: '#27AE60',
    contrast: '#ffffff',
  },
  /** Secundária (ações secundárias, bordas suaves) */
  secondary: {
    main: '#6b7280',
    light: '#9ca3af',
    dark: '#374151',
  },
  /** Feedback: sucesso */
  success: {
    main: '#2ECC71',
    light: '#E6F7ED',
  },
  /** Feedback: erro */
  error: {
    main: '#E74C3C',
    light: '#FEEEEE',
  },
  /** Feedback: aviso (opcional para futuro) */
  warning: {
    main: '#F39C12',
    light: '#FEF5E7',
  },
  /** Neutros: texto e superfícies */
  neutral: {
    text: '#374151',
    textSecondary: '#6b7280',
    textMuted: '#9ca3af',
    textDisabled: '#9e9e9e',
    border: '#e5e7eb',
    borderLight: '#EEE',
    background: '#ffffff',
    backgroundAlt: '#F8F9FA',
    backgroundMuted: '#f9fafb',
  },
} as const;

/** Tipografia: fontes, tamanhos e pesos */
export const typography = {
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  /** Tamanhos em rem (base 16px) */
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    md: '0.9375rem',  // 15px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px — títulos de página
  },
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: 1.5,
} as const;

/** Espaçamentos (base 8px). Use múltiplos: spacing(1) = 8px, spacing(2) = 16px */
export const spacingBase = 8;
export const spacing = (factor: number) => factor * spacingBase;

/** Raios de borda (em px) */
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 20,
  full: 9999,
} as const;

/** Breakpoints para responsividade (valores em px) */
export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
} as const;

/** Sombras padronizadas */
export const shadows = {
  sm: '0 2px 4px rgba(0,0,0,0.08)',
  md: '0 2px 8px rgba(0,0,0,0.08)',
  lg: '0 2px 6px rgba(0,0,0,0.15)',
} as const;

/** Estados interativos (hover, disabled, focus, error) */
export const states = {
  button: {
    primaryHoverBg: colors.primary.dark,
    primaryHoverShadow: shadows.lg,
    primaryDisabledOpacity: 0.6,
    secondaryHoverBg: colors.neutral.backgroundMuted,
  },
  input: {
    borderDefault: colors.neutral.border,
    borderFocus: colors.primary.main,
    borderError: colors.error.main,
    backgroundMuted: colors.neutral.backgroundMuted,
  },
  chip: {
    successBg: colors.success.light,
    successColor: colors.success.main,
    errorBg: colors.error.light,
    errorColor: colors.error.main,
  },
  table: {
    headerBg: colors.neutral.backgroundAlt,
    headerBorder: colors.neutral.borderLight,
    rowBorder: 'none',
  },
} as const;
