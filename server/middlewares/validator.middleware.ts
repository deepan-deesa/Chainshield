import { Request, Response, NextFunction } from 'express';
import { Schema } from 'zod';

export function validateBody(schema: Schema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (err) {
      next(err);
    }
  };
}

export function validateQuery(schema: Schema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = await schema.parseAsync(req.query) as any;
      next();
    } catch (err) {
      next(err);
    }
  };
}

export function validateParams(schema: Schema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.params = await schema.parseAsync(req.params) as any;
      next();
    } catch (err) {
      next(err);
    }
  };
}
