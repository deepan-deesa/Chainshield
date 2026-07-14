import { Response, NextFunction } from 'express';
import { TokenUtil, AppError } from '../utils';
import { AuthenticatedRequest, UserRole } from '../types';

export function authenticateJWT(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Access token is missing or malformed. Bearer token required.', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = TokenUtil.verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (err: any) {
    next(err);
  }
}

export function authorizeRoles(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('User not authenticated. Authorization rejected.', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError(`Access Denied! Clearances required: [${allowedRoles.join(', ')}]. Current role: ${req.user.role}`, 403));
    }

    next();
  };
}
