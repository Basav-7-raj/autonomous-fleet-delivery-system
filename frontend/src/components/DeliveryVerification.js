import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  QrCodeScanner as ScannerIcon,
  PhotoCamera as CameraIcon,
  CheckCircle as CheckIcon,
  Close as CloseIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

const deliverySteps = ['Scan QR', 'Verify Identity', 'Capture Signature', 'Complete'];

function DeliveryVerification() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [verificationImage, setVerificationImage] = useState(null);
  const [customerSignature, setCustomerSignature] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found.');
        }
        const response = await fetch('/api/deliveries', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setDeliveries(data);
      } catch (err) {
        console.error("Failed to fetch deliveries:", err);
        setError(err);
        setSnackbar({
          open: true,
          message: `Error fetching deliveries: ${err.message}`,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDeliveries();
  }, []);

  const handleStartVerification = (delivery) => {
    setSelectedDelivery(delivery);
    setOpenDialog(true);
    setActiveStep(0);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedDelivery(null);
    setActiveStep(0);
    setVerificationImage(null);
    setCustomerSignature(null);
  };

  const handleNext = () => {
    if (activeStep === deliverySteps.length - 1) {
      handleCompleteDelivery();
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleImageCapture = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setVerificationImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureCapture = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomerSignature(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCompleteDelivery = async () => {
    if (selectedDelivery) {
      try {
        const response = await fetch(`/api/deliveries/${selectedDelivery._id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            status: 'DELIVERED',
            verificationImages: verificationImage ? [verificationImage] : [],
            customerSignature: customerSignature,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to complete delivery');
        }

        const updatedDelivery = await response.json();

        setDeliveries(prev =>
          prev.map(delivery =>
            delivery._id === updatedDelivery._id ? updatedDelivery : delivery
          )
        );
        setSnackbar({
          open: true,
          message: 'Delivery verification completed and saved successfully!',
        });
        handleCloseDialog();
      } catch (error) {
        console.error('Error completing delivery:', error);
        setSnackbar({
          open: true,
          message: `Error: ${error.message || 'Failed to save delivery verification.'}`,
        });
      }
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <ScannerIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Scan Customer QR Code
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ask the customer to show their QR code for verification
            </Typography>
          </Box>
        );
      case 1:
        return (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <CameraIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Capture Customer Photo
            </Typography>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="verification-image"
              type="file"
              onChange={handleImageCapture}
            />
            <label htmlFor="verification-image">
              <Button
                variant="contained"
                component="span"
                startIcon={<CameraIcon />}
              >
                Take Photo
              </Button>
            </label>
            {verificationImage && (
              <Box sx={{ mt: 2 }}>
                <img
                  src={verificationImage}
                  alt="Verification"
                  style={{ maxWidth: '100%', maxHeight: '200px' }}
                />
              </Box>
            )}
          </Box>
        );
      case 2:
        return (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <PersonIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Capture Customer Signature
            </Typography>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="signature-image"
              type="file"
              onChange={handleSignatureCapture}
            />
            <label htmlFor="signature-image">
              <Button
                variant="contained"
                component="span"
                startIcon={<CameraIcon />}
              >
                Capture Signature
              </Button>
            </label>
            {customerSignature && (
              <Box sx={{ mt: 2 }}>
                <img
                  src={customerSignature}
                  alt="Signature"
                  style={{ maxWidth: '100%', maxHeight: '200px' }}
                />
              </Box>
            )}
          </Box>
        );
      case 3:
        return (
          <Box sx={{ textAlign: 'center', py: 3, position: 'relative' }}>
            <CheckIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Verify Delivery Details
            </Typography>
            {verificationImage && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  m: 2,
                  width: 100,
                  height: 100,
                  overflow: 'hidden',
                  borderRadius: '4px',
                  boxShadow: 3,
                  border: '1px solid #e0e0e0',
                }}
              >
                <img
                  src={verificationImage}
                  alt="Verification"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>
            )}
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Customer: {selectedDelivery?.customerName}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Address: {selectedDelivery?.address}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Delivery ID: {selectedDelivery?.deliveryId}
            </Typography>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Delivery Verification
      </Typography>

      <Grid container spacing={3}>
        {loading ? (
          <Typography>Loading deliveries...</Typography>
        ) : error ? (
          <Typography color="error">Error: {error.message}</Typography>
        ) : deliveries.length === 0 ? (
          <Typography>No pending deliveries found.</Typography>
        ) : (
          deliveries.map((delivery) => (
            <Grid item xs={12} md={6} key={delivery._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Delivery ID: {delivery.deliveryId}</Typography>
                  <Typography>Customer: {delivery.customerName}</Typography>
                  <Typography>Address: {delivery.address}</Typography>
                  <Typography>Status: {delivery.status}</Typography>
                  <Typography>Expected: {new Date(delivery.estimatedDelivery).toLocaleString()}</Typography>
                  {delivery.status === 'DELIVERED' ? (
                    <Typography variant="subtitle1" sx={{ mt: 2, color: 'success.main', fontWeight: 'bold' }}>
                      Verified
                    </Typography>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={() => handleStartVerification(delivery)}
                      sx={{ mt: 2 }}
                    >
                      Start Verification
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Delivery Verification - {selectedDelivery?.deliveryId}
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
            {deliverySteps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          {renderStepContent(activeStep)}
        </DialogContent>
        <DialogActions>
          {activeStep !== 0 && (
            <Button onClick={handleBack}>Back</Button>
          )}
          <Button variant="contained" onClick={handleNext}>
            {activeStep === deliverySteps.length - 1 ? 'Complete' : 'Next'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity="success"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default DeliveryVerification;