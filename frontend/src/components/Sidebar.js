import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  DirectionsCar as FleetIcon,
  LocalShipping as DeliveryIcon,
  Analytics as AnalyticsIcon,
  Build as BuildIcon,
  Warning as WarningIcon,
  QrCodeScanner as ScannerIcon,
  Settings as SettingsIcon,
  Feedback as FeedbackIcon,
  Route as RouteIcon,
  Engineering as MaintenanceIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Fleet Management', icon: <FleetIcon />, path: '/fleet' },
  {
    text: 'Vehicle Simulation',
    icon: <FleetIcon />,
    path: '/vehicle-simulation',
    
  },
  { text: 'Delivery Tracking', icon: <DeliveryIcon />, path: '/tracking' },
  { text: 'Delivery Management', icon: <DeliveryIcon />, path: '/delivery-management' },
  { text: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics' },
  { text: 'Predictive Maintenance', icon: <MaintenanceIcon />, path: '/maintenance' },
  { text: 'Damage Management', icon: <BuildIcon />, path: '/damage' },
  { text: 'Emergency Alert', icon: <WarningIcon />, path: '/emergency' },
  { text: 'Delivery Verification', icon: <ScannerIcon />, path: '/verify' },
  { text: 'Vehicle Types', icon: <SettingsIcon />, path: '/vehicle-types' },
  { text: 'User Feedback', icon: <FeedbackIcon />, path: '/feedback' },
  {
    text: 'Route Optimization',
    icon: <RouteIcon />,
    path: '/route-optimization'
  },
];

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      style={{ height: '100%' }}
    >
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <List>
          {menuItems.map((item) => (
            item.subItems ? (
              <React.Fragment key={item.text}>
                <ListItem
                  button
                  onClick={() => navigate(item.path)}
                  selected={location.pathname === item.path}
                  sx={{
                    '&.Mui-selected': {
                      backgroundColor: 'primary.light',
                      '&:hover': {
                        backgroundColor: 'primary.light',
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: location.pathname === item.path ? 'primary.main' : 'inherit',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItem>
                {item.subItems.map((sub) => (
                  <ListItem
                    button
                    key={sub.text}
                    onClick={() => navigate(sub.path)}
                    selected={location.pathname === sub.path}
                    sx={{ pl: 4, '&.Mui-selected': { backgroundColor: 'primary.light' } }}
                  >
                    <ListItemText primary={sub.text} />
                  </ListItem>
                ))}
              </React.Fragment>
            ) : (
              <ListItem
                button
                key={item.text}
                onClick={() => navigate(item.path)}
                selected={location.pathname === item.path}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'primary.light',
                    '&:hover': {
                      backgroundColor: 'primary.light',
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: location.pathname === item.path ? 'primary.main' : 'inherit',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            )
          ))}
        </List>
      </Drawer>
    </motion.div>
  );
}

export default Sidebar; 