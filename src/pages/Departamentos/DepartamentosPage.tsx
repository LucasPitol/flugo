import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { PageHeader, AppButton, AppSnackbar } from '../../components/ui';
import { useDepartamentos } from './hooks/useDepartamentos';
import { DepartamentosTable } from './DepartamentosTable';

export function DepartamentosPage() {
  const navigate = useNavigate();
  const {
    departamentos,
    loading,
    toastOpen,
    setToastOpen,
    toastMessage,
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
        action={
          toastMessage.includes('Tempo esgotado') || toastMessage.includes('não foi possível') ? (
            <AppButton color="inherit" size="small" onClick={() => { load(); setToastOpen(false); }}>
              Tentar novamente
            </AppButton>
          ) : undefined
        }
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
        onEditRow={() => {}}
        onDeleteRow={openConfirmDelete}
      />
    </Box>
  );
}
