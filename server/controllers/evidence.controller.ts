import { Response, NextFunction } from 'express';
import { EvidenceService } from '../services/evidence.service';
import { ApiResponse, AppError, calculateSHA256 } from '../utils';
import { AuthenticatedRequest } from '../types';

const evidenceService = new EvidenceService();

export class EvidenceController {
  async ingest(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(412).json(ApiResponse.error('Precondition Failed: Investigator identity context missing'));
      }

      // If a physical file was uploaded via Multer, capture metadata and calculate real SHA-256 hash
      let fileData = { ...req.body };
      if (req.file) {
        const fileHash = calculateSHA256(req.file.buffer);
        fileData = {
          ...fileData,
          sha256: fileHash,
          name: req.file.originalname,
          size: req.file.size,
          // Extract extension
          metadata: {
            ...fileData.metadata,
            fileExtension: req.file.originalname.split('.').pop() || '',
            originalMimetype: req.file.mimetype
          }
        };
      }

      const result = await evidenceService.ingestEvidence(fileData, req.user);
      res.status(201).json(ApiResponse.success(result, 'Evidence file signature successfully ingested and anchored'));
    } catch (err) {
      next(err);
    }
  }

  async getDetails(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await evidenceService.getEvidenceDetails(id, req.user);
      res.status(200).json(ApiResponse.success(result, 'Evidence details retrieved successfully'));
    } catch (err) {
      next(err);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await evidenceService.updateEvidenceMetadata(id, req.body, req.body.metadata);
      res.status(200).json(ApiResponse.success(result, 'Evidence record updated successfully'));
    } catch (err) {
      next(err);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!req.user) {
        return res.status(412).json(ApiResponse.error('Precondition Failed: Investigator identity context missing'));
      }
      await evidenceService.deleteEvidence(id, req.user);
      res.status(200).json(ApiResponse.success(true, 'Evidence record purged from active vault'));
    } catch (err) {
      next(err);
    }
  }

  async verify(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      let sha256 = req.body.sha256;

      if (req.file) {
        sha256 = calculateSHA256(req.file.buffer);
      }

      if (!sha256) {
        throw new AppError('Cryptographic checksum string [sha256] or physical file upload is required', 400);
      }

      const result = await evidenceService.verifyEvidenceHash(id, sha256);
      res.status(200).json(ApiResponse.success(result, 'Cryptographic chain verification routine executed'));
    } catch (err) {
      next(err);
    }
  }

  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { caseId, search, type, status, page, limit } = req.query;
      const result = await evidenceService.listEvidence({
        caseId: caseId as string,
        search: search as string,
        type: type as string,
        status: status as string,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 10
      });
      res.status(200).json(ApiResponse.success(result, 'Evidence catalog retrieved successfully'));
    } catch (err) {
      next(err);
    }
  }
}
export const evidenceController = new EvidenceController();
