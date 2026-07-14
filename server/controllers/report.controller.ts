import { Response, NextFunction } from 'express';
import { ReportService } from '../services/report.service';
import { ApiResponse } from '../utils';
import { AuthenticatedRequest } from '../types';

const reportService = new ReportService();

export class ReportController {
  async generateCaseReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { caseId } = req.params;
      if (!req.user) {
        return res.status(412).json(ApiResponse.error('Precondition Failed: Investigator identity missing'));
      }
      const result = await reportService.generateCaseReport(caseId, req.user);
      res.status(201).json(ApiResponse.success(result, 'Docket audit report compiled successfully'));
    } catch (err) {
      next(err);
    }
  }

  async generateEvidenceReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { evidenceId } = req.params;
      if (!req.user) {
        return res.status(412).json(ApiResponse.error('Precondition Failed: Investigator identity missing'));
      }
      const result = await reportService.generateEvidenceReport(evidenceId, req.user);
      res.status(201).json(ApiResponse.success(result, 'Chain-of-custody certificate compiled successfully'));
    } catch (err) {
      next(err);
    }
  }

  async generateBlockchainReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(412).json(ApiResponse.error('Precondition Failed: Investigator identity missing'));
      }
      const result = await reportService.generateBlockchainConsensusReport(req.user);
      res.status(201).json(ApiResponse.success(result, 'Blockchain network consensus audit report compiled'));
    } catch (err) {
      next(err);
    }
  }

  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit } = req.query;
      const result = await reportService.listReports({
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 15
      });
      res.status(200).json(ApiResponse.success(result, 'Reports index retrieved successfully'));
    } catch (err) {
      next(err);
    }
  }
}
export const reportController = new ReportController();
