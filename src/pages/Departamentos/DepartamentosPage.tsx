import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { PageHeader, AppButton, AppSnackbar } from '../../components/ui';
import { useDepartamentos } from './hooks/useDepartamentos';
import { DepartamentosTable } from './DepartamentosTable';

type SuccessToastState = { message: string; severity: 'success' } | null;

export function DepartamentosPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [successToast, setSuccessToast] = useState<SuccessToastState>(null);
  const {
    departamentos,
    loading,
    toastOpen,
    setToastOpen,
    toastMessage,
    toastSeverity,
    gestorNames,
    confirmDeleteOpen,
    departamentoToDelete,
    deleting,
    canDelete,
    openConfirmDelete,
    closeConfirmDelete,
    handleDelete,
    load,
  } = useDepartamentos();

  useEffect(() => {
    const state = location.state as { successMessage?: string } | undefined;
    if (state?.successMessage) {
      setSuccessToast({ message: state.successMessage, severity: 'success' });
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate]);

  return (
    <Box sx={{ maxWidth: 1200 }}>
      <PageHeader
        title="Departamentos"
        action={
          <AppButton variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/departamentos/novo')}>
            Novo departamento
          </AppButton>
        }
      />

      <AppSnackbar
        open={toastOpen}
        onClose={() => setToastOpen(false)}
        message={toastMessage}
        severity={toastSeverity}
        action={
          toastMessage.includes('Tempo esgotado') || toastMessage.includes('não foi possível') ? (
            <AppButton color="inherit" size="small" onClick={() => { load(); setToastOpen(false); }}>
              Tentar novamente
            </AppButton>
          ) : undefined
        }
      />

      <AppSnackbar
        open={successToast !== null}
        onClose={() => setSuccessToast(null)}
        message={successToast?.message}
        severity="success"
      />

      <Dialog
        open={confirmDeleteOpen}
        onClose={closeConfirmDelete}
        aria-labelledby="delete-department-dialog-title"
        aria-describedby="delete-department-dialog-description"
      >
        <DialogTitle id="delete-department-dialog-title">
          {canDelete ? 'Excluir departamento' : 'Exclusão não permitida'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-department-dialog-description">
            {canDelete && departamentoToDelete ? (
              <>
                Excluir o departamento &quot;{departamentoToDelete.nome}&quot;? Essa ação não pode
                ser desfeita.
              </>
            ) : departamentoToDelete ? (
              <>
                O departamento ainda possui colaboradores. Transfira ou remova os colaboradores
                antes de excluir o departamento.
              </>
            ) : null}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          {canDelete ? (
            <>
              <AppButton onClick={closeConfirmDelete} disabled={deleting}>
                Cancelar
              </AppButton>
              <AppButton
                variant="contained"
                color="error"
                onClick={handleDelete}
                loading={deleting}
              >
                Excluir
              </AppButton>
            </>
          ) : (
            <AppButton onClick={closeConfirmDelete}>Entendi</AppButton>
          )}
        </DialogActions>
      </Dialog>

      <DepartamentosTable
        loading={loading}
        departamentos={departamentos}
        gestorNames={gestorNames}
        onEditRow={(row) => navigate(`/departamentos/${row.id}/editar`)}
        onDeleteRow={openConfirmDelete}
      />
    </Box>
  );
}
