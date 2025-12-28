// 📁 src/controllers/notificationController.js
const prisma = require('../utils/prisma');

// Get all notifications (with pagination)
exports.getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = unreadOnly === 'true' ? { isRead: false } : {};
    
    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        include: {
          patient: {
            select: { id: true, name: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { isRead: false } }),
    ]);

    res.json({
      notifications,
      total,
      unreadCount,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
  }
};

// Get unread count only
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await prisma.notification.count({
      where: { isRead: false }
    });
    res.json({ unreadCount: count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await prisma.notification.update({
      where: { id: parseInt(id) },
      data: { isRead: true },
    });
    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    });
    res.json({ message: 'อ่านทั้งหมดแล้ว' });
  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.notification.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: 'ลบการแจ้งเตือนแล้ว' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
  }
};

// Create notification (internal use)
exports.createNotification = async (type, title, message, patientId = null) => {
  try {
    return await prisma.notification.create({
      data: {
        type,
        title,
        message,
        patientId,
      },
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

