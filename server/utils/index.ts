import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import { JWTPayload } from '../types';

// Custom Application Error
export class AppError extends Error {
  public statusCode: number;
  public errors?: any[];

  constructor(message: string, statusCode: number = 500, errors?: any[]) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Password Hashing Utility
export const PasswordUtil = {
  hash: async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  },
  
  compare: async (password: string, hash: string): Promise<boolean> => {
    return bcrypt.compare(password, hash);
  }
};

// Token Management Utility
export const TokenUtil = {
  generateAccessToken: (payload: JWTPayload): string => {
    return jwt.sign(payload, config.jwtSecret, { expiresIn: '1h' });
  },

  generateRefreshToken: (payload: JWTPayload): string => {
    return jwt.sign(payload, config.jwtRefreshSecret, { expiresIn: '7d' });
  },

  verifyAccessToken: (token: string): JWTPayload => {
    try {
      return jwt.verify(token, config.jwtSecret) as JWTPayload;
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        throw new AppError('Access token has expired', 401);
      }
      throw new AppError('Invalid access token', 401);
    }
  },

  verifyRefreshToken: (token: string): JWTPayload => {
    try {
      return jwt.verify(token, config.jwtRefreshSecret) as JWTPayload;
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        throw new AppError('Refresh token has expired', 401);
      }
      throw new AppError('Invalid refresh token', 401);
    }
  }
};

// Standard API Response utility
export const ApiResponse = {
  success: <T>(data: T, message: string = 'Operation successful') => {
    return {
      success: true,
      message,
      data
    };
  },

  error: (message: string, errors?: any[]) => {
    return {
      success: false,
      message,
      ...(errors && { errors })
    };
  }
};

// Generate Hex and Crypto helpers
export const generateId = (prefix: string = ''): string => {
  const uuid = uuidv4().replace(/-/g, '').substring(0, 12).toUpperCase();
  return prefix ? `${prefix}-${uuid}` : uuid;
};

export const generateTxHash = (): string => {
  return '0x' + Array.from({ length: 64 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
};

import crypto from 'crypto';

export const calculateSHA256 = (buffer: Buffer): string => {
  return crypto.createHash('sha256').update(buffer).digest('hex');
};
