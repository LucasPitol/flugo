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
import { useEffect, useState } from 'react';
import { AppButton } from '../../components/ui';
import { colors, states, typography } from '../../theme';
import type { Colaborador, NivelHierarquico } from '../../services/colaboradores/types';
import { formatBrCurrency } from '../../utils/formatBr';

export type DrawerMode = 'view' | 'edit';

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
  /** Lista de departamentos cadastrados (nome) para o Select obrigatório. */
  departamentos: { id: string; nome: string }[];
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
  /** Chamado ao cancelar edição: descarta alterações e volta para modo detalhes. */
  onCancelEdit: () => void;
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
  departamentos,
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
  onCancelEdit,
  onDeleteClick,
  confirmSingleDeleteOpen,
  deletingSingle,
  onConfirmSingleDeleteClose,
  onConfirmSingleDelete,
  colaborador,
}: ColaboradorEditDrawerProps) {
  const [mode, setMode] = useState<DrawerMode>('view');

  useEffect(() => {
    if (open) setMode('view');
  }, [open]);

  const departamentoNomes = departamentos.map((d) => d.nome);
  const optionsIncluindoAtual =
    departamento && !departamentoNomes.includes(departamento)
      ? [departamento, ...departamentoNomes]
      : departamentoNomes;

  const dataAdmissaoFormatada =
    dataAdmissao ? dayjs(dataAdmissao, 'YYYY-MM-DD').format('DD/MM/YYYY') : '—';
  const nivelLabel =
    nivelHierarquico ? NIVEIS_HIERARQUICOS.find((n) => n.value === nivelHierarquico)?.label ?? nivelHierarquico : '—';
  const gestorNome = gestorId ? gestores.find((g) => g.id === gestorId)?.nome ?? '—' : '—';
  const salarioExibicao =
    colaborador?.salarioBase != null ? formatBrCurrency(colaborador.salarioBase) : '—';

  const detailRow = (label: string, value: string) => (
    <Box sx={{ mb: 2.5 }}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          display: 'block',
          fontWeight: typography.fontWeight.medium,
          fontSize: typography.fontSize.xs,
          mb: 0.5,
          textTransform: 'uppercase',
          letterSpacing: '0.02em',
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="body1"
        sx={{
          color: colors.neutral.text,
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.regular,
          lineHeight: 1.5,
        }}
      >
        {value || '—'}
      </Typography>
    </Box>
  );

  const detailsContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, flex: 1 }}>
      <Box sx={{ pb: 2, borderBottom: `1px solid ${colors.neutral.border}` }}>
        <Typography
          variant="subtitle2"
          sx={{
            color: colors.neutral.textSecondary,
            fontWeight: typography.fontWeight.semibold,
            fontSize: typography.fontSize.xs,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            mb: 2,
          }}
        >
          Dados básicos
        </Typography>
        {detailRow('Nome', nome)}
        {detailRow('E-mail', email)}
        {detailRow('Departamento', departamento)}
        {detailRow('Status', status)}
      </Box>
      <Box>
        <Typography
          variant="subtitle2"
          sx={{
            color: colors.neutral.textSecondary,
            fontWeight: typography.fontWeight.semibold,
            fontSize: typography.fontSize.xs,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            mb: 2,
          }}
        >
          Infos profissionais
        </Typography>
        {detailRow('Cargo', cargo)}
        {detailRow('Data de admissão', dataAdmissaoFormatada)}
        {detailRow('Nível hierárquico', nivelLabel)}
        {nivelHierarquico && nivelHierarquico !== 'gestor' && detailRow('Gestor responsável', gestorNome)}
        {detailRow('Salário base', salarioExibicao ? `R$ ${salarioExibicao}` : '—')}
      </Box>
    </Box>
  );

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
            {mode === 'view' ? 'Detalhes do colaborador' : 'Editar colaborador'}
          </Typography>
          {mode === 'view' ? (
            detailsContent
          ) : (
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
                renderValue={(v) =>
                  (v as string) ||
                  (departamentoNomes.length === 0
                    ? 'Nenhum departamento cadastrado'
                    : 'Selecione um departamento')
                }
                sx={{
                  bgcolor: states.input.backgroundMuted,
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: states.input.borderDefault },
                }}
              >
                {optionsIncluindoAtual.map((nomeDept) => (
                  <MenuItem key={nomeDept} value={nomeDept}>
                    {nomeDept}
                  </MenuItem>
                ))}
              </Select>
              {errors.departamento && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                  {errors.departamento}
                </Typography>
              )}
              {departamentoNomes.length === 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1.75 }}>
                  Cadastre departamentos em Departamentos para vincular o colaborador.
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
          )}
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
              {mode === 'view' ? (
                <>
                  <AppButton variant="text" onClick={onClose}>
                    Fechar
                  </AppButton>
                  <AppButton variant="contained" onClick={() => setMode('edit')}>
                    Editar
                  </AppButton>
                </>
              ) : (
                <>
                  <AppButton
                    variant="text"
                    onClick={() => {
                      onCancelEdit();
                      setMode('view');
                    }}
                    disabled={submitting}
                  >
                    Cancelar
                  </AppButton>
                  <AppButton variant="contained" onClick={onSave} loading={submitting}>
                    Salvar
                  </AppButton>
                </>
              )}
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
