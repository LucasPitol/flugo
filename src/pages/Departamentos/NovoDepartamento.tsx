import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Chip,
} from '@mui/material';
import { criarDepartamentoEAtualizarColaboradores } from '../../services/departamentosService';
import { listarColaboradores } from '../../services/colaboradoresService';
import type { CreateDepartamentoInput } from '../../services/departamentos/types';
import type { Colaborador } from '../../services/colaboradores/types';
import { colors, typography, states } from '../../theme';
import { AppButton, AppSnackbar } from '../../components/ui';

export function NovoDepartamento() {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [gestorResponsavelId, setGestorResponsavelId] = useState('');
  const [colaboradoresSelecionados, setColaboradoresSelecionados] = useState<Colaborador[]>([]);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [colaboradoresLoading, setColaboradoresLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ nome?: string; gestorResponsavelId?: string }>({});
  const [toastOpen, setToastOpen] = useState(false);

  const gestores = colaboradores.filter((c) => c.nivelHierarquico === 'gestor');

  useEffect(() => {
    setColaboradoresLoading(true);
    listarColaboradores()
      .then(setColaboradores)
      .catch(() => setColaboradores([]))
      .finally(() => setColaboradoresLoading(false));
  }, []);

  const validate = (): boolean => {
    const next: { nome?: string; gestorResponsavelId?: string } = {};
    if (!nome.trim()) next.nome = 'Nome é obrigatório';
    if (!gestorResponsavelId.trim()) next.gestorResponsavelId = 'Selecione o gestor responsável';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const input: CreateDepartamentoInput = {
      nome: nome.trim(),
      gestorResponsavelId: gestorResponsavelId.trim(),
      colaboradoresIds: colaboradoresSelecionados.map((c) => c.id),
    };
    setSubmitting(true);
    criarDepartamentoEAtualizarColaboradores(input, colaboradoresSelecionados)
      .then(() => {
        const msg =
          colaboradoresSelecionados.length > 0
            ? `Departamento criado. ${colaboradoresSelecionados.length} colaborador(es) vinculado(s).`
            : 'Departamento criado.';
        navigate('/departamentos', { state: { successMessage: msg } });
      })
      .catch(() => setToastOpen(true))
      .finally(() => setSubmitting(false));
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
          onClick={() => navigate('/departamentos')}
        >
          Departamentos
        </Link>
        <Typography variant="body2" sx={{ color: colors.neutral.textMuted }}>
          Cadastrar departamento
        </Typography>
      </Breadcrumbs>

      <Typography variant="h5" sx={{ mb: 3 }}>
        Novo departamento
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <TextField
          label="Nome"
          value={nome}
          onChange={(e) => {
            setNome(e.target.value);
            if (errors.nome) setErrors((p) => ({ ...p, nome: undefined }));
          }}
          fullWidth
          variant="outlined"
          required
          error={!!errors.nome}
          helperText={errors.nome}
          placeholder="Ex.: TI, RH, Marketing"
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: states.input.backgroundMuted,
              '& .MuiOutlinedInput-notchedOutline': { borderColor: states.input.borderDefault },
            },
          }}
        />

        <FormControl
          fullWidth
          variant="outlined"
          required
          error={!!errors.gestorResponsavelId}
          disabled={colaboradoresLoading}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: states.input.backgroundMuted,
              '& .MuiOutlinedInput-notchedOutline': { borderColor: states.input.borderDefault },
            },
          }}
        >
          <InputLabel id="gestor-dep-label" shrink>
            Gestor responsável
          </InputLabel>
          <Select
            labelId="gestor-dep-label"
            value={gestorResponsavelId}
            label="Gestor responsável"
            onChange={(e) => {
              setGestorResponsavelId(e.target.value);
              if (errors.gestorResponsavelId)
                setErrors((p) => ({ ...p, gestorResponsavelId: undefined }));
            }}
            displayEmpty
            renderValue={(v) => {
              if (colaboradoresLoading) return 'Carregando...';
              if (!v)
                return gestores.length === 0
                  ? 'Nenhum gestor cadastrado'
                  : 'Selecione o gestor responsável';
              const g = gestores.find((c) => c.id === v);
              return g ? g.nome : v;
            }}
          >
            {gestores.map((g) => (
              <MenuItem key={g.id} value={g.id}>
                {g.nome}
              </MenuItem>
            ))}
          </Select>
          {errors.gestorResponsavelId && (
            <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
              {errors.gestorResponsavelId}
            </Typography>
          )}
          {!colaboradoresLoading && gestores.length === 0 && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1.75 }}>
              Cadastre colaboradores com nível &quot;Gestor&quot; para poder selecioná-los aqui.
            </Typography>
          )}
        </FormControl>

        <Autocomplete
          multiple
          options={colaboradores}
          value={colaboradoresSelecionados}
          onChange={(_, newValue) => setColaboradoresSelecionados(newValue)}
          getOptionLabel={(option) => option.nome}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          filterOptions={(options, { inputValue }) => {
            const search = inputValue.trim().toLowerCase();
            if (!search) return options;
            return options.filter((c) => c.nome.toLowerCase().includes(search));
          }}
          loading={colaboradoresLoading}
          disabled={colaboradoresLoading}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Colaboradores"
              placeholder="Buscar por nome..."
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: states.input.backgroundMuted,
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: states.input.borderDefault },
                },
              }}
            />
          )}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                label={option.nome}
                size="small"
                {...getTagProps({ index })}
                sx={{
                  bgcolor: states.chip.successBg,
                  color: states.chip.successColor,
                  fontWeight: typography.fontWeight.medium,
                }}
              />
            ))
          }
          noOptionsText="Nenhum colaborador encontrado"
          ChipProps={{ size: 'small' }}
        />
        {colaboradoresSelecionados.length > 0 && (
          <Typography variant="body2" sx={{ color: colors.neutral.textMuted }}>
            {colaboradoresSelecionados.length} colaborador(es) selecionado(s)
          </Typography>
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 4 }}>
        <AppButton variant="text" onClick={() => navigate('/departamentos')}>
          Voltar
        </AppButton>
        <AppButton variant="contained" onClick={handleSubmit} loading={submitting}>
          Criar departamento
        </AppButton>
      </Box>

      <AppSnackbar
        open={toastOpen}
        onClose={() => setToastOpen(false)}
        message="Não foi possível salvar o departamento. Tente novamente."
        severity="error"
      />
    </Box>
  );
}
