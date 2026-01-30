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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { AppButton } from '../../components/ui';
import { colors, states } from '../../theme';
import type { ColaboradorDTO } from '../../../back-end/domain/types/ColaboradorDTO';

const DEPARTAMENTOS = ['Design', 'TI', 'Marketing', 'Produto', 'RH', 'Financeiro'];

export type ColaboradorEditDrawerProps = {
  open: boolean;
  colaborador: ColaboradorDTO | null;
  nome: string;
  email: string;
  departamento: string;
  status: 'Ativo' | 'Inativo';
  errors: { nome?: string; email?: string; departamento?: string };
  submitting: boolean;
  onClose: () => void;
  onNomeChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onDepartamentoChange: (value: string) => void;
  onStatusChange: (value: 'Ativo' | 'Inativo') => void;
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
  errors,
  submitting,
  onClose,
  onNomeChange,
  onEmailChange,
  onDepartamentoChange,
  onStatusChange,
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
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Editar colaborador
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, flex: 1 }}>
            <TextField
              label="Nome"
              value={nome}
              onChange={(e) => {
                onNomeChange(e.target.value);
              }}
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
              onChange={(e) => {
                onEmailChange(e.target.value);
              }}
              fullWidth
              variant="outlined"
              type="email"
              required
              error={!!errors.email}
              helperText={errors.email}
            />
            <FormControl
              fullWidth
              variant="outlined"
              required
              error={!!errors.departamento}
            >
              <InputLabel id="edit-departamento-label" shrink>
                Departamento
              </InputLabel>
              <Select
                labelId="edit-departamento-label"
                value={departamento}
                label="Departamento"
                onChange={(e) => {
                  onDepartamentoChange(e.target.value);
                }}
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
