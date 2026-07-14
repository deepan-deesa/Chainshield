import { Response, NextFunction } from 'express';
import { BlockchainService } from '../services/blockchain.service';
import { ApiResponse } from '../utils';
import { AuthenticatedRequest } from '../types';

const blockchainService = new BlockchainService();

export class BlockchainController {
  // Query/List all blocks (Blockchain Explorer)
  async getBlocks(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 15;
      const search = req.query.search ? (req.query.search as string) : undefined;

      const result = await blockchainService.listBlocks({ page, limit, search });
      res.status(200).json(ApiResponse.success(result, 'Blockchain blocks successfully retrieved'));
    } catch (err) {
      next(err);
    }
  }

  // Trigger Chain Validation (Health/Integrity Check)
  async validateChain(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const auditResult = await blockchainService.validateChain();
      res.status(200).json(ApiResponse.success(auditResult, 'Consensus audit trail completed'));
    } catch (err) {
      next(err);
    }
  }
}

export const blockchainController = new BlockchainController();
