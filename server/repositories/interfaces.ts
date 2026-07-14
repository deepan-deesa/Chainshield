import { 
  OfficerDTO, 
  CaseDTO, 
  EvidenceDTO, 
  CustodyLogDTO, 
  SystemNotificationDTO, 
  ReportDTO, 
  SystemLogDTO,
  BlockDTO
} from '../types';

export interface IOfficerRepository {
  findById(id: string): Promise<OfficerDTO | null>;
  findByBadgeNumber(badgeNumber: string): Promise<OfficerDTO | null>;
  findByEmail(email: string): Promise<OfficerDTO | null>;
  getPasswordHashByBadge(badgeNumber: string): Promise<string | null>;
  create(data: any): Promise<OfficerDTO>;
  update(id: string, data: any): Promise<OfficerDTO>;
}

export interface ICaseRepository {
  findById(id: string): Promise<CaseDTO | null>;
  findAll(options?: { search?: string; status?: string; priority?: string; limit?: number; offset?: number }): Promise<CaseDTO[]>;
  create(data: any): Promise<CaseDTO>;
  update(id: string, data: any): Promise<CaseDTO>;
  delete(id: string): Promise<boolean>;
  count(options?: { search?: string; status?: string; priority?: string }): Promise<number>;
}

export interface IEvidenceRepository {
  findById(id: string): Promise<EvidenceDTO | null>;
  findBySha256(sha256: string): Promise<EvidenceDTO | null>;
  findAll(options?: { caseId?: string; search?: string; type?: string; status?: string; limit?: number; offset?: number }): Promise<EvidenceDTO[]>;
  create(data: any, metadata?: Record<string, string>): Promise<EvidenceDTO>;
  update(id: string, data: any, metadata?: Record<string, string>): Promise<EvidenceDTO>;
  delete(id: string): Promise<boolean>;
  count(options?: { caseId?: string; search?: string; type?: string; status?: string }): Promise<number>;
}

export interface ICustodyLogRepository {
  create(data: any): Promise<CustodyLogDTO>;
  findByEvidenceId(evidenceId: string): Promise<CustodyLogDTO[]>;
  findByOfficerBadge(badgeNumber: string): Promise<CustodyLogDTO[]>;
  findAll(options?: { limit?: number; offset?: number }): Promise<CustodyLogDTO[]>;
}

export interface INotificationRepository {
  findAll(options?: { limit?: number; offset?: number }): Promise<SystemNotificationDTO[]>;
  create(data: any): Promise<SystemNotificationDTO>;
  markAsRead(id: string): Promise<SystemNotificationDTO | null>;
  markAllAsRead(): Promise<boolean>;
  clearAll(): Promise<boolean>;
}

export interface IReportRepository {
  create(data: any): Promise<ReportDTO>;
  findAll(options?: { limit?: number; offset?: number }): Promise<ReportDTO[]>;
  findById(id: string): Promise<ReportDTO | null>;
}

export interface ISystemLogRepository {
  create(data: any): Promise<SystemLogDTO>;
  findAll(options?: { limit?: number; offset?: number }): Promise<SystemLogDTO[]>;
}

export interface IBlockRepository {
  create(block: BlockDTO): Promise<BlockDTO>;
  findAll(options?: { limit?: number; offset?: number; search?: string }): Promise<BlockDTO[]>;
  findLatest(): Promise<BlockDTO | null>;
  count(options?: { search?: string }): Promise<number>;
  clearAll(): Promise<boolean>;
}
