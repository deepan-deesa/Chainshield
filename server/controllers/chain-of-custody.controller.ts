import { Response, NextFunction } from 'express';
import { ChainOfCustodyService } from '../services/chain-of-custody.service';
import { ApiResponse } from '../utils';
import { AuthenticatedRequest } from '../types';

const custodyService = new ChainOfCustodyService();

export class ChainOfCustodyController {
  async addLog(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(412).json(ApiResponse.error('Precondition Failed: Investigator identity context missing'));
      }
      const result = await custodyService.addCustodyLog(req.body, req.user);
      res.status(201).json(ApiResponse.success(result, 'Chain-of-custody transaction registered'));
    } catch (err) {
      next(err);
    }
  }

  async getEvidenceTimeline(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { evidenceId } = req.params;
      const result = await custodyService.getTimelineByEvidenceId(evidenceId);
      res.status(200).json(ApiResponse.success(result, 'Evidence transaction history compiled'));
    } catch (err) {
      next(err);
    }
  }

  async getOfficerTimeline(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { badgeNumber } = req.params;
      const result = await custodyService.getTimelineByOfficer(badgeNumber);
      res.status(200).json(ApiResponse.success(result, 'Officer transaction ledger compiled'));
    } catch (err) {
      next(err);
    }
  }

  async listAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit } = req.query;
      const result = await custodyService.listAllLogs({
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20
      });
      res.status(200).json(ApiResponse.success(result, 'Global chain-of-custody logs retrieved'));
    } catch (err) {
      next(err);
    }
  }
}
export const chainOfCustodyController = new ChainOfCustodyController();
