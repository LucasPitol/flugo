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
  Avatar,
  Chip,
  TableSortLabel,
} from '@mui/material';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';

const colaboradores = [
  {
    id: '1',
    nome: 'Fernanda Torres',
    email: 'fernandatorres@flugo.com',
    departamento: 'Design',
    status: 'Ativo' as const,
    iniciais: 'FT',
  },
  {
    id: '2',
    nome: "Joana D'Arc",
    email: 'joanadarc@flugo.com',
    departamento: 'TI',
    status: 'Ativo' as const,
    iniciais: 'JD',
  },
  {
    id: '3',
    nome: 'Mari Froes',
    email: 'marifroes@flugo.com',
    departamento: 'Marketing',
    status: 'Ativo' as const,
    iniciais: 'MF',
  },
  {
    id: '4',
    nome: 'Clara Costa',
    email: 'claracosta@flugo.com',
    departamento: 'Produto',
    status: 'Inativo' as const,
    iniciais: 'CC',
  },
];

export function Colaboradores() {
  return (
    <Box>
      {/* Header: título + botão */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#374151' }}>
          Colaboradores
        </Typography>
        <Button
          variant="outlined"
          sx={{
            bgcolor: 'primary.main',
            color: '#fff',
            textTransform: 'none',
            fontWeight: 600,
            px: 2,
            py: 1.25,
            borderRadius: 1.5,
            '&:hover': { bgcolor: 'primary.dark' },
          }}
        >
          Novo Colaborador
        </Button>
      </Box>

      {/* Tabela */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          border: '1px solid #e5e7eb',
          borderRadius: 5,
          overflow: 'hidden',
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f3f4f6' }}>
              <TableCell sx={{ fontWeight: 600, color: '#374151', py: 1.5 }}>
                <TableSortLabel
                  active
                  direction="desc"
                  sx={{ fontWeight: 600, color: '#374151' }}
                >
                  Nome
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#374151', py: 1.5 }}>
                <TableSortLabel
                  active
                  direction="desc"
                  sx={{ fontWeight: 600, color: '#374151' }}
                >
                  Email
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#374151', py: 1.5 }}>
                <TableSortLabel
                  active
                  direction="desc"
                  sx={{ fontWeight: 600, color: '#374151' }}
                >
                  Departamento
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#374151', py: 1.5 }}>
                <TableSortLabel
                  active
                  direction="desc"
                  sx={{ fontWeight: 600, color: '#374151' }}
                >
                  Status
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {colaboradores.map((row) => (
              <TableRow
                key={row.id}
                sx={{
                  '&:not(:last-child)': { borderBottom: 'none' },
                }}
              >
                <TableCell sx={{ py: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: '#e5e7eb',
                        color: '#374151',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                      }}
                    >
                      {row.iniciais}
                    </Avatar>
                    <Typography sx={{ color: '#374151', fontWeight: 500 }}>
                      {row.nome}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell sx={{ color: '#374151', py: 2 }}>
                  {row.email}
                </TableCell>
                <TableCell sx={{ color: '#374151', py: 2 }}>
                  {row.departamento}
                </TableCell>
                <TableCell sx={{ py: 2 }}>
                  <Chip
                    label={row.status}
                    size="small"
                    sx={{
                      bgcolor: row.status === 'Ativo' ? 'primary.main' : 'error.main',
                      color: '#fff',
                      fontWeight: 600,
                      borderRadius: 2,
                      '& .MuiChip-label': { px: 1.25 },
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
