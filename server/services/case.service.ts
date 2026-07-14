import { RepositoryFactory } from '../repositories/factory';
import { AppError, generateId } from '../utils';
import { CaseDTO } from '../types';

export class CaseService {
  private get repo() {
    return RepositoryFactory.getCaseRepository();
  }

  private get notificationRepo() {
    return RepositoryFactory.getNotificationRepository();
  }

  async createCase(data: any): Promise<CaseDTO> {
    const id = data.id || `CASE-2026-${Math.floor(1000 + Math.random() * 9000).toString()}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;
    
    const newCase = await this.repo.create({
      ...data,
      id
    });

    // Fire alert system notification
    await this.notificationRepo.create({
      type: 'INFO',
      title: 'Investigation Docket Initialized',
      message: `New case locker "${newCase.title}" [${newCase.id}] successfully partitioned and encrypted. Ready for forensic ingestion.`,
    });

    return newCase;
  }

  async getCaseDetails(id: string): Promise<CaseDTO> {
    const c = await this.repo.findById(id);
    if (!c) {
      throw new AppError(`Case docket ${id} not found in state vaults`, 404);
    }
    return c;
  }

  async updateCase(id: string, data: any): Promise<CaseDTO> {
    const original = await this.repo.findById(id);
    if (!original) {
      throw new AppError(`Case docket ${id} not found in state vaults`, 404);
    }

    const updated = await this.repo.update(id, data);

    // Fire alert system notification
    await this.notificationRepo.create({
      type: 'INFO',
      title: 'Investigation Docket Modified',
      message: `Case status for "${updated.title}" [${updated.id}] was updated to ${updated.status}. Security logs synchronized.`,
    });

    return updated;
  }

  async deleteCase(id: string): Promise<boolean> {
    const original = await this.repo.findById(id);
    if (!original) {
      throw new AppError(`Case docket ${id} not found in state vaults`, 404);
    }

    const success = await this.repo.delete(id);
    
    // Fire warning system notification
    await this.notificationRepo.create({
      type: 'WARNING',
      title: 'Case Docket Purged',
      message: `Case reference "${original.title}" [${id}] has been decommissioned and archived.`,
    });

    return success;
  }

  async listCases(options?: { search?: string; status?: string; priority?: string; page?: number; limit?: number }): Promise<{ items: CaseDTO[]; total: number; page: number; limit: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const offset = (page - 1) * limit;

    const items = await this.repo.findAll({
      search: options?.search,
      status: options?.status,
      priority: options?.priority,
      limit,
      offset
    });

    const total = await this.repo.count({
      search: options?.search,
      status: options?.status,
      priority: options?.priority
    });

    return {
      items,
      total,
      page,
      limit
    };
  }
}
