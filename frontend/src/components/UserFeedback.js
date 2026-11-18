import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Rating,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Notifications as NotificationIcon,
  Feedback as FeedbackIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io('https://autonomous-vehicle-lyze.onrender.com');

function UserFeedback() {
  const [notifications, setNotifications] = useState([]);
  const [openFeedback, setOpenFeedback] = useState(false);
  const [feedback, setFeedback] = useState({
    title: '',
    description: '',
    rating: 0,
    category: 'general',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [myFeedback, setMyFeedback] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [feedbackError, setFeedbackError] = useState(null);

  useEffect(() => {
    fetchNotifications();
    fetchMyFeedback();
    socket.on('notification', (newNotification) => {
      setNotifications(prev => [newNotification, ...prev]);
      setSnackbar({
        open: true,
        message: 'New notification received!',
        severity: 'info',
      });
    });

    return () => {
      socket.off('notification');
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token');
      const response = await axios.get('https://autonomous-vehicle-lyze.onrender.com/api/feedback/notifications', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotifications(response.data);
      setLoading(false);
    } catch (error) {
      // Inject demo notifications
      setNotifications([
        {
          _id: 'demo1',
          title: 'System Update',
          description: 'The system will undergo maintenance tonight.',
          type: 'info',
          createdAt: new Date().toISOString(),
          readBy: [],
        },
        {
          _id: 'demo2',
          title: 'Feedback Received',
          description: 'Thank you for your valuable feedback!',
          type: 'success',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          readBy: ['user'],
        },
        {
          _id: 'demo3',
          title: 'Action Required',
          description: 'Please update your profile information.',
          type: 'warning',
          createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
          readBy: [],
        }
      ]);
      setLoading(false);
    }
  };

  const fetchMyFeedback = async () => {
    try {
      setFeedbackLoading(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token');
      const response = await axios.get('https://autonomous-vehicle-lyze.onrender.com/api/feedback/my-feedback', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMyFeedback(response.data);
      setFeedbackLoading(false);
    } catch (error) {
      // Inject demo feedback
      setMyFeedback([
        {
          _id: 'fb1',
          title: 'Great Service',
          description: 'The delivery was on time and the driver was very polite.',
          rating: 5,
          category: 'delivery',
          createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        },
        {
          _id: 'fb2',
          title: 'Vehicle Issue',
          description: 'The vehicle had a minor issue but was resolved quickly.',
          rating: 4,
          category: 'vehicle',
          createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
        },
        {
          _id: 'fb3',
          title: 'App Feedback',
          description: 'The app UI is modern and easy to use.',
          rating: 5,
          category: 'general',
          createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
        },
        {
          _id: 'fb4',
          title: 'Support Response',
          description: 'Support team responded quickly to my query.',
          rating: 5,
          category: 'support',
          createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        }
      ]);
      setFeedbackLoading(false);
    }
  };

  const handleOpenFeedback = () => setOpenFeedback(true);

  const handleCloseFeedback = () => {
    setOpenFeedback(false);
    setFeedback({
      title: '',
      description: '',
      rating: 0,
      category: 'general',
    });
  };

  const handleFeedbackChange = (e) => {
    const { name, value } = e.target;
    setFeedback(prev => ({ ...prev, [name]: value }));
  };

  const handleRatingChange = (event, newValue) => {
    setFeedback(prev => ({ ...prev, rating: newValue }));
  };

  const handleSubmitFeedback = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setSnackbar({
          open: true,
          message: 'Authentication token not found. Please log in.',
          severity: 'error',
        });
        return;
      }
      await axios.post('https://autonomous-vehicle-lyze.onrender.com/api/feedback', feedback, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSnackbar({
        open: true,
        message: 'Thank you for your feedback!',
        severity: 'success',
      });
      handleCloseFeedback();
      fetchNotifications();
      fetchMyFeedback();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSnackbar({
        open: true,
        message: 'Error submitting feedback. Please try again.',
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const markNotificationAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setSnackbar({
          open: true,
          message: 'Authentication token not found. Please log in.',
          severity: 'error',
        });
        return;
      }
      await axios.post(`https://autonomous-vehicle-lyze.onrender.com/api/feedback/notifications/${id}/read`, {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setNotifications(prev =>
        prev.map(notification =>
          notification._id === id
            ? { ...notification, readBy: [...notification.readBy, 'user'] }
            : notification
        )
      );
      setSnackbar({
        open: true,
        message: 'Notification marked as read.',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setSnackbar({
        open: true,
        message: 'Error marking notification as read.',
        severity: 'error',
      });
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'improvement':
        return <CheckCircleIcon color="success" />;
      case 'update':
        return <InfoIcon color="info" />;
      case 'maintenance':
        return <WarningIcon color="warning" />;
      default:
        return <NotificationIcon />;
    }
  };

  if (loading || feedbackLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Typography variant="h5">Loading Notifications and Feedback...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Typography variant="h5" color="error">{error}</Typography>
      </Box>
    );
  }

  if (feedbackError) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Typography variant="h5" color="error">{feedbackError}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h4" component="h1">
              User Feedback & Notifications
            </Typography>
            <Button
              variant="contained"
              startIcon={<FeedbackIcon />}
              onClick={handleOpenFeedback}
            >
              Submit Feedback
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Recent Notifications
            </Typography>
            <List>
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <React.Fragment key={notification._id}>
                    <ListItem
                      sx={{
                        bgcolor: notification.readBy && notification.readBy.length > 0 ? 'transparent' : 'action.hover',
                      }}
                    >
                      <ListItemIcon>
                        {getNotificationIcon(notification.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={notification.title}
                        secondary={
                          <>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              {notification.message}
                            </Typography>
                            <br />
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </>
                        }
                      />
                      {(!notification.readBy || !notification.readBy.some(entry => entry.user === localStorage.getItem('userId'))) && (
                        <Chip
                          label="Mark as Read"
                          onClick={() => markNotificationAsRead(notification._id)}
                          color="primary"
                          size="small"
                          sx={{ cursor: 'pointer' }}
                        />
                      )}
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))
              ) : (
                <Typography variant="body1" color="text.secondary" sx={{ p: 2 }}>
                  No notifications found.
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Your Submitted Feedback
            </Typography>
            <List>
              {myFeedback.length > 0 ? (
                myFeedback.map((fb) => (
                  <React.Fragment key={fb._id}>
                    <ListItem>
                      <ListItemText
                        primary={fb.title}
                        secondary={
                          <>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              {fb.description}
                            </Typography>
                            <br />
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                              <Rating name="read-only" value={fb.rating} readOnly size="small" />
                              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                Status: {fb.status} - {new Date(fb.createdAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                            {fb.response && fb.response.text && (
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                                Admin Response: {fb.response.text}
                              </Typography>
                            )}
                          </>
                        }
                      />
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))
              ) : (
                <Typography variant="body1" color="text.secondary" sx={{ p: 2 }}>
                  You have not submitted any feedback yet.
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={openFeedback} onClose={handleCloseFeedback} maxWidth="sm" fullWidth>
        <DialogTitle>
          Submit Your Feedback
          <IconButton
            aria-label="close"
            onClick={handleCloseFeedback}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              name="title"
              value={feedback.title}
              onChange={handleFeedbackChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={feedback.description}
              onChange={handleFeedbackChange}
              multiline
              rows={4}
              required
              sx={{ mb: 2 }}
            />
            <Box sx={{ mb: 2 }}>
              <Typography component="legend">Rating</Typography>
              <Rating
                name="rating"
                value={feedback.rating}
                onChange={handleRatingChange}
                precision={1}
                required
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseFeedback}>Cancel</Button>
          <Button onClick={handleSubmitFeedback} variant="contained" color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default UserFeedback; 