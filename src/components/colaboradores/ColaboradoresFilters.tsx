import {
  Box,
  Drawer,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { AppButton } from '../ui';
import type { ColaboradoresFilter } from '../../services/colaboradores/types';
import { borderRadius, states } from '../../theme/tokens';

/** Mesma lista usada na criação e edição de colaborador. */
const DEPARTAMENTOS = ['Design', 'TI', 'Marketing', 'Produto', 'RH', 'Financeiro'];

export interface ColaboradoresFiltersProps {
  open: boolean;
  onClose: () => void;
  filters: ColaboradoresFilter;
  onFilterChange: (next: Partial<ColaboradoresFilter>) => void;
  onClearFilters: () => void;
  onApply: () => void;
}

const DRAWER_WIDTH = 360;

/**
 * Painel de filtros de colaboradores (Drawer).
 * Controlado via props — sem lógica de filtragem.
 * Footer fixo: Limpar (text/secondary) e Aplicar (primary).
 */
export function ColaboradoresFilters({
  open,
  onClose,
  filters,
  onFilterChange,
  onClearFilters,
  onApply,
}: ColaboradoresFiltersProps) {
  const theme = useTheme();

  const handleClear = () => {
    onClearFilters();
  };

  const handleApply = () => {
    onApply();
    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        backdrop: { invisible: false },
      }}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: DRAWER_WIDTH },
          borderRadius: 0,
          boxShadow: theme.shadows[8],
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ px: 2, py: 2.5, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" component="h2">
            Filtros
          </Typography>
        </Box>

        <Box sx={{ flex: 1, overflow: 'auto', px: 2, py: 2 }}>
          <TextField
            fullWidth
            label="Nome"
            value={filters.name ?? ''}
            onChange={(e) => onFilterChange({ name: e.target.value || undefined })}
            margin="normal"
            size="small"
            placeholder="Buscar por nome"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: borderRadius.lg,
                '& fieldset': { borderColor: states.input.borderDefault },
              },
            }}
          />
          <TextField
            fullWidth
            label="E-mail"
            type="email"
            value={filters.email ?? ''}
            onChange={(e) => onFilterChange({ email: e.target.value || undefined })}
            margin="normal"
            size="small"
            placeholder="Buscar por e-mail"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: borderRadius.lg,
                '& fieldset': { borderColor: states.input.borderDefault },
              },
            }}
          />
          <FormControl fullWidth size="small" margin="normal">
            <InputLabel id="filter-departamento-label" shrink>
              Departamento
            </InputLabel>
            <Select
              labelId="filter-departamento-label"
              value={filters.department ?? ''}
              label="Departamento"
              onChange={(e) =>
                onFilterChange({ department: (e.target.value as string) || undefined })
              }
              displayEmpty
              renderValue={(v) => (v ? v : 'Todos os departamentos')}
              sx={{
                borderRadius: borderRadius.lg,
                '& fieldset': { borderColor: states.input.borderDefault },
              }}
            >
              <MenuItem value="">Todos os departamentos</MenuItem>
              {DEPARTAMENTOS.map((d) => (
                <MenuItem key={d} value={d}>
                  {d}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box
          sx={{
            p: 2,
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            display: 'flex',
            gap: 1.5,
            justifyContent: 'flex-end',
          }}
        >
          <AppButton variant="text" color="secondary" onClick={handleClear}>
            Limpar filtros
          </AppButton>
          <AppButton variant="contained" onClick={handleApply}>
            Aplicar filtros
          </AppButton>
        </Box>
      </Box>
    </Drawer>
  );
}
