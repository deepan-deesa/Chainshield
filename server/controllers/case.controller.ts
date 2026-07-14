import { Response, NextFunction } from 'express';
import { CaseService } from '../services/case.service';
import { ApiResponse } from '../utils';
import { AuthenticatedRequest } from '../types';

const caseService = new CaseService();

export class CaseController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await caseService.createCase(req.body);
      res.status(201).json(ApiResponse.success(result, 'Investigation case docket initialized'));
    } catch (err) {
      next(err);
    }
  }

  async getDetails(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await caseService.getCaseDetails(id);
      res.status(200).json(ApiResponse.success(result, 'Case details retrieved successfully'));
    } catch (err) {
      next(err);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await caseService.updateCase(id, req.body);
      res.status(200).json(ApiResponse.success(result, 'Case docket updated successfully'));
    } catch (err) {
      next(err);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await caseService.deleteCase(id);
      res.status(200).json(ApiResponse.success(true, 'Case docket decommissioned successfully'));
    } catch (err) {
      next(err);
    }
  }

  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { search, status, priority, page, limit } = req.query;
      const result = await caseService.listCases({
        search: search as string,
        status: status as string,
        priority: priority as string,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 10
      });
      res.status(200).json(ApiResponse.success(result, 'Cases list retrieved successfully'));
    } catch (err) {
      next(err);
    }
  }
}
export const caseController = new CaseController();
