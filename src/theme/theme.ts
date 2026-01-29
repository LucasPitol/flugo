import { createTheme } from '@mui/material/styles';
import { colors, typography, borderRadius, shadows, states } from './tokens';

/**
 * Tema MUI centralizado — consome os design tokens.
 * Componentes MUI (Button, TextField, etc.) herdam automaticamente
 * cores, tipografia e componentes customizados definidos aqui.
 */
export const theme = createTheme({
  palette: {
    primary: {
      main: colors.primary.main,
      light: colors.primary.light,
      dark: colors.primary.dark,
      contrastText: colors.primary.contrast,
    },
    secondary: {
      main: colors.secondary.main,
      light: colors.secondary.light,
      dark: colors.secondary.dark,
    },
    error: {
      main: colors.error.main,
      light: colors.error.light,
    },
    success: {
      main: colors.success.main,
      light: colors.success.light,
    },
    background: {
      default: colors.neutral.background,
      paper: colors.neutral.background,
    },
    text: {
      primary: colors.neutral.text,
      secondary: colors.neutral.textSecondary,
      disabled: colors.neutral.textDisabled,
    },
  },
  typography: {
    fontFamily: typography.fontFamily,
    body1: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.regular,
      lineHeight: typography.lineHeight,
      color: colors.neutral.text,
    },
    body2: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.regular,
      color: colors.neutral.textSecondary,
    },
    h4: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
      color: colors.neutral.text,
    },
    h5: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: colors.neutral.text,
    },
  },
  shape: {
    borderRadius: borderRadius.md,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: typography.fontWeight.semibold,
        },
        containedPrimary: {
          boxShadow: shadows.sm,
          '&:hover': {
            backgroundColor: states.button.primaryHoverBg,
            boxShadow: states.button.primaryHoverShadow,
          },
          '&:disabled': {
            opacity: states.button.primaryDisabledOpacity,
          },
        },
        contained: {
          paddingLeft: 20,
          paddingRight: 20,
          paddingTop: 10,
          paddingBottom: 10,
          borderRadius: borderRadius.lg,
        },
        text: {
          color: colors.secondary.main,
          '&:hover': {
            backgroundColor: states.button.secondaryHoverBg,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '&.Mui-focused fieldset': {
              borderColor: states.input.borderFocus,
              borderWidth: 2,
            },
            '&.Mui-error fieldset': {
              borderColor: states.input.borderError,
            },
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: {
          borderColor: states.input.borderDefault,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.xl,
          boxShadow: shadows.md,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: typography.fontWeight.medium,
          borderRadius: borderRadius.lg,
          border: 'none',
          '& .MuiChip-label': {
            paddingLeft: 10,
            paddingRight: 10,
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableRow-root': {
            backgroundColor: states.table.headerBg,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${states.table.headerBorder}`,
          fontSize: typography.fontSize.sm,
          color: colors.neutral.text,
          fontWeight: typography.fontWeight.regular,
        },
        head: {
          fontWeight: typography.fontWeight.medium,
          color: colors.neutral.text,
          fontSize: typography.fontSize.sm,
        },
      },
    },
    MuiTableSortLabel: {
      styleOverrides: {
        root: {
          fontWeight: typography.fontWeight.medium,
          color: `${colors.neutral.text} !important`,
          '& .MuiTableSortLabel-icon': {
            color: colors.neutral.textMuted,
          },
        },
      },
    },
    MuiSnackbar: {
      styleOverrides: {
        root: {
          '&.MuiSnackbar-root': {
            bottom: 24,
            right: 24,
          },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          '& .MuiSwitch-switchBase.Mui-checked': {
            color: colors.primary.main,
          },
          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
            backgroundColor: colors.primary.main,
          },
        },
      },
    },
  },
});
