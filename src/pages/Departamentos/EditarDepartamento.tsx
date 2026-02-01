import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  listarDepartamentos,
  updateDepartamentoEAtualizarColaboradores,
} from '../../services/departamentosService';
import { listarColaboradores } from '../../services/colaboradoresService';
import type { UpdateDepartamentoInput } from '../../services/departamentos/types';
import type { Departamento } from '../../services/departamentos/types';
import type { Colaborador } from '../../services/colaboradores/types';
import { colors, typography, states } from '../../theme';
import { AppButton, AppSnackbar } from '../../components/ui';

export function EditarDepartamento() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [departamento, setDepartamento] = useState<Departamento | null>(null);
  const [nome, setNome] = useState('');
  const [gestorResponsavelId, setGestorResponsavelId] = useState('');
  const [colaboradoresSelecionados, setColaboradoresSelecionados] = useState<Colaborador[]>([]);
  const [departamentoDestinoRemovidos, setDepartamentoDestinoRemovidos] = useState('');
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    nome?: string;
    gestorResponsavelId?: string;
    destinoRemovidos?: string;
  }>({});
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const gestores = useMemo(
    () => colaboradores.filter((c) => c.nivelHierarquico === 'gestor'),
    [colaboradores]
  );

  const outrosDepartamentos = useMemo(
    () => departamentos.filter((d) => d.id !== id),
    [departamentos, id]
  );

  const colaboradoresRemovidosCount = useMemo(() => {
    if (!departamento) return 0;
    const atuais = new Set(colaboradoresSelecionados.map((c) => c.id));
    return departamento.colaboradoresIds.filter((cid) => !atuais.has(cid)).length;
  }, [departamento, colaboradoresSelecionados]);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([listarDepartamentos(), listarColaboradores()])
      .then(([deptList, colabList]) => {
        setDepartamentos(deptList);
        setColaboradores(colabList);
        const dep = deptList.find((d) => d.id === id) ?? null;
        setDepartamento(dep);
        if (dep) {
          setNome(dep.nome);
          setGestorResponsavelId(dep.gestorResponsavelId);
          const vinculados = dep.colaboradoresIds
            .map((cid) => colabList.find((c) => c.id === cid))
            .filter((c): c is Colaborador => c != null);
          setColaboradoresSelecionados(vinculados);
          const outros = deptList.filter((d) => d.id !== id);
          if (outros.length > 0) {
            setDepartamentoDestinoRemovidos(outros[0].nome);
          }
        }
      })
      .catch(() => {
        setToastMessage('Não foi possível carregar os dados. Tente novamente.');
        setToastOpen(true);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (departamento && outrosDepartamentos.length > 0 && !departamentoDestinoRemovidos) {
      setDepartamentoDestinoRemovidos(outrosDepartamentos[0].nome);
    }
  }, [departamento, outrosDepartamentos, departamentoDestinoRemovidos]);

  const validate = (): boolean => {
    const next: { nome?: string; gestorResponsavelId?: string; destinoRemovidos?: string } = {};
    if (!nome.trim()) next.nome = 'Nome é obrigatório';
    if (!gestorResponsavelId.trim()) next.gestorResponsavelId = 'Selecione o gestor responsável';
    if (colaboradoresRemovidosCount > 0 && outrosDepartamentos.length === 0) {
      next.destinoRemovidos = 'Cadastre outro departamento para transferir os colaboradores removidos.';
    }
    if (colaboradoresRemovidosCount > 0 && departamentoDestinoRemovidos.trim() === '') {
      next.destinoRemovidos = 'Selecione o departamento de destino para os colaboradores removidos.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate() || !id || !departamento) return;
    const colaboradoresPorId = new Map(colaboradores.map((c) => [c.id, c]));
    const input: UpdateDepartamentoInput = {
      nome: nome.trim(),
      gestorResponsavelId: gestorResponsavelId.trim(),
      colaboradoresIds: colaboradoresSelecionados.map((c) => c.id),
    };
    const destino =
      colaboradoresRemovidosCount > 0 ? departamentoDestinoRemovidos.trim() : departamento.nome;
    setSubmitting(true);
    updateDepartamentoEAtualizarColaboradores(
      id,
      input,
      departamento,
      colaboradoresPorId,
      destino,
      departamentos
    )
      .then(() => navigate('/departamentos'))
      .catch((err) => {
        setToastMessage(
          err instanceof Error && err.message
            ? err.message
            : 'Não foi possível salvar as alterações. Tente novamente.'
        );
        setToastOpen(true);
      })
      .finally(() => setSubmitting(false));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <Typography color="text.secondary">Carregando...</Typography>
      </Box>
    );
  }

  if (!id || !departamento) {
    return (
      <Box sx={{ maxWidth: 900 }}>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Departamento não encontrado.
        </Typography>
        <AppButton variant="contained" onClick={() => navigate('/departamentos')}>
          Voltar aos departamentos
        </AppButton>
      </Box>
    );
  }

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
          Editar departamento
        </Typography>
      </Breadcrumbs>

      <Typography variant="h5" sx={{ mb: 3 }}>
        Editar departamento
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
          disabled={loading}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: states.input.backgroundMuted,
              '& .MuiOutlinedInput-notchedOutline': { borderColor: states.input.borderDefault },
            },
          }}
        >
          <InputLabel id="gestor-edit-label" shrink>
            Gestor responsável
          </InputLabel>
          <Select
            labelId="gestor-edit-label"
            value={gestorResponsavelId}
            label="Gestor responsável"
            onChange={(e) => {
              setGestorResponsavelId(e.target.value);
              if (errors.gestorResponsavelId)
                setErrors((p) => ({ ...p, gestorResponsavelId: undefined }));
            }}
            displayEmpty
            renderValue={(v) => {
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
          {gestores.length === 0 && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1.75 }}>
              Cadastre colaboradores com nível &quot;Gestor&quot; para poder selecioná-los aqui.
            </Typography>
          )}
        </FormControl>

        <Typography variant="subtitle2" sx={{ fontWeight: typography.fontWeight.medium, mt: 1 }}>
          Colaboradores vinculados
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          Adicione ou remova colaboradores da lista. Ao adicionar, o colaborador é removido
          automaticamente do departamento anterior. Ao remover, é obrigatório escolher o departamento
          de destino — colaborador não pode ficar sem departamento.
        </Typography>
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
          loading={loading}
          disabled={loading}
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
          <List
            dense
            sx={{
              bgcolor: colors.neutral.backgroundMuted,
              borderRadius: 1,
              border: `1px solid ${colors.neutral.border}`,
            }}
          >
            {colaboradoresSelecionados.map((c) => (
              <ListItem key={c.id}>
                <ListItemText primary={c.nome} secondary={c.email} />
              </ListItem>
            ))}
          </List>
        )}
        <Typography variant="body2" sx={{ color: colors.neutral.textMuted }}>
          {colaboradoresSelecionados.length} colaborador(es) vinculado(s)
        </Typography>

        {colaboradoresRemovidosCount > 0 && (
          <FormControl
            fullWidth
            variant="outlined"
            error={!!errors.destinoRemovidos}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: states.input.backgroundMuted,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: states.input.borderDefault },
              },
            }}
          >
            <InputLabel id="destino-removidos-label" shrink>
              Departamento de destino (colaboradores removidos)
            </InputLabel>
            <Select
              labelId="destino-removidos-label"
              value={departamentoDestinoRemovidos}
              label="Departamento de destino (colaboradores removidos)"
              onChange={(e) => {
                setDepartamentoDestinoRemovidos(e.target.value);
                if (errors.destinoRemovidos)
                  setErrors((p) => ({ ...p, destinoRemovidos: undefined }));
              }}
              displayEmpty
              renderValue={(v) => {
                if (!v) return 'Selecione o departamento de destino';
                return v;
              }}
            >
              {outrosDepartamentos.map((d) => (
                <MenuItem key={d.id} value={d.nome}>
                  {d.nome}
                </MenuItem>
              ))}
            </Select>
            {errors.destinoRemovidos && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                {errors.destinoRemovidos}
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1.75 }}>
              {colaboradoresRemovidosCount} colaborador(es) será(ão) transferido(s) para o
              departamento selecionado. Obrigatório para impedir estado inválido (sem departamento).
            </Typography>
          </FormControl>
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 4 }}>
        <AppButton variant="text" onClick={() => navigate('/departamentos')}>
          Voltar
        </AppButton>
        <AppButton variant="contained" onClick={handleSubmit} loading={submitting}>
          Salvar alterações
        </AppButton>
      </Box>

      <AppSnackbar
        open={toastOpen}
        onClose={() => setToastOpen(false)}
        message={toastMessage}
      />
    </Box>
  );
}
