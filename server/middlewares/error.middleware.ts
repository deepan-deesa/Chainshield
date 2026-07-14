import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError, ApiResponse } from '../utils';
import { RepositoryFactory } from '../repositories/factory';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal secure core server error';
  let errors: any[] | undefined = undefined;

  // Log to DB system log lazily
  try {
    const sysLogRepo = RepositoryFactory.getSystemLogRepository();
    sysLogRepo.create({
      level: statusCode >= 500 ? 'ERROR' : 'WARN',
      message: `Request [${req.method}] ${req.url} failed with code ${statusCode}: ${message}`,
      meta: JSON.stringify({
        stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
        body: req.body,
        query: req.query
      })
    }).catch(() => {});
  } catch (logError) {
    // Fail-safe
  }

  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Request parameter validation failed';
    errors = err.issues.map(zErr => ({
      field: zErr.path.join('.'),
      message: zErr.message
    }));
  }

  // Handle JWT errors specifically
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid cryptographic credentials signature';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Cryptographic session token expired';
  }

  // Handle Prisma Known Constraint Errors
  if (err.code && err.code.startsWith('P')) {
    statusCode = 409;
    if (err.code === 'P2002') {
      message = 'Entity duplication error. Database constraint conflict.';
      errors = err.meta?.target ? [{ field: err.meta.target.join(','), message: 'Must be unique' }] : undefined;
    } else {
      message = `Database constraint error: Code ${err.code}`;
    }
  }

  if (process.env.NODE_ENV !== 'production' && statusCode === 500) {
    console.error('💥 SERVER EXCEPTION:', err);
  }

  res.status(statusCode).json(
    ApiResponse.error(message, errors)
  );
}

export function handleNotFound(req: Request, res: Response, next: NextFunction) {
  next(new AppError(`Requested terminal route [${req.method}] ${req.originalUrl} does not exist.`, 404));
}
