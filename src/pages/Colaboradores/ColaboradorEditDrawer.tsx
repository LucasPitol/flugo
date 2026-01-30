import {
  Box,
  Typography,
  Drawer,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { AppButton } from '../../components/ui';
import { colors, states } from '../../theme';
import type { Colaborador, NivelHierarquico } from '../../services/colaboradores/types';

const DEPARTAMENTOS = ['Design', 'TI', 'Marketing', 'Produto', 'RH', 'Financeiro'];

const NIVEIS_HIERARQUICOS: { value: NivelHierarquico; label: string }[] = [
  { value: 'junior', label: 'Júnior' },
  { value: 'pleno', label: 'Pleno' },
  { value: 'senior', label: 'Sênior' },
  { value: 'gestor', label: 'Gestor' },
];

export type ColaboradorEditDrawerErrors = {
  nome?: string;
  email?: string;
  departamento?: string;
  cargo?: string;
  dataAdmissao?: string;
  nivelHierarquico?: string;
  gestorId?: string;
  salarioBase?: string;
};

export type GestorOption = { id: string; nome: string };

export type ColaboradorEditDrawerProps = {
  open: boolean;
  colaborador: Colaborador | null;
  nome: string;
  email: string;
  departamento: string;
  status: 'Ativo' | 'Inativo';
  cargo: string;
  dataAdmissao: string;
  nivelHierarquico: string;
  gestorId: string;
  salarioBase: string;
  gestores: GestorOption[];
  gestoresLoading: boolean;
  errors: ColaboradorEditDrawerErrors;
  submitting: boolean;
  onClose: () => void;
  onNomeChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onDepartamentoChange: (value: string) => void;
  onStatusChange: (value: 'Ativo' | 'Inativo') => void;
  onCargoChange: (value: string) => void;
  onDataAdmissaoChange: (value: string) => void;
  onNivelHierarquicoChange: (value: string) => void;
  onGestorIdChange: (value: string) => void;
  onSalarioBaseChange: (value: string) => void;
  onSave: () => void;
  onDeleteClick: () => void;
  confirmSingleDeleteOpen: boolean;
  deletingSingle: boolean;
  onConfirmSingleDeleteClose: () => void;
  onConfirmSingleDelete: () => void;
};

export function ColaboradorEditDrawer({
  open,
  nome,
  email,
  departamento,
  status,
  cargo,
  dataAdmissao,
  nivelHierarquico,
  gestorId,
  salarioBase,
  gestores,
  gestoresLoading,
  errors,
  submitting,
  onClose,
  onNomeChange,
  onEmailChange,
  onDepartamentoChange,
  onStatusChange,
  onCargoChange,
  onDataAdmissaoChange,
  onNivelHierarquicoChange,
  onGestorIdChange,
  onSalarioBaseChange,
  onSave,
  onDeleteClick,
  confirmSingleDeleteOpen,
  deletingSingle,
  onConfirmSingleDeleteClose,
  onConfirmSingleDelete,
  colaborador,
}: ColaboradorEditDrawerProps) {
  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        slotProps={{
          paper: { sx: { width: { xs: '100%', sm: 420 } } },
        }}
      >
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'auto' }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Editar colaborador
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, flex: 1 }}>
            <TextField
              label="Nome"
              value={nome}
              onChange={(e) => onNomeChange(e.target.value)}
              fullWidth
              variant="outlined"
              required
              error={!!errors.nome}
              helperText={errors.nome}
            />
            <TextField
              label="E-mail"
              placeholder="e.g. john@gmail.com"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              fullWidth
              variant="outlined"
              type="email"
              required
              error={!!errors.email}
              helperText={errors.email}
            />
            <FormControl fullWidth variant="outlined" required error={!!errors.departamento}>
              <InputLabel id="edit-departamento-label" shrink>
                Departamento
              </InputLabel>
              <Select
                labelId="edit-departamento-label"
                value={departamento}
                label="Departamento"
                onChange={(e) => onDepartamentoChange(e.target.value)}
                displayEmpty
                renderValue={(v) => (v as string) || 'Selecione um departamento'}
                sx={{
                  bgcolor: states.input.backgroundMuted,
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: states.input.borderDefault },
                }}
              >
                {DEPARTAMENTOS.map((d) => (
                  <MenuItem key={d} value={d}>
                    {d}
                  </MenuItem>
                ))}
              </Select>
              {errors.departamento && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                  {errors.departamento}
                </Typography>
              )}
            </FormControl>
            <TextField
              label="Cargo"
              value={cargo}
              onChange={(e) => onCargoChange(e.target.value)}
              fullWidth
              variant="outlined"
              required
              error={!!errors.cargo}
              helperText={errors.cargo}
            />
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
              <DatePicker
                label="Data de admissão"
                format="DD/MM/YYYY"
                value={dataAdmissao ? dayjs(dataAdmissao, 'YYYY-MM-DD') : null}
                onChange={(value) => onDataAdmissaoChange(value ? value.format('YYYY-MM-DD') : '')}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    error: !!errors.dataAdmissao,
                    helperText: errors.dataAdmissao,
                    variant: 'outlined' as const,
                    sx: {
                      '& .MuiOutlinedInput-root': {
                        bgcolor: states.input.backgroundMuted,
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: states.input.borderDefault },
                      },
                    },
                  },
                }}
              />
            </LocalizationProvider>
            <FormControl fullWidth variant="outlined" required error={!!errors.nivelHierarquico}>
              <InputLabel id="edit-nivel-label" shrink>
                Nível hierárquico
              </InputLabel>
              <Select
                labelId="edit-nivel-label"
                value={nivelHierarquico}
                label="Nível hierárquico"
                onChange={(e) => onNivelHierarquicoChange(e.target.value)}
                displayEmpty
                renderValue={(v) =>
                  (v ? NIVEIS_HIERARQUICOS.find((n) => n.value === v)?.label ?? v : 'Selecione o nível')
                }
                sx={{
                  bgcolor: states.input.backgroundMuted,
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: states.input.borderDefault },
                }}
              >
                {NIVEIS_HIERARQUICOS.map((n) => (
                  <MenuItem key={n.value} value={n.value}>
                    {n.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.nivelHierarquico && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                  {errors.nivelHierarquico}
                </Typography>
              )}
            </FormControl>
            {nivelHierarquico && nivelHierarquico !== 'gestor' && (
              <FormControl
                fullWidth
                variant="outlined"
                required
                error={!!errors.gestorId}
                disabled={gestoresLoading}
              >
                <InputLabel id="edit-gestor-label" shrink>
                  Gestor responsável
                </InputLabel>
                <Select
                  labelId="edit-gestor-label"
                  value={gestorId}
                  label="Gestor responsável"
                  onChange={(e) => onGestorIdChange(e.target.value)}
                  displayEmpty
                  renderValue={(v) => {
                    if (gestoresLoading) return 'Carregando...';
                    if (!v) return gestores.length === 0 ? 'Nenhum gestor cadastrado' : 'Selecione o gestor';
                    const g = gestores.find((c) => c.id === v);
                    return g ? g.nome : v;
                  }}
                  sx={{
                    bgcolor: states.input.backgroundMuted,
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: states.input.borderDefault },
                  }}
                >
                  {gestores.map((g) => (
                    <MenuItem key={g.id} value={g.id}>
                      {g.nome}
                    </MenuItem>
                  ))}
                </Select>
                {!gestoresLoading && gestores.length === 0 && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1.75 }}>
                    Nenhum gestor cadastrado
                  </Typography>
                )}
                {errors.gestorId && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                    {errors.gestorId}
                  </Typography>
                )}
              </FormControl>
            )}
            <TextField
              label="Salário base"
              value={salarioBase}
              onChange={(e) => onSalarioBaseChange(e.target.value)}
              fullWidth
              variant="outlined"
              required
              error={!!errors.salarioBase}
              helperText={errors.salarioBase}
              placeholder="0,00"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ '& .MuiTypography-root': { color: 'inherit' } }}>
                    R$
                  </InputAdornment>
                ),
              }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={status === 'Ativo'}
                  onChange={(e) => onStatusChange(e.target.checked ? 'Ativo' : 'Inativo')}
                />
              }
              label="Ativo"
              sx={{ '& .MuiFormControlLabel-label': { color: colors.neutral.text } }}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between', mt: 3 }}>
            <AppButton
              variant="text"
              color="error"
              onClick={onDeleteClick}
              disabled={submitting || deletingSingle}
            >
              Excluir
            </AppButton>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <AppButton variant="text" onClick={onClose} disabled={submitting}>
                Cancelar
              </AppButton>
              <AppButton variant="contained" onClick={onSave} loading={submitting}>
                Salvar
              </AppButton>
            </Box>
          </Box>
        </Box>
      </Drawer>

      <Dialog
        open={confirmSingleDeleteOpen}
        onClose={onConfirmSingleDeleteClose}
        aria-labelledby="single-delete-dialog-title"
        aria-describedby="single-delete-dialog-description"
      >
        <DialogTitle id="single-delete-dialog-title">Excluir colaborador</DialogTitle>
        <DialogContent>
          <DialogContentText id="single-delete-dialog-description">
            {colaborador
              ? `Excluir ${colaborador.nome}? Essa ação não pode ser desfeita.`
              : ''}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <AppButton onClick={onConfirmSingleDeleteClose} disabled={deletingSingle}>
            Cancelar
          </AppButton>
          <AppButton
            variant="contained"
            color="error"
            onClick={onConfirmSingleDelete}
            loading={deletingSingle}
          >
            Excluir
          </AppButton>
        </DialogActions>
      </Dialog>
    </>
  );
}
