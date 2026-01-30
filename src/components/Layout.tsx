import { useState } from 'react';
import { Box, Typography, IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import PeopleOutlineRoundedIcon from '@mui/icons-material/PeopleOutlineRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import PersonIcon from '@mui/icons-material/Person';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { colors, typography } from '../theme';

const SIDEBAR_WIDTH = 260;

export function Layout() {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleClose();
    logout();
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: colors.neutral.background }}>
      <Box
        component="aside"
        sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          bgcolor: colors.neutral.background,
          borderRight: `1px solid ${colors.neutral.border}`,
          py: 2,
          px: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, px: 1 }}>
          <Box
            component="img"
            src="/logo2.png"
            alt="Flugo"
            sx={{ height: 32, width: 'auto', objectFit: 'contain' }}
          />
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            py: 1.25,
            px: 1.5,
            borderRadius: 1,
            bgcolor: colors.neutral.background,
            color: colors.neutral.text,
          }}
        >
          <PeopleOutlineRoundedIcon sx={{ fontSize: 22, color: colors.neutral.text }} />
          <Typography variant="body1" sx={{ flex: 1, fontWeight: typography.fontWeight.medium }}>
            Colaboradores
          </Typography>
          <ChevronRightRoundedIcon sx={{ fontSize: 20, color: colors.secondary.main }} />
        </Box>
      </Box>

      <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Box
          sx={{
            height: 56,
            bgcolor: colors.neutral.background,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            px: 2,
            borderBottom: `none`,
          }}
        >
          <IconButton
            aria-label="Abrir menu do usuário"
            aria-controls={open ? 'user-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleOpen}
            sx={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              color: 'primary.contrast',
              border: '2px solid rgba(255,255,255,0.3)',
              '&:hover': { bgcolor: 'primary.dark' },
            }}
          >
            <PersonIcon sx={{ fontSize: 20 }} />
          </IconButton>
          <Menu
            id="user-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            slotProps={{ paper: { sx: { mt: 1.5, minWidth: 180 } } }}
          >
            {user?.email && (
              <MenuItem disabled sx={{ opacity: 1, cursor: 'default' }}>
                <ListItemText
                  primary={user.email}
                  primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                />
              </MenuItem>
            )}
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Sair" />
            </MenuItem>
          </Menu>
        </Box>
        <Box sx={{ flex: 1, p: 3, bgcolor: colors.neutral.background }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
