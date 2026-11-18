const { Notification } = require('../models/Feedback');

const createAndEmitNotification = async (io, type, title, message) => {
  try {
    const notification = new Notification({
      type,
      title,
      message,
      priority: 'medium'
    });
    await notification.save();
    io.emit('notification', notification);
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

module.exports = { createAndEmitNotification }; 