import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import PredictiveMaintenance from '../components/PredictiveMaintenance';

function Maintenance() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Predictive Maintenance
      </Typography>
      <Paper sx={{ p: 3, mt: 3 }}>
        <PredictiveMaintenance />
      </Paper>
    </Box>
  );
}

export default Maintenance; 