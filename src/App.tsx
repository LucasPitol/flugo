import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme';
import { Layout } from './components/Layout';
import { Colaboradores } from './pages/Colaboradores';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Layout>
        <Colaboradores />
      </Layout>
    </ThemeProvider>
  );
}

export default App;
