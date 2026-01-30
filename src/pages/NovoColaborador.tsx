import { useState, useEffect } from 'react';
import { criarColaborador, listarColaboradores } from '../services/colaboradoresService';
import type { CreateColaboradorInput } from '../services/colaboradores/types';
import type { NivelHierarquico } from '../services/colaboradores/types';
import type { Colaborador } from '../services/colaboradores/types';
import {
  createColaboradorSchema,
  getFieldErrors,
} from '../services/colaboradores/validation';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  LinearProgress,
  TextField,
  FormControlLabel,
  Switch,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { type Dayjs } from 'dayjs';
import 'dayjs/locale/pt-br';
import { useNavigate } from 'react-router-dom';
import { maskBrCurrencyInput, parseBrCurrency } from '../utils/formatBr';
import { colors, typography, states } from '../theme';
import { AppButton, AppSnackbar } from '../components/ui';

const STEPS = [
  { label: 'Infos Básicas', title: 'Informações Básicas' },
  { label: 'Infos Profissionais', title: 'Informações Profissionais' },
];

const DEPARTAMENTOS = ['Design', 'TI', 'Marketing', 'Produto', 'RH', 'Financeiro'];

const NIVEIS_HIERARQUICOS: { value: NivelHierarquico; label: string }[] = [
  { value: 'junior', label: 'Júnior' },
  { value: 'pleno', label: 'Pleno' },
  { value: 'senior', label: 'Sênior' },
  { value: 'gestor', label: 'Gestor' },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function NovoColaborador() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [nomeColaborador, setNomeColaborador] = useState('');
  const [emailColaborador, setEmailColaborador] = useState('');
  const [ativarAoCriar, setAtivarAoCriar] = useState(true);
  const [departamentoColaborador, setDepartamentoColaborador] = useState('');
  const [cargo, setCargo] = useState('');
  const [dataAdmissao, setDataAdmissao] = useState('');
  const [nivelHierarquico, setNivelHierarquico] = useState<NivelHierarquico | ''>('');
  const [gestorId, setGestorId] = useState('');
  const [salarioBase, setSalarioBase] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    nome?: string;
    email?: string;
    departamento?: string;
    cargo?: string;
    dataAdmissao?: string;
    nivelHierarquico?: string;
    gestorId?: string;
    salarioBase?: string;
  }>({});
  const [toastOpen, setToastOpen] = useState(false);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [gestoresLoading, setGestoresLoading] = useState(true);

  const gestores = colaboradores.filter((c) => c.nivelHierarquico === 'gestor');

  useEffect(() => {
    setGestoresLoading(true);
    listarColaboradores()
      .then(setColaboradores)
      .catch(() => setColaboradores([]))
      .finally(() => setGestoresLoading(false));
  }, []);

  const progress = (activeStep / STEPS.length) * 100;

  const validateStep0 = () => {
    const nextErrors: { nome?: string; email?: string; departamento?: string } = {};
    if (!nomeColaborador.trim()) nextErrors.nome = 'Nome é obrigatório';
    if (!emailColaborador.trim()) nextErrors.email = 'E-mail é obrigatório';
    else if (!EMAIL_REGEX.test(emailColaborador.trim())) nextErrors.email = 'E-mail inválido';
    if (!departamentoColaborador) nextErrors.departamento = 'Selecione o departamento.';
    setErrors((prev) => ({ ...prev, ...nextErrors }));
    return Object.keys(nextErrors).length === 0;
  };

  const handleNext = () => {
    if (activeStep === 0 && !validateStep0()) return;
    if (activeStep === 1) {
      const salarioNum = parseBrCurrency(salarioBase);
      const payload = {
        nome: nomeColaborador.trim(),
        email: emailColaborador.trim(),
        departamento: departamentoColaborador,
        status: (ativarAoCriar ? 'Ativo' : 'Inativo') as 'Ativo' | 'Inativo',
        cargo: cargo.trim(),
        dataAdmissao: dataAdmissao.trim(),
        nivelHierarquico: nivelHierarquico || undefined,
        gestorId: gestorId.trim() || undefined,
        salarioBase: Number.isNaN(salarioNum) ? undefined : salarioNum,
      };
      const result = createColaboradorSchema.safeParse(payload);
      if (!result.success) {
        setErrors(getFieldErrors(result));
        return;
      }
      setErrors({});
      const input: CreateColaboradorInput = { ...result.data };
      setSubmitting(true);
      criarColaborador(input)
        .then(() => navigate('/colaboradores'))
        .catch(() => setToastOpen(true))
        .finally(() => setSubmitting(false));
      return;
    }
    setErrors({});
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
    } else {
      navigate('/colaboradores');
    }
  };

  return (
    <Box sx={{ maxWidth: 900 }}>
      <Breadcrumbs
        separator="•"
        sx={{ mb: 1.5, '& .MuiBreadcrumbs-separator': { color: colors.neutral.textMuted, mx: 0.5 } }}
      >
        <Link
          component="button"
          variant="body2"
          sx={{ color: colors.secondary.main, cursor: 'pointer', textDecoration: 'none' }}
          onClick={() => navigate('/colaboradores')}
        >
          Colaboradores
        </Link>
        <Typography variant="body2" sx={{ color: colors.neutral.textMuted }}>
          Cadastrar Colaborador
        </Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            flex: 1,
            height: 6,
            borderRadius: 1,
            bgcolor: colors.neutral.border,
            '& .MuiLinearProgress-bar': { bgcolor: 'primary.main' },
          }}
        />
        <Typography variant="body2" sx={{ color: colors.secondary.main, minWidth: 36 }}>
          {Math.round(progress)}%
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 5, alignItems: 'flex-start' }}>
        <Box sx={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          {STEPS.map((step, index) => {
            const isActive = index === activeStep;
            const isCompleted = index < activeStep;
            const isActiveOrCompleted = isActive || isCompleted;
            return (
              <Box key={step.label}>
                {index > 0 && (
                  <Box
                    sx={{
                      width: 2,
                      height: 24,
                      bgcolor: colors.neutral.border,
                      ml: '13px',
                      mb: -0.5,
                    }}
                  />
                )}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      bgcolor: isActiveOrCompleted ? 'primary.main' : colors.neutral.border,
                      color: isActiveOrCompleted ? colors.primary.contrast : colors.neutral.textDisabled,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: typography.fontWeight.semibold,
                      fontSize: typography.fontSize.sm,
                      flexShrink: 0,
                    }}
                  >
                    {index + 1}
                  </Box>
                  <Typography
                    sx={{
                      ml: 1.5,
                      color: isActiveOrCompleted ? colors.neutral.text : colors.neutral.textDisabled,
                      fontWeight: isActive ? typography.fontWeight.semibold : typography.fontWeight.regular,
                      fontSize: typography.fontSize.sm,
                    }}
                  >
                    {step.label}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h5" sx={{ mb: 3 }}>
            {STEPS[activeStep].title}
          </Typography>

          {activeStep === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                label="Nome"
                value={nomeColaborador}
                onChange={(e) => {
                  setNomeColaborador(e.target.value);
                  if (errors.nome) setErrors((prev) => ({ ...prev, nome: undefined }));
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
                value={emailColaborador}
                onChange={(e) => {
                  setEmailColaborador(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                fullWidth
                variant="outlined"
                type="email"
                required
                error={!!errors.email}
                helperText={errors.email}
              />
              <FormControl fullWidth variant="outlined" required error={!!errors.departamento}>
                <InputLabel id="departamento-label" shrink>
                  Departamento
                </InputLabel>
                <Select
                  labelId="departamento-label"
                  value={departamentoColaborador}
                  label="Departamento"
                  onChange={(e) => {
                    setDepartamentoColaborador(e.target.value);
                    if (errors.departamento) setErrors((prev) => ({ ...prev, departamento: undefined }));
                  }}
                  displayEmpty
                  renderValue={(selected) => (selected as string) || 'Selecione um departamento'}
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
                    checked={ativarAoCriar}
                    onChange={(e) => setAtivarAoCriar(e.target.checked)}
                  />
                }
                label="Ativar ao criar"
                sx={{ '& .MuiFormControlLabel-label': { color: colors.neutral.text } }}
              />
            </Box>
          )}

          {activeStep === 1 && (
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField
                  label="Cargo"
                  value={cargo}
                  onChange={(e) => {
                    setCargo(e.target.value);
                    if (errors.cargo) setErrors((prev) => ({ ...prev, cargo: undefined }));
                  }}
                  fullWidth
                  variant="outlined"
                  required
                  error={!!errors.cargo}
                  helperText={errors.cargo}
                />
                <DatePicker
                  label="Data de admissão"
                  format="DD/MM/YYYY"
                  value={dataAdmissao ? dayjs(dataAdmissao, 'YYYY-MM-DD') : null}
                  onChange={(value: Dayjs | null) => {
                    setDataAdmissao(value ? value.format('YYYY-MM-DD') : '');
                    if (errors.dataAdmissao) setErrors((prev) => ({ ...prev, dataAdmissao: undefined }));
                  }}
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
                <FormControl fullWidth variant="outlined" required error={!!errors.nivelHierarquico}>
                  <InputLabel id="nivel-label" shrink>
                    Nível hierárquico
                  </InputLabel>
                  <Select
                    labelId="nivel-label"
                    value={nivelHierarquico}
                    label="Nível hierárquico"
                    onChange={(e) => {
                      const next = (e.target.value as NivelHierarquico) || '';
                      setNivelHierarquico(next);
                      if (next === 'gestor') setGestorId('');
                      setErrors((prev) => ({
                        ...prev,
                        nivelHierarquico: undefined,
                        gestorId: undefined,
                      }));
                    }}
                    displayEmpty
                    renderValue={(v) =>
                      v ? NIVEIS_HIERARQUICOS.find((n) => n.value === v)?.label ?? v : 'Selecione o nível'
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
                    <InputLabel id="gestor-label" shrink>
                      Gestor responsável
                    </InputLabel>
                    <Select
                      labelId="gestor-label"
                      value={gestorId}
                      label="Gestor responsável"
                      onChange={(e) => {
                        setGestorId(e.target.value);
                        if (errors.gestorId) setErrors((prev) => ({ ...prev, gestorId: undefined }));
                      }}
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
                  onChange={(e) => {
                    setSalarioBase(maskBrCurrencyInput(e.target.value));
                    if (errors.salarioBase) setErrors((prev) => ({ ...prev, salarioBase: undefined }));
                  }}
                  fullWidth
                  variant="outlined"
                  required
                  error={!!errors.salarioBase}
                  helperText={errors.salarioBase}
                  placeholder="0,00"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">R$</InputAdornment>
                    ),
                  }}
                />
              </Box>
            </LocalizationProvider>
          )}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1, mt: 4 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <AppButton variant="text" onClick={handleBack}>
            Voltar
          </AppButton>
          <AppButton
            variant="contained"
            onClick={handleNext}
            loading={submitting}
          >
            {activeStep === STEPS.length - 1 ? 'Criar colaborador' : 'Próximo'}
          </AppButton>
        </Box>
      </Box>

      <AppSnackbar
        open={toastOpen}
        onClose={() => setToastOpen(false)}
        message="Não foi possível salvar o colaborador. Tente novamente."
      />
    </Box>
  );
}
