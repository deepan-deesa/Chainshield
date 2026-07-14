import { Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { ApiResponse } from '../utils';
import { AuthenticatedRequest } from '../types';

const dashboardService = new DashboardService();

export class DashboardController {
  async getStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(412).json(ApiResponse.error('Precondition Failed: User context missing'));
      }
      const stats = await dashboardService.getDashboardStats(req.user);
      res.status(200).json(ApiResponse.success(stats, 'Dashboard telemetry metrics retrieved'));
    } catch (err) {
      next(err);
    }
  }

  async getRecentActivity(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const recent = await dashboardService.getDashboardRecentActivity();
      res.status(200).json(ApiResponse.success(recent, 'Dashboard activity feed retrieved'));
    } catch (err) {
      next(err);
    }
  }
}
export const dashboardController = new DashboardController();
