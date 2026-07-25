import { Response } from 'express';
import { Notification } from '../models/Notification';
import { AuthRequest } from '../middleware/authMiddleware';

export class NotificationController {
  public static async getNotifications(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(50);
      const unreadCount = await Notification.countDocuments({ userId, isRead: false });

      res.json({
        success: true,
        data: {
          notifications,
          unreadCount,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async markAsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      await Notification.updateOne({ _id: id, userId }, { isRead: true });
      res.json({ success: true, message: 'Notification marked as read' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async markAllAsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      await Notification.updateMany({ userId, isRead: false }, { isRead: true });
      res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async deleteNotification(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      await Notification.deleteOne({ _id: id, userId });
      res.json({ success: true, message: 'Notification deleted' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
