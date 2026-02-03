import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, AppButton, AppSnackbar } from '../../components/ui';
import { ColaboradoresFilters } from '../../components/colaboradores/ColaboradoresFilters';
import { useColaboradores } from './hooks/useColaboradores';
import { ColaboradoresTable } from './ColaboradoresTable';
import { ColaboradorEditDrawer } from './ColaboradorEditDrawer';
import { maskBrCurrencyInput } from '../../utils/formatBr';

function activeFiltersCount(f: { name?: string; email?: string; department?: string }): number {
  return [f.name, f.email, f.department].filter(
    (v) => v != null && String(v).trim() !== ''
  ).length;
}

export function ColaboradoresPage() {
  const navigate = useNavigate();
  const [filterOpen, setFilterOpen] = useState(false);
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
    departamentos,
    gestoresForSelect,
    gestoresLoading,
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
    editCargo,
    setEditCargo,
    editDataAdmissao,
    setEditDataAdmissao,
    editNivelHierarquico,
    setEditNivelHierarquico,
    editGestorId,
    setEditGestorId,
    editSalarioBase,
    setEditSalarioBase,
    editErrors,
    setEditErrors,
    editSubmitting,
    handleEditSubmit,
    resetEditFormToColaborador,
    confirmSingleDeleteOpen,
    openConfirmSingleDelete,
    closeConfirmSingleDelete,
    deletingSingle,
    handleSingleDelete,
    editToastOpen,
    setEditToastOpen,
    editToastMessage,
    filters,
    appliedFilters,
    onFilterChange,
    onApplyFilters,
    onClearFilters,
    syncFiltersFromApplied,
  } = useColaboradores();

  const activeCount = useMemo(() => activeFiltersCount(appliedFilters), [appliedFilters]);
  const filtrosLabel = activeCount > 0 ? `Filtros (${activeCount})` : 'Filtros';

  return (
    <Box sx={{ maxWidth: 1200 }}>
      <PageHeader
        title="Colaboradores"
        action={
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              '& .MuiButton-root': { minHeight: 40 },
            }}
          >
            {selectedIds.size > 0 ? (
              <>
                <Typography
                  component="span"
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontWeight: 500 }}
                >
                  {selectedIds.size} selecionado{selectedIds.size !== 1 ? 's' : ''}
                </Typography>
                <AppButton
                  variant="outlined"
                  color="error"
                  onClick={() => setConfirmOpen(true)}
                  sx={{ minHeight: 40 }}
                >
                  Excluir selecionados
                </AppButton>
              </>
            ) : (
              <>
                <AppButton
                  variant="outlined"
                  startIcon={<SearchIcon />}
                  onClick={() => {
                    syncFiltersFromApplied();
                    setFilterOpen(true);
                  }}
                >
                  {filtrosLabel}
                </AppButton>
                <AppButton
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/colaboradores/novo')}
                >
                  Novo colaborador
                </AppButton>
              </>
            )}
          </Box>
        }
      />

      <ColaboradoresFilters
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        onFilterChange={onFilterChange}
        onClearFilters={onClearFilters}
        onApply={() => {
          onApplyFilters();
          setFilterOpen(false);
        }}
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
        cargo={editCargo}
        dataAdmissao={editDataAdmissao}
        nivelHierarquico={editNivelHierarquico}
        gestorId={editGestorId}
        salarioBase={editSalarioBase}
        departamentos={departamentos}
        gestores={gestoresForSelect}
        gestoresLoading={gestoresLoading}
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
        onCargoChange={(v) => {
          setEditCargo(v);
          if (editErrors.cargo) setEditErrors((p) => ({ ...p, cargo: undefined }));
        }}
        onDataAdmissaoChange={(v) => {
          setEditDataAdmissao(v);
          if (editErrors.dataAdmissao) setEditErrors((p) => ({ ...p, dataAdmissao: undefined }));
        }}
        onNivelHierarquicoChange={(v) => {
          setEditNivelHierarquico(v);
          if (v === 'gestor') setEditGestorId('');
          setEditErrors((p) => ({ ...p, nivelHierarquico: undefined, gestorId: undefined }));
        }}
        onGestorIdChange={(v) => {
          setEditGestorId(v);
          if (editErrors.gestorId) setEditErrors((p) => ({ ...p, gestorId: undefined }));
        }}
        onSalarioBaseChange={(v) => {
          setEditSalarioBase(maskBrCurrencyInput(v));
          if (editErrors.salarioBase) setEditErrors((p) => ({ ...p, salarioBase: undefined }));
        }}
        onSave={handleEditSubmit}
        onCancelEdit={resetEditFormToColaborador}
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
