import { useState } from 'react';
import { criarColaborador } from '../services/colaboradoresService';
import type { CreateColaboradorInput } from '../services/colaboradores/types';
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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { colors, typography, states } from '../theme';
import { AppButton, AppSnackbar } from '../components/ui';

const STEPS = [
  { label: 'Infos Básicas', title: 'Informações Básicas' },
  { label: 'Infos Profissionais', title: 'Informações Profissionais' },
];

const DEPARTAMENTOS = ['Design', 'TI', 'Marketing', 'Produto', 'RH', 'Financeiro'];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function NovoColaborador() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [nomeColaborador, setNomeColaborador] = useState('');
  const [emailColaborador, setEmailColaborador] = useState('');
  const [ativarAoCriar, setAtivarAoCriar] = useState(true);
  const [departamentoColaborador, setDepartamentoColaborador] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    nome?: string;
    email?: string;
    departamento?: string;
  }>({});
  const [toastOpen, setToastOpen] = useState(false);

  const progress = (activeStep / STEPS.length) * 100;

  const validateStep0 = () => {
    const nextErrors: { nome?: string; email?: string } = {};
    if (!nomeColaborador.trim()) nextErrors.nome = 'Nome é obrigatório';
    if (!emailColaborador.trim()) nextErrors.email = 'E-mail é obrigatório';
    else if (!EMAIL_REGEX.test(emailColaborador.trim())) nextErrors.email = 'E-mail inválido';
    setErrors((prev) => ({ ...prev, ...nextErrors }));
    return Object.keys(nextErrors).length === 0;
  };

  const validateStep1 = () => {
    if (!departamentoColaborador) {
      setErrors((prev) => ({ ...prev, departamento: 'Departamento é obrigatório' }));
      return false;
    }
    setErrors((prev) => ({ ...prev, departamento: undefined }));
    return true;
  };

  const handleNext = () => {
    if (activeStep === 0 && !validateStep0()) return;
    if (activeStep === 1 && !validateStep1()) return;

    setErrors({});
    if (activeStep < STEPS.length - 1) {
      setActiveStep((prev) => prev + 1);
    } else {
      const input: CreateColaboradorInput = {
        nome: nomeColaborador.trim(),
        email: emailColaborador.trim(),
        departamento: departamentoColaborador,
        status: ativarAoCriar ? 'Ativo' : 'Inativo',
      };
      setSubmitting(true);
      criarColaborador(input)
        .then(() => navigate('/colaboradores'))
        .catch(() => setToastOpen(true))
        .finally(() => setSubmitting(false));
    }
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
            <FormControl
              fullWidth
              sx={{ minWidth: 280 }}
              variant="outlined"
              required
              error={!!errors.departamento}
            >
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
