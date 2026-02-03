import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { theme } from '../theme';

type RenderOptions = {
  route?: string;
  path?: string;
};

export function renderWithRouter(ui: ReactElement, options: RenderOptions = {}) {
  const { route = '/', path = '/' } = options;
  return render(
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path={path} element={ui} />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>
  );
}
