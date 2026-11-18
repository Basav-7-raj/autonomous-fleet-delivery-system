const express = require('express');
const router = express.Router();
const { Feedback, Notification } = require('../models/Feedback');
const auth = require('../middleware/auth');
const { createAndEmitNotification } = require('../utils/notificationService');

// Submit feedback
router.post('/', auth, async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const feedback = new Feedback({
      ...req.body,
      user: req.user._id
    });
    await feedback.save();

    await createAndEmitNotification(
      req.app.get('io'),
      'improvement',
      'New Feedback Submitted',
      `Feedback "${feedback.title}" has been submitted successfully.`
    );

    res.status(201).json(feedback);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all feedback (admin only)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const feedback = await Feedback.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's feedback
router.get('/my-feedback', auth, async (req, res) => {
  try {
    const feedback = await Feedback.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update feedback status (admin only)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    feedback.status = req.body.status;
    if (req.body.response) {
      feedback.response = {
        text: req.body.response,
        respondedBy: req.user._id,
        respondedAt: new Date()
      };
    }
    await feedback.save();
    res.json(feedback);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Create notification (admin only)
router.post('/notifications', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const notification = new Notification(req.body);
    await notification.save();
    // Emit socket event for real-time notification
    req.app.get('io').emit('notification', notification);
    res.status(201).json(notification);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get notifications
router.get('/notifications', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [
        { expiresAt: { $gt: new Date() } },
        { expiresAt: null }
      ]
    }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark notification as read
router.post('/notifications/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    const alreadyRead = notification.readBy.some(
      read => read.user.toString() === req.user._id.toString()
    );
    
    if (!alreadyRead) {
      notification.readBy.push({
        user: req.user._id,
        readAt: new Date()
      });
      await notification.save();
    }
    
    res.json(notification);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 