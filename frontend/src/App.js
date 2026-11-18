import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import RouteOptimization from './components/RouteOptimization';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import FleetManagement from './pages/FleetManagement';
import DeliveryTracking from './pages/DeliveryTracking';
import Analytics from './pages/Analytics';
import DamageManagement from './components/DamageManagement';
import EmergencyAlert from './components/EmergencyAlert';
import DeliveryVerification from './components/DeliveryVerification';
import VehicleTypeConfig from './components/VehicleTypeConfig';
import UserFeedback from './components/UserFeedback';
import DeliveryManagement from './pages/DeliveryManagement';
import Register from './pages/Register';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Maintenance from './pages/Maintenance';
import VehicleSimulation from './pages/VehicleSimulation';

// Create dark mode theme
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#393E46',
      paper: '#393E46',
    },
    text: {
      primary: '#fff',
      secondary: '#b0b3b8',
    },
  },
});

function AppContent() {
  const location = useLocation();
  return (
    <Box sx={{ display: 'flex' }}>
      <Navbar />
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          backgroundColor: 'background.default',
          minHeight: '100vh',
        }}
      >
        <TransitionGroup>
          <CSSTransition key={location.pathname} classNames="fade" timeout={300}>
            <Routes location={location}>
              {/* Public Routes */}
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />

              {/* Protected Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/fleet" element={<ProtectedRoute><FleetManagement /></ProtectedRoute>} />
              <Route path="/tracking" element={<ProtectedRoute><DeliveryTracking /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
              <Route path="/maintenance" element={<ProtectedRoute><Maintenance /></ProtectedRoute>} />
              <Route path="/damage" element={<ProtectedRoute><DamageManagement /></ProtectedRoute>} />
              <Route path="/emergency" element={<ProtectedRoute><EmergencyAlert /></ProtectedRoute>} />
              <Route path="/verify" element={<ProtectedRoute><DeliveryVerification /></ProtectedRoute>} />
              <Route path="/delivery-management" element={<ProtectedRoute><DeliveryManagement /></ProtectedRoute>} />
              <Route path="/vehicle-types" element={<ProtectedRoute><VehicleTypeConfig /></ProtectedRoute>} />
              <Route path="/feedback" element={<ProtectedRoute><UserFeedback /></ProtectedRoute>} />
              <Route path="/route-optimization" element={<ProtectedRoute><RouteOptimization /></ProtectedRoute>} />
              <Route path="/vehicle-simulation" element={<ProtectedRoute><VehicleSimulation /></ProtectedRoute>} />
              {/* Redirect root to dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
          </CSSTransition>
        </TransitionGroup>
      </Box>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;
