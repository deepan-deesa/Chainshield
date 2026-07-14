import { Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service';
import { ApiResponse } from '../utils';
import { AuthenticatedRequest } from '../types';

const notificationService = new NotificationService();

export class NotificationController {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit } = req.query;
      const result = await notificationService.listNotifications({
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 50
      });
      res.status(200).json(ApiResponse.success(result, 'System telemetry alert broadcast retrieved'));
    } catch (err) {
      next(err);
    }
  }

  async markRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await notificationService.markAsRead(id);
      res.status(200).json(ApiResponse.success(result, 'Notification marked as read'));
    } catch (err) {
      next(err);
    }
  }

  async markAllRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await notificationService.markAllRead();
      res.status(200).json(ApiResponse.success(true, 'All active telemetry notifications marked as read'));
    } catch (err) {
      next(err);
    }
  }

  async clearAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await notificationService.clearAll();
      res.status(200).json(ApiResponse.success(true, 'Telemetry alert broadcast feed cleared'));
    } catch (err) {
      next(err);
    }
  }
}
export const notificationController = new NotificationController();
