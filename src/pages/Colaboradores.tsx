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
              {colaboradores.map((row) => (
                <TableRow
                  key={row.id}
                  sx={{
                    bgcolor: '#fff',
                    '&:not(:last-child)': { borderBottom: 'none' },
                  }}
                >
                  <TableCell sx={{ py: 2, color: '#555' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: '#E5E7EB',
                          color: '#555',
                          fontWeight: 500,
                          fontSize: '0.875rem',
                        }}
                      >
                        {row.iniciais}
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
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
