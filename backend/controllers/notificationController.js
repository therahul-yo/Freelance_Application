import Notification from "../models/notificationModel.js";

// @desc    Get all notifications for user
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate("sender", "name")
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      res.status(404);
      throw new Error("Notification not found");
    }
    if (notification.recipient.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error("Not authorized");
    }
    notification.isRead = true;
    await notification.save();
    res.json(notification);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    );
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

export { getNotifications, markAsRead, markAllAsRead };
