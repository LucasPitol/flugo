import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PageHeader, AppButton, AppSnackbar } from '../../components/ui';
import { useColaboradores } from './hooks/useColaboradores';
import { ColaboradoresTable } from './ColaboradoresTable';
import { ColaboradorEditDrawer } from './ColaboradorEditDrawer';

export function ColaboradoresPage() {
  const navigate = useNavigate();
  const {
    loading,
    sortedColaboradores,
    load,
    toastOpen,
    setToastOpen,
    orderBy,
    order,
    handleRequestSort,
    selectedIds,
    toggleRow,
    toggleSelectAll,
    confirmOpen,
    setConfirmOpen,
    deleting,
    handleBulkDelete,
    toastBulkOpen,
    setToastBulkOpen,
    toastBulkMessage,
    editingColaborador,
    openEdit,
    closeEdit,
    editNome,
    setEditNome,
    editEmail,
    setEditEmail,
    editDepartamento,
    setEditDepartamento,
    editStatus,
    setEditStatus,
    editErrors,
    setEditErrors,
    editSubmitting,
    handleEditSubmit,
    confirmSingleDeleteOpen,
    openConfirmSingleDelete,
    closeConfirmSingleDelete,
    deletingSingle,
    handleSingleDelete,
    editToastOpen,
    setEditToastOpen,
    editToastMessage,
  } = useColaboradores();

  return (
    <Box sx={{ maxWidth: 1200 }}>
      <PageHeader
        title="Colaboradores"
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            {selectedIds.size > 0 && (
              <AppButton
                variant="outlined"
                onClick={() => setConfirmOpen(true)}
              >
                Excluir selecionados
              </AppButton>
            )}
            <AppButton variant="contained" onClick={() => navigate('/colaboradores/novo')}>
              Novo Colaborador
            </AppButton>
          </Box>
        }
      />

      <AppSnackbar
        open={toastOpen}
        onClose={() => setToastOpen(false)}
        message="Não foi possível carregar os colaboradores. Tente novamente."
        action={
          <AppButton color="inherit" size="small" onClick={() => { load(); setToastOpen(false); }}>
            Tentar novamente
          </AppButton>
        }
      />

      <AppSnackbar
        open={toastBulkOpen}
        onClose={() => setToastBulkOpen(false)}
        message={toastBulkMessage}
      />

      <AppSnackbar
        open={editToastOpen}
        onClose={() => setEditToastOpen(false)}
        message={editToastMessage}
      />

      <Dialog
        open={confirmOpen}
        onClose={() => !deleting && setConfirmOpen(false)}
        aria-labelledby="bulk-delete-dialog-title"
        aria-describedby="bulk-delete-dialog-description"
      >
        <DialogTitle id="bulk-delete-dialog-title">Excluir selecionados</DialogTitle>
        <DialogContent>
          <DialogContentText id="bulk-delete-dialog-description">
            {selectedIds.size === 1
              ? 'Excluir 1 colaborador? Essa ação não pode ser desfeita.'
              : `Excluir ${selectedIds.size} colaboradores? Essa ação não pode ser desfeita.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <AppButton onClick={() => setConfirmOpen(false)} disabled={deleting}>
            Cancelar
          </AppButton>
          <AppButton
            variant="contained"
            color="error"
            onClick={handleBulkDelete}
            loading={deleting}
          >
            Excluir
          </AppButton>
        </DialogActions>
      </Dialog>

      <ColaboradorEditDrawer
        open={!!editingColaborador}
        colaborador={editingColaborador}
        nome={editNome}
        email={editEmail}
        departamento={editDepartamento}
        status={editStatus}
        errors={editErrors}
        submitting={editSubmitting}
        onClose={closeEdit}
        onNomeChange={(v) => {
          setEditNome(v);
          if (editErrors.nome) setEditErrors((p) => ({ ...p, nome: undefined }));
        }}
        onEmailChange={(v) => {
          setEditEmail(v);
          if (editErrors.email) setEditErrors((p) => ({ ...p, email: undefined }));
        }}
        onDepartamentoChange={(v) => {
          setEditDepartamento(v);
          if (editErrors.departamento) setEditErrors((p) => ({ ...p, departamento: undefined }));
        }}
        onStatusChange={setEditStatus}
        onSave={handleEditSubmit}
        onDeleteClick={openConfirmSingleDelete}
        confirmSingleDeleteOpen={confirmSingleDeleteOpen}
        deletingSingle={deletingSingle}
        onConfirmSingleDeleteClose={closeConfirmSingleDelete}
        onConfirmSingleDelete={handleSingleDelete}
      />

      <ColaboradoresTable
        loading={loading}
        sortedColaboradores={sortedColaboradores}
        selectedIds={selectedIds}
        orderBy={orderBy}
        order={order}
        onRequestSort={handleRequestSort}
        onToggleRow={toggleRow}
        onToggleSelectAll={toggleSelectAll}
        onEditRow={openEdit}
      />
    </Box>
  );
}
