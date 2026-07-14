import { Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { ApiResponse } from '../utils';
import { AuthenticatedRequest } from '../types';

const authService = new AuthService();

export class AuthController {
  async register(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json(ApiResponse.success(result, 'Officer profile created successfully'));
    } catch (err) {
      next(err);
    }
  }

  async login(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { badgeNumber, password } = req.body;
      const result = await authService.login(badgeNumber, password);
      res.status(200).json(ApiResponse.success(result, 'Authentication successful'));
    } catch (err) {
      next(err);
    }
  }

  async refreshToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshToken(refreshToken);
      res.status(200).json(ApiResponse.success(result, 'Cryptographic token refreshed successfully'));
    } catch (err) {
      next(err);
    }
  }

  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(412).json(ApiResponse.error('Precondition Failed: User profile context missing'));
      }
      const profile = await authService.getProfile(req.user.userId);
      res.status(200).json(ApiResponse.success(profile, 'Profile retrieved successfully'));
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(412).json(ApiResponse.error('Precondition Failed: User profile context missing'));
      }
      const profile = await authService.updateProfile(req.user.userId, req.body);
      res.status(200).json(ApiResponse.success(profile, 'Profile updated successfully'));
    } catch (err) {
      next(err);
    }
  }
}
export const authController = new AuthController();
