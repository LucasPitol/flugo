import { useState } from 'react';
import { criarColaborador } from '../services/colaboradoresService';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  LinearProgress,
  TextField,
  FormControlLabel,
  Switch,
  Button,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

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
  const [errors, setErrors] = useState<{
    nome?: string;
    email?: string;
    departamento?: string;
    submit?: string;
  }>({});

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
      criarColaborador({
        nome: nomeColaborador.trim(),
        email: emailColaborador.trim(),
        departamento: departamentoColaborador,
        status: ativarAoCriar ? 'Ativo' : 'Inativo',
      })
        .then(() => navigate('/colaboradores'))
        .catch(() => setErrors((prev) => ({ ...prev, submit: 'Erro ao cadastrar. Tente novamente.' })));
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
      {/* Breadcrumbs */}
      <Breadcrumbs
        separator="•"
        sx={{ mb: 1.5, '& .MuiBreadcrumbs-separator': { color: '#9ca3af', mx: 0.5 } }}
      >
        <Link
          component="button"
          variant="body2"
          sx={{ color: '#6b7280', cursor: 'pointer', textDecoration: 'none' }}
          onClick={() => navigate('/colaboradores')}
        >
          Colaboradores
        </Link>
        <Typography variant="body2" color="text.secondary" sx={{ color: '#9ca3af' }}>
          Cadastrar Colaborador
        </Typography>
      </Breadcrumbs>

      {/* Progress bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            flex: 1,
            height: 6,
            borderRadius: 1,
            bgcolor: '#e5e7eb',
            '& .MuiLinearProgress-bar': { bgcolor: 'primary.main' },
          }}
        />
        <Typography variant="body2" sx={{ color: '#6b7280', minWidth: 36 }}>
          {Math.round(progress)}%
        </Typography>
      </Box>

      {/* Stepper conforme proposta: círculo verde (ativo) / cinza claro (inativo), linha fina cinza, labels sem número */}
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
                      bgcolor: '#e5e7eb',
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
                      bgcolor: isActiveOrCompleted ? 'primary.main' : '#e5e7eb',
                      color: isActiveOrCompleted ? '#fff' : '#9e9e9e',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      flexShrink: 0,
                    }}
                  >
                    {index + 1}
                  </Box>
                  <Typography
                    sx={{
                      ml: 1.5,
                      color: isActiveOrCompleted ? '#374151' : '#9e9e9e',
                      fontWeight: isActive ? 600 : 400,
                      fontSize: '0.875rem',
                    }}
                  >
                    {step.label}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* Conteúdo da etapa ativa */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="h5"
            sx={{ fontWeight: 700, color: '#374151', mb: 3 }}
          >
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
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: 2 },
                  },
                }}
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
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': { color: 'primary.main' },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        bgcolor: 'primary.main',
                      },
                    }}
                  />
                }
                label="Ativar ao criar"
                sx={{ '& .MuiFormControlLabel-label': { color: '#374151' } }}
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
                  bgcolor: '#f9fafb',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e5e7eb' },
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

      {/* Botões de navegação */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1, mt: 4 }}>
        {errors.submit && (
          <Typography variant="body2" color="error" sx={{ alignSelf: 'flex-start' }}>
            {errors.submit}
          </Typography>
        )}
        <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          onClick={handleBack}
          sx={{
            color: '#6b7280',
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Voltar
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
          sx={{
            bgcolor: 'primary.main',
            color: '#fff',
            textTransform: 'none',
            fontWeight: 600,
            px: 2.5,
            py: 1.25,
            borderRadius: 1.5,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            '&:hover': {
              bgcolor: 'primary.dark',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            },
          }}
        >
          {activeStep === STEPS.length - 1 ? 'Concluir' : 'Próximo'}
        </Button>
        </Box>
      </Box>
    </Box>
  );
}
