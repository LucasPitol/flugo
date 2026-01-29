import { createTheme } from '@mui/material/styles';

// Guia de estilos do print: verde #2ECC71, vermelho #E74C3C, cinzas #555 #F8F9FA #EEE
export const theme = createTheme({
  palette: {
    primary: {
      main: '#2ECC71',
      light: '#58D68D',
      dark: '#27AE60',
    },
    error: {
      main: '#E74C3C',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});
