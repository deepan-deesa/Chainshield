import { isDatabaseConnected } from '../database/client';
import { isSupabaseConnected } from '../database/supabase';
import { 
  IOfficerRepository, 
  ICaseRepository, 
  IEvidenceRepository, 
  ICustodyLogRepository, 
  INotificationRepository, 
  IReportRepository, 
  ISystemLogRepository,
  IBlockRepository
} from './interfaces';

import { 
  InMemoryOfficerRepository, 
  InMemoryCaseRepository, 
  InMemoryEvidenceRepository, 
  InMemoryCustodyLogRepository, 
  InMemoryNotificationRepository, 
  InMemoryReportRepository, 
  InMemorySystemLogRepository,
  InMemoryBlockRepository
} from './in-memory';

import { 
  PrismaOfficerRepository, 
  PrismaCaseRepository, 
  PrismaEvidenceRepository, 
  PrismaCustodyLogRepository, 
  PrismaNotificationRepository, 
  PrismaReportRepository, 
  PrismaSystemLogRepository,
  PrismaBlockRepository
} from './prisma';

import {
  SupabaseOfficerRepository,
  SupabaseCaseRepository,
  SupabaseEvidenceRepository,
  SupabaseCustodyLogRepository,
  SupabaseNotificationRepository,
  SupabaseReportRepository,
  SupabaseSystemLogRepository,
  SupabaseBlockRepository
} from './supabase';

// Cached repositories
let officerRepository: IOfficerRepository | null = null;
let caseRepository: ICaseRepository | null = null;
let evidenceRepository: IEvidenceRepository | null = null;
let custodyLogRepository: ICustodyLogRepository | null = null;
let notificationRepository: INotificationRepository | null = null;
let reportRepository: IReportRepository | null = null;
let systemLogRepository: ISystemLogRepository | null = null;
let blockRepository: IBlockRepository | null = null;

export const RepositoryFactory = {
  getOfficerRepository(): IOfficerRepository {
    if (!officerRepository) {
      if (isSupabaseConnected()) {
        officerRepository = new SupabaseOfficerRepository();
      } else if (isDatabaseConnected()) {
        officerRepository = new PrismaOfficerRepository();
      } else {
        officerRepository = new InMemoryOfficerRepository();
      }
    }
    return officerRepository;
  },

  getCaseRepository(): ICaseRepository {
    if (!caseRepository) {
      if (isSupabaseConnected()) {
        caseRepository = new SupabaseCaseRepository();
      } else if (isDatabaseConnected()) {
        caseRepository = new PrismaCaseRepository();
      } else {
        caseRepository = new InMemoryCaseRepository();
      }
    }
    return caseRepository;
  },

  getEvidenceRepository(): IEvidenceRepository {
    if (!evidenceRepository) {
      if (isSupabaseConnected()) {
        evidenceRepository = new SupabaseEvidenceRepository();
      } else if (isDatabaseConnected()) {
        evidenceRepository = new PrismaEvidenceRepository();
      } else {
        evidenceRepository = new InMemoryEvidenceRepository();
      }
    }
    return evidenceRepository;
  },

  getCustodyLogRepository(): ICustodyLogRepository {
    if (!custodyLogRepository) {
      if (isSupabaseConnected()) {
        custodyLogRepository = new SupabaseCustodyLogRepository();
      } else if (isDatabaseConnected()) {
        custodyLogRepository = new PrismaCustodyLogRepository();
      } else {
        custodyLogRepository = new InMemoryCustodyLogRepository();
      }
    }
    return custodyLogRepository;
  },

  getNotificationRepository(): INotificationRepository {
    if (!notificationRepository) {
      if (isSupabaseConnected()) {
        notificationRepository = new SupabaseNotificationRepository();
      } else if (isDatabaseConnected()) {
        notificationRepository = new PrismaNotificationRepository();
      } else {
        notificationRepository = new InMemoryNotificationRepository();
      }
    }
    return notificationRepository;
  },

  getReportRepository(): IReportRepository {
    if (!reportRepository) {
      if (isSupabaseConnected()) {
        reportRepository = new SupabaseReportRepository();
      } else if (isDatabaseConnected()) {
        reportRepository = new PrismaReportRepository();
      } else {
        reportRepository = new InMemoryReportRepository();
      }
    }
    return reportRepository;
  },

  getSystemLogRepository(): ISystemLogRepository {
    if (!systemLogRepository) {
      if (isSupabaseConnected()) {
        systemLogRepository = new SupabaseSystemLogRepository();
      } else if (isDatabaseConnected()) {
        systemLogRepository = new PrismaSystemLogRepository();
      } else {
        systemLogRepository = new InMemorySystemLogRepository();
      }
    }
    return systemLogRepository;
  },

  getBlockRepository(): IBlockRepository {
    if (!blockRepository) {
      if (isSupabaseConnected()) {
        blockRepository = new SupabaseBlockRepository();
      } else if (isDatabaseConnected()) {
        blockRepository = new PrismaBlockRepository();
      } else {
        blockRepository = new InMemoryBlockRepository();
      }
    }
    return blockRepository;
  },

  // Invalidate cache to force a re-evaluation if connection status changes
  resetCache() {
    officerRepository = null;
    caseRepository = null;
    evidenceRepository = null;
    custodyLogRepository = null;
    notificationRepository = null;
    reportRepository = null;
    systemLogRepository = null;
    blockRepository = null;
  }
};
