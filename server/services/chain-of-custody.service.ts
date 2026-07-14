import { RepositoryFactory } from '../repositories/factory';
import { AppError } from '../utils';
import { CustodyLogDTO } from '../types';

export class ChainOfCustodyService {
  private get repo() {
    return RepositoryFactory.getCustodyLogRepository();
  }

  private get evidenceRepo() {
    return RepositoryFactory.getEvidenceRepository();
  }

  async addCustodyLog(data: any, officerUser: any): Promise<CustodyLogDTO> {
    const evidenceItem = await this.evidenceRepo.findById(data.evidenceId);
    if (!evidenceItem) {
      throw new AppError(`Evidence record ${data.evidenceId} not found in state vaults`, 404);
    }

    const log = await this.repo.create({
      ...data,
      officer: officerUser.name,
      badgeNumber: officerUser.badgeNumber
    });

    return log;
  }

  async getTimelineByEvidenceId(evidenceId: string): Promise<CustodyLogDTO[]> {
    const evidenceItem = await this.evidenceRepo.findById(evidenceId);
    if (!evidenceItem) {
      throw new AppError(`Evidence record ${evidenceId} not found`, 404);
    }
    return this.repo.findByEvidenceId(evidenceId);
  }

  async getTimelineByOfficer(badgeNumber: string): Promise<CustodyLogDTO[]> {
    return this.repo.findByOfficerBadge(badgeNumber);
  }

  async listAllLogs(options?: { page?: number; limit?: number }): Promise<{ items: CustodyLogDTO[]; page: number; limit: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const offset = (page - 1) * limit;

    const items = await this.repo.findAll({
      limit,
      offset
    });

    return {
      items,
      page,
      limit
    };
  }
}
