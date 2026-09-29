import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  IconButton,
  Divider,
  Avatar,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import {
  Dashboard,
  LocalHospital,
  Map,
  Assessment,
  Settings,
  Help,
  Menu as MenuIcon,
  Close,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 260;

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState('admin');

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/', roles: ['admin', 'dispatcher', 'driver'] },
    { text: 'Active Emergencies', icon: <LocalHospital />, path: '/active-emergencies', roles: ['admin', 'dispatcher'] },
    { text: 'Ambulances', icon: <LocalHospital />, path: '/ambulances', roles: ['admin', 'dispatcher'] },
    { text: 'Route Planning', icon: <Map />, path: '/routes', roles: ['admin', 'dispatcher'] },
    { text: 'Analytics', icon: <Assessment />, path: '/analytics', roles: ['admin'] },
    { text: 'Settings', icon: <Settings />, path: '/settings', roles: ['admin', 'dispatcher'] },
    { text: 'Help', icon: <Help />, path: '/help', roles: ['admin', 'dispatcher', 'driver'] },
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(role));

  const handleNavigation = (path) => {
    navigate(path);
    if (mobileOpen) {
      setMobileOpen(false);
    }
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#1f2937' }}>
      {/* Header */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <LocalHospital sx={{ color: '#ef4444', fontSize: 32, mr: 1 }} />
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
            SARS
          </Typography>
        </Box>
        <IconButton
          onClick={() => setMobileOpen(false)}
          sx={{ display: { md: 'none' }, color: 'white' }}
        >
          <Close />
        </IconButton>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* User Profile */}
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <Avatar
            sx={{ width: 40, height: 40, mr: 1.5, bgcolor: '#3b82f6' }}
          >
            A
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>
              Admin User
            </Typography>
            <Typography variant="caption" sx={{ color: '#9ca3af' }}>
              admin@sars.com
            </Typography>
          </Box>
        </Box>
        <FormControl fullWidth size="small">
          <Select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            sx={{
              color: '#d1d5db',
              fontSize: '0.75rem',
              '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
              '& .MuiSvgIcon-root': { color: '#d1d5db' },
              bgcolor: 'rgba(255,255,255,0.05)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
            }}
          >
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="dispatcher">Dispatcher</MenuItem>
            <MenuItem value="driver">Driver</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* Navigation Menu */}
      <List sx={{ flex: 1, pt: 2, px: 1 }}>
        {filteredMenuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: '0.375rem',
                  color: '#f9fafb',
                  py: 1.5,
                  bgcolor: isActive ? '#3b82f6' : 'transparent',
                  '&:hover': {
                    bgcolor: isActive ? '#3b82f6' : 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: isActive ? 'white' : '#9ca3af', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <Typography variant="caption" sx={{ color: '#6b7280' }}>
          SARS v1.0.0
        </Typography>
        <br />
        <Typography variant="caption" sx={{ color: '#6b7280' }}>
          © 2025 Smart Ambulance Routing
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
        }}
        open
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Sidebar;
