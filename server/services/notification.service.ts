import { RepositoryFactory } from '../repositories/factory';
import { SystemNotificationDTO } from '../types';

export class NotificationService {
  private get repo() {
    return RepositoryFactory.getNotificationRepository();
  }

  async listNotifications(options?: { page?: number; limit?: number }): Promise<{ items: SystemNotificationDTO[]; page: number; limit: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 50;
    const offset = (page - 1) * limit;

    const items = await this.repo.findAll({ limit, offset });
    return {
      items,
      page,
      limit
    };
  }

  async createNotification(type: 'SUCCESS' | 'ERROR' | 'WARNING' | 'INFO', title: string, message: string, blockNumber?: number): Promise<SystemNotificationDTO> {
    return this.repo.create({
      type,
      title,
      message,
      blockNumber
    });
  }

  async markAsRead(id: string): Promise<SystemNotificationDTO | null> {
    return this.repo.markAsRead(id);
  }

  async markAllRead(): Promise<boolean> {
    return this.repo.markAllAsRead();
  }

  async clearAll(): Promise<boolean> {
    return this.repo.clearAll();
  }
}
