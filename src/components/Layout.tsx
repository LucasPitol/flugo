import { Box, Typography } from '@mui/material';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import PeopleOutlineRoundedIcon from '@mui/icons-material/PeopleOutlineRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { ReactNode } from 'react';

const SIDEBAR_WIDTH = 260;

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#fff' }}>
      {/* Sidebar */}
      <Box
        component="aside"
        sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          bgcolor: '#fff',
          borderRight: '1px solid #e5e7eb',
          py: 2,
          px: 2,
        }}
      >
        {/* Logo Flugo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, px: 1 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1,
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SendRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#374151' }}>
            Flugo
          </Typography>
        </Box>

        {/* Nav: Colaboradores (ativo) */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            py: 1.25,
            px: 1.5,
            borderRadius: 1,
            bgcolor: '#e5e7eb',
            color: '#374151',
          }}
        >
          <PeopleOutlineRoundedIcon sx={{ fontSize: 22, color: '#374151' }} />
          <Typography variant="body1" sx={{ flex: 1, fontWeight: 500 }}>
            Colaboradores
          </Typography>
          <ChevronRightRoundedIcon sx={{ fontSize: 20, color: '#6b7280' }} />
        </Box>
      </Box>

      {/* Main content */}
      <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top bar (avatar) */}
        <Box
          sx={{
            height: 56,
            bgcolor: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            px: 2,
          }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              border: '2px solid rgba(255,255,255,0.3)',
            }}
          />
        </Box>

        {/* Page content */}
        <Box sx={{ flex: 1, p: 3, bgcolor: '#fff' }}>{children}</Box>
      </Box>
    </Box>
  );
}
