import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TableSortLabel,
  Skeleton,
  Avatar,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate } from 'react-router-dom';
import { listarColaboradores } from '../services/colaboradoresService';
import type { ColaboradorDTO } from '../../back-end/domain/types/ColaboradorDTO';

const SKELETON_ROWS = 6;

export function Colaboradores() {
  const navigate = useNavigate();
  const [colaboradores, setColaboradores] = useState<ColaboradorDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    listarColaboradores()
      .then(setColaboradores)
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ maxWidth: 1200 }}>
      {/* Header: título + botão — guia do print */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: '#555',
            fontSize: '1.5rem',
          }}
        >
          Colaboradores
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/colaboradores/novo')}
          sx={{
            bgcolor: '#2ECC71',
            color: '#fff',
            textTransform: 'none',
            fontWeight: 600,
            px: 2.5,
            py: 1.25,
            borderRadius: 1.5,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            '&:hover': {
              bgcolor: '#27AE60',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            },
          }}
        >
          Novo Colaborador
        </Button>
      </Box>

      {/* Card da tabela */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          overflow: 'hidden',
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F8F9FA' }}>
                <TableCell
                  sx={{
                    fontWeight: 500,
                    color: '#555',
                    py: 1.75,
                    borderBottom: '1px solid #EEE',
                    fontSize: '0.875rem',
                  }}
                >
                  <TableSortLabel
                    active
                    direction="desc"
                    sx={{
                      fontWeight: 500,
                      color: '#555',
                      '& .MuiTableSortLabel-icon': { color: '#888' },
                    }}
                  >
                    Nome
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 500,
                    color: '#555',
                    py: 1.75,
                    borderBottom: '1px solid #EEE',
                    fontSize: '0.875rem',
                  }}
                >
                  <TableSortLabel
                    active
                    direction="desc"
                    sx={{
                      fontWeight: 500,
                      color: '#555',
                      '& .MuiTableSortLabel-icon': { color: '#888' },
                    }}
                  >
                    Email
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 500,
                    color: '#555',
                    py: 1.75,
                    borderBottom: '1px solid #EEE',
                    fontSize: '0.875rem',
                  }}
                >
                  <TableSortLabel
                    active
                    direction="desc"
                    sx={{
                      fontWeight: 500,
                      color: '#555',
                      '& .MuiTableSortLabel-icon': { color: '#888' },
                    }}
                  >
                    Departamento
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 500,
                    color: '#555',
                    py: 1.75,
                    borderBottom: '1px solid #EEE',
                    fontSize: '0.875rem',
                  }}
                >
                  <TableSortLabel
                    active
                    direction="desc"
                    sx={{
                      fontWeight: 500,
                      color: '#555',
                      '& .MuiTableSortLabel-icon': { color: '#888' },
                    }}
                  >
                    Status
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: SKELETON_ROWS }).map((_, index) => (
                  <TableRow
                    key={index}
                    sx={{
                      bgcolor: '#fff',
                      '&:not(:last-child)': { borderBottom: 'none' },
                    }}
                  >
                    <TableCell sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Skeleton variant="circular" width={36} height={36} />
                        <Skeleton variant="text" width="60%" sx={{ fontSize: '0.875rem' }} />
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Skeleton variant="text" width="75%" sx={{ fontSize: '0.875rem' }} />
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Skeleton variant="text" width="40%" sx={{ fontSize: '0.875rem' }} />
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Skeleton variant="rounded" width={64} height={24} />
                    </TableCell>
                  </TableRow>
                ))
              ) : colaboradores.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} sx={{ py: 6, textAlign: 'center', borderBottom: 'none' }}>
                    <Typography sx={{ color: '#888', fontSize: '0.9375rem', mb: 1 }}>
                      Nenhum colaborador cadastrado.
                    </Typography>
                    <Typography sx={{ color: '#999', fontSize: '0.875rem' }}>
                      Clique em &quot;Novo Colaborador&quot; para adicionar o primeiro.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                colaboradores.map((row) => (
                  <TableRow
                    key={row.id}
                    sx={{
                      bgcolor: '#fff',
                      '&:not(:last-child)': { borderBottom: 'none' },
                    }}
                  >
                    <TableCell sx={{ py: 2, color: '#555' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          sx={{
                            width: 36,
                            height: 36,
                            bgcolor: '#E8F5E9',
                            color: '#2ECC71',
                          }}
                        >
                          <PersonIcon sx={{ fontSize: 20 }} />
                        </Avatar>
                        <Typography sx={{ color: '#555', fontWeight: 500, fontSize: '0.875rem' }}>
                          {row.nome}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: '#555', py: 2, fontSize: '0.875rem' }}>
                      {row.email}
                    </TableCell>
                    <TableCell sx={{ color: '#555', py: 2, fontSize: '0.875rem' }}>
                      {row.departamento}
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Chip
                        label={row.status}
                        size="small"
                        sx={{
                          bgcolor: row.status === 'Ativo' ? '#E6F7ED' : '#FEEEEE',
                          color: row.status === 'Ativo' ? '#2ECC71' : '#E74C3C',
                          fontWeight: 500,
                          borderRadius: 1.5,
                          border: 'none',
                          '& .MuiChip-label': { px: 1.25 },
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
