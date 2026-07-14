import { 
  IOfficerRepository, 
  ICaseRepository, 
  IEvidenceRepository, 
  ICustodyLogRepository, 
  INotificationRepository, 
  IReportRepository, 
  ISystemLogRepository,
  IBlockRepository
} from '../interfaces';
import { 
  OfficerDTO, 
  CaseDTO, 
  EvidenceDTO, 
  CustodyLogDTO, 
  SystemNotificationDTO, 
  ReportDTO, 
  SystemLogDTO,
  BlockDTO
} from '../../types';
import { getPrisma } from '../../database/client';
import { generateId, generateTxHash } from '../../utils';

// Helper: Map DB Case model to CaseDTO
function mapCaseToDTO(c: any): CaseDTO {
  return {
    id: c.id,
    title: c.title,
    description: c.description,
    status: c.status,
    priority: c.priority,
    assignedOfficer: c.officerName,
    badgeNumber: c.badgeNumber,
    department: c.officer?.department || 'Federal Forensics Division',
    createdAt: c.createdAt.toISOString(),
    evidenceIds: c.evidence ? c.evidence.map((e: any) => e.id) : []
  };
}

// Helper: Map DB Evidence model with metadata relation to EvidenceDTO
function mapEvidenceToDTO(e: any): EvidenceDTO {
  const metadataObj: Record<string, string> = {};
  if (e.metadata) {
    e.metadata.forEach((m: any) => {
      metadataObj[m.key] = m.value;
    });
  }
  return {
    id: e.id,
    caseId: e.caseId,
    name: e.name,
    type: e.type,
    size: e.size,
    sha256: e.sha256,
    uploadedAt: e.uploadDate.toISOString(),
    uploadedBy: e.officerName,
    badgeNumber: e.badgeNumber,
    status: e.status,
    fileUrl: e.fileUrl,
    blockNumber: e.blockNumber,
    txHash: e.txHash,
    metadata: metadataObj
  };
}

// Helper: Map DB Custody Log model to CustodyLogDTO
function mapCustodyLogToDTO(l: any): CustodyLogDTO {
  return {
    id: l.id,
    evidenceId: l.evidenceId,
    timestamp: l.timestamp.toISOString(),
    officer: l.officer,
    badgeNumber: l.badgeNumber,
    action: l.action,
    location: l.location,
    status: l.status,
    blockNumber: l.blockNumber,
    txHash: l.txHash,
    details: l.details
  };
}

// 1. Prisma Officer Repository
export class PrismaOfficerRepository implements IOfficerRepository {
  async findById(id: string): Promise<OfficerDTO | null> {
    const o = await getPrisma().officer.findUnique({ where: { id } });
    if (!o) return null;
    return {
      id: o.id,
      badgeNumber: o.badgeNumber,
      name: o.name,
      email: o.email,
      role: o.role as any,
      nodeCount: o.nodeCount,
      createdAt: o.createdAt.toISOString()
    };
  }

  async findByBadgeNumber(badgeNumber: string): Promise<OfficerDTO | null> {
    const o = await getPrisma().officer.findUnique({ where: { badgeNumber } });
    if (!o) return null;
    return {
      id: o.id,
      badgeNumber: o.badgeNumber,
      name: o.name,
      email: o.email,
      role: o.role as any,
      nodeCount: o.nodeCount,
      createdAt: o.createdAt.toISOString()
    };
  }

  async findByEmail(email: string): Promise<OfficerDTO | null> {
    const o = await getPrisma().officer.findUnique({ where: { email } });
    if (!o) return null;
    return {
      id: o.id,
      badgeNumber: o.badgeNumber,
      name: o.name,
      email: o.email,
      role: o.role as any,
      nodeCount: o.nodeCount,
      createdAt: o.createdAt.toISOString()
    };
  }

  async getPasswordHashByBadge(badgeNumber: string): Promise<string | null> {
    const o = await getPrisma().officer.findUnique({
      where: { badgeNumber },
      select: { passwordHash: true }
    });
    return o ? o.passwordHash : null;
  }

  async create(data: any): Promise<OfficerDTO> {
    const o = await getPrisma().officer.create({
      data: {
        id: data.id || generateId('USR'),
        badgeNumber: data.badgeNumber,
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
        role: data.role || 'INVESTIGATING_OFFICER',
        nodeCount: data.nodeCount || 8
      }
    });
    return {
      id: o.id,
      badgeNumber: o.badgeNumber,
      name: o.name,
      email: o.email,
      role: o.role as any,
      nodeCount: o.nodeCount,
      createdAt: o.createdAt.toISOString()
    };
  }

  async update(id: string, data: any): Promise<OfficerDTO> {
    const o = await getPrisma().officer.update({
      where: { id },
      data: {
        badgeNumber: data.badgeNumber,
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
        role: data.role,
        nodeCount: data.nodeCount
      }
    });
    return {
      id: o.id,
      badgeNumber: o.badgeNumber,
      name: o.name,
      email: o.email,
      role: o.role as any,
      nodeCount: o.nodeCount,
      createdAt: o.createdAt.toISOString()
    };
  }
}

// 2. Prisma Case Repository
export class PrismaCaseRepository implements ICaseRepository {
  async findById(id: string): Promise<CaseDTO | null> {
    const c = await getPrisma().case.findUnique({
      where: { id },
      include: {
        officer: true,
        evidence: { select: { id: true } }
      }
    });
    if (!c) return null;
    return mapCaseToDTO(c);
  }

  async findAll(options?: { search?: string; status?: string; priority?: string; limit?: number; offset?: number }): Promise<CaseDTO[]> {
    const where: any = {};
    if (options?.status) {
      where.status = options.status;
    }
    if (options?.priority) {
      where.priority = options.priority;
    }
    if (options?.search) {
      where.OR = [
        { id: { contains: options.search, mode: 'insensitive' } },
        { title: { contains: options.search, mode: 'insensitive' } },
        { description: { contains: options.search, mode: 'insensitive' } }
      ];
    }

    const items = await getPrisma().case.findMany({
      where,
      include: {
        officer: true,
        evidence: { select: { id: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: options?.limit || 10,
      skip: options?.offset || 0
    });

    return items.map(mapCaseToDTO);
  }

  async create(data: any): Promise<CaseDTO> {
    const id = data.id || generateId('CASE');
    
    // Look up assigned officer
    const officer = await getPrisma().officer.findUnique({
      where: { badgeNumber: data.badgeNumber }
    });

    const c = await getPrisma().case.create({
      data: {
        id,
        title: data.title,
        description: data.description,
        category: data.category || 'General',
        status: data.status || 'ACTIVE',
        priority: data.priority || 'MEDIUM',
        officerName: data.assignedOfficer || 'Unassigned',
        badgeNumber: data.badgeNumber || '',
        officer: officer ? { connect: { id: officer.id } } : undefined
      },
      include: {
        officer: true,
        evidence: { select: { id: true } }
      }
    });

    return mapCaseToDTO(c);
  }

  async update(id: string, data: any): Promise<CaseDTO> {
    let officerIdUpdate: any = undefined;
    if (data.badgeNumber) {
      const officer = await getPrisma().officer.findUnique({
        where: { badgeNumber: data.badgeNumber }
      });
      if (officer) {
        officerIdUpdate = officer.id;
      }
    }

    const c = await getPrisma().case.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        category: data.category,
        officerName: data.assignedOfficer,
        badgeNumber: data.badgeNumber,
        officer: officerIdUpdate ? { connect: { id: officerIdUpdate } } : undefined
      },
      include: {
        officer: true,
        evidence: { select: { id: true } }
      }
    });

    return mapCaseToDTO(c);
  }

  async delete(id: string): Promise<boolean> {
    await getPrisma().case.delete({ where: { id } });
    return true;
  }

  async count(options?: { search?: string; status?: string; priority?: string }): Promise<number> {
    const where: any = {};
    if (options?.status) {
      where.status = options.status;
    }
    if (options?.priority) {
      where.priority = options.priority;
    }
    if (options?.search) {
      where.OR = [
        { id: { contains: options.search, mode: 'insensitive' } },
        { title: { contains: options.search, mode: 'insensitive' } },
        { description: { contains: options.search, mode: 'insensitive' } }
      ];
    }
    return getPrisma().case.count({ where });
  }
}

// 3. Prisma Evidence Repository
export class PrismaEvidenceRepository implements IEvidenceRepository {
  async findById(id: string): Promise<EvidenceDTO | null> {
    const e = await getPrisma().evidence.findUnique({
      where: { id },
      include: { metadata: true }
    });
    if (!e) return null;
    return mapEvidenceToDTO(e);
  }

  async findBySha256(sha256: string): Promise<EvidenceDTO | null> {
    const e = await getPrisma().evidence.findUnique({
      where: { sha256 },
      include: { metadata: true }
    });
    if (!e) return null;
    return mapEvidenceToDTO(e);
  }

  async findAll(options?: { caseId?: string; search?: string; type?: string; status?: string; limit?: number; offset?: number }): Promise<EvidenceDTO[]> {
    const where: any = {};
    if (options?.caseId) {
      where.caseId = options.caseId;
    }
    if (options?.type) {
      where.type = options.type;
    }
    if (options?.status) {
      where.status = options.status;
    }
    if (options?.search) {
      where.OR = [
        { id: { contains: options.search, mode: 'insensitive' } },
        { name: { contains: options.search, mode: 'insensitive' } }
      ];
    }

    const items = await getPrisma().evidence.findMany({
      where,
      include: { metadata: true },
      orderBy: { uploadDate: 'desc' },
      take: options?.limit || 10,
      skip: options?.offset || 0
    });

    return items.map(mapEvidenceToDTO);
  }

  async create(data: any, metadata: Record<string, string> = {}): Promise<EvidenceDTO> {
    const id = data.id || generateId('EVID');
    
    const officer = await getPrisma().officer.findUnique({
      where: { badgeNumber: data.badgeNumber }
    });

    const metadataArray = Object.entries(metadata).map(([key, value]) => ({
      key,
      value
    }));

    const e = await getPrisma().$transaction(async (tx) => {
      const createdEvidence = await tx.evidence.create({
        data: {
          id,
          caseId: data.caseId,
          name: data.name,
          type: data.type || 'DOCUMENT',
          size: data.size,
          sha256: data.sha256,
          status: data.status || 'SECURED',
          fileUrl: data.fileUrl || null,
          blockNumber: data.blockNumber || null,
          txHash: data.txHash || null,
          officerId: officer?.id || null,
          officerName: data.uploadedBy || 'Investigator',
          badgeNumber: data.badgeNumber,
          metadata: {
            create: metadataArray
          }
        },
        include: { metadata: true }
      });

      return createdEvidence;
    });

    return mapEvidenceToDTO(e);
  }

  async update(id: string, data: any, metadata?: Record<string, string>): Promise<EvidenceDTO> {
    const e = await getPrisma().$transaction(async (tx) => {
      // 1. Update basic evidence details
      const updatedEvidence = await tx.evidence.update({
        where: { id },
        data: {
          name: data.name,
          status: data.status,
          fileUrl: data.fileUrl,
          blockNumber: data.blockNumber,
          txHash: data.txHash
        },
        include: { metadata: true }
      });

      // 2. Perform metadata upsert if supplied
      if (metadata) {
        // Delete original and re-create to keep sync pristine
        await tx.evidenceMetadata.deleteMany({
          where: { evidenceId: id }
        });

        await tx.evidenceMetadata.createMany({
          data: Object.entries(metadata).map(([key, value]) => ({
            evidenceId: id,
            key,
            value
          }))
        });
      }

      return tx.evidence.findUnique({
        where: { id },
        include: { metadata: true }
      });
    });

    return mapEvidenceToDTO(e);
  }

  async delete(id: string): Promise<boolean> {
    await getPrisma().evidence.delete({ where: { id } });
    return true;
  }

  async count(options?: { caseId?: string; search?: string; type?: string; status?: string }): Promise<number> {
    const where: any = {};
    if (options?.caseId) {
      where.caseId = options.caseId;
    }
    if (options?.type) {
      where.type = options.type;
    }
    if (options?.status) {
      where.status = options.status;
    }
    if (options?.search) {
      where.OR = [
        { id: { contains: options.search, mode: 'insensitive' } },
        { name: { contains: options.search, mode: 'insensitive' } }
      ];
    }
    return getPrisma().evidence.count({ where });
  }
}

// 4. Prisma Custody Log Repository
export class PrismaCustodyLogRepository implements ICustodyLogRepository {
  async create(data: any): Promise<CustodyLogDTO> {
    const id = data.id || generateId('LOG');
    
    const officerObj = await getPrisma().officer.findUnique({
      where: { badgeNumber: data.badgeNumber }
    });

    const l = await getPrisma().chainOfCustodyLog.create({
      data: {
        id,
        evidenceId: data.evidenceId,
        action: data.action,
        officer: data.officer,
        badgeNumber: data.badgeNumber,
        location: data.location,
        details: data.details,
        status: data.status || 'VERIFIED',
        blockNumber: data.blockNumber || null,
        txHash: data.txHash || null,
        officerId: officerObj?.id || null
      }
    });

    return mapCustodyLogToDTO(l);
  }

  async findByEvidenceId(evidenceId: string): Promise<CustodyLogDTO[]> {
    const items = await getPrisma().chainOfCustodyLog.findMany({
      where: { evidenceId },
      orderBy: { timestamp: 'desc' }
    });
    return items.map(mapCustodyLogToDTO);
  }

  async findByOfficerBadge(badgeNumber: string): Promise<CustodyLogDTO[]> {
    const items = await getPrisma().chainOfCustodyLog.findMany({
      where: { badgeNumber },
      orderBy: { timestamp: 'desc' }
    });
    return items.map(mapCustodyLogToDTO);
  }

  async findAll(options?: { limit?: number; offset?: number }): Promise<CustodyLogDTO[]> {
    const items = await getPrisma().chainOfCustodyLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: options?.limit || 20,
      skip: options?.offset || 0
    });
    return items.map(mapCustodyLogToDTO);
  }
}

// 5. Prisma Notification Repository
export class PrismaNotificationRepository implements INotificationRepository {
  async findAll(options?: { limit?: number; offset?: number }): Promise<SystemNotificationDTO[]> {
    const items = await getPrisma().notification.findMany({
      orderBy: { timestamp: 'desc' },
      take: options?.limit || 50,
      skip: options?.offset || 0
    });
    return items.map(n => ({
      id: n.id,
      type: n.type as any,
      title: n.title,
      message: n.message,
      timestamp: n.timestamp.toISOString(),
      read: n.read,
      blockNumber: n.blockNumber
    }));
  }

  async create(data: any): Promise<SystemNotificationDTO> {
    const n = await getPrisma().notification.create({
      data: {
        id: data.id || generateId('NOT'),
        type: data.type || 'INFO',
        title: data.title,
        message: data.message,
        blockNumber: data.blockNumber || null
      }
    });
    return {
      id: n.id,
      type: n.type as any,
      title: n.title,
      message: n.message,
      timestamp: n.timestamp.toISOString(),
      read: n.read,
      blockNumber: n.blockNumber
    };
  }

  async markAsRead(id: string): Promise<SystemNotificationDTO | null> {
    const n = await getPrisma().notification.update({
      where: { id },
      data: { read: true }
    });
    return {
      id: n.id,
      type: n.type as any,
      title: n.title,
      message: n.message,
      timestamp: n.timestamp.toISOString(),
      read: n.read,
      blockNumber: n.blockNumber
    };
  }

  async markAllAsRead(): Promise<boolean> {
    await getPrisma().notification.updateMany({
      data: { read: true }
    });
    return true;
  }

  async clearAll(): Promise<boolean> {
    await getPrisma().notification.deleteMany();
    return true;
  }
}

// 6. Prisma Report Repository
export class PrismaReportRepository implements IReportRepository {
  async create(data: any): Promise<ReportDTO> {
    const id = data.id || generateId('REP');
    
    const officer = await getPrisma().officer.findUnique({
      where: { badgeNumber: data.badgeNumber }
    });

    const r = await getPrisma().report.create({
      data: {
        id,
        type: data.type,
        title: data.title,
        content: data.content,
        author: data.author,
        badgeNumber: data.badgeNumber,
        officerId: officer?.id || null
      }
    });

    return {
      id: r.id,
      type: r.type as any,
      title: r.title,
      content: r.content,
      author: r.author,
      badgeNumber: r.badgeNumber,
      createdAt: r.createdAt.toISOString()
    };
  }

  async findAll(options?: { limit?: number; offset?: number }): Promise<ReportDTO[]> {
    const items = await getPrisma().report.findMany({
      orderBy: { createdAt: 'desc' },
      take: options?.limit || 15,
      skip: options?.offset || 0
    });
    return items.map(r => ({
      id: r.id,
      type: r.type as any,
      title: r.title,
      content: r.content,
      author: r.author,
      badgeNumber: r.badgeNumber,
      createdAt: r.createdAt.toISOString()
    }));
  }

  async findById(id: string): Promise<ReportDTO | null> {
    const r = await getPrisma().report.findUnique({ where: { id } });
    if (!r) return null;
    return {
      id: r.id,
      type: r.type as any,
      title: r.title,
      content: r.content,
      author: r.author,
      badgeNumber: r.badgeNumber,
      createdAt: r.createdAt.toISOString()
    };
  }
}

// 7. Prisma System Log Repository
export class PrismaSystemLogRepository implements ISystemLogRepository {
  async create(data: any): Promise<SystemLogDTO> {
    const l = await getPrisma().systemLog.create({
      data: {
        level: data.level || 'INFO',
        message: data.message,
        meta: data.meta || null
      }
    });
    return {
      id: l.id,
      level: l.level as any,
      message: l.message,
      timestamp: l.timestamp.toISOString(),
      meta: l.meta
    };
  }

  async findAll(options?: { limit?: number; offset?: number }): Promise<SystemLogDTO[]> {
    const items = await getPrisma().systemLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: options?.limit || 50,
      skip: options?.offset || 0
    });
    return items.map(l => ({
      id: l.id,
      level: l.level as any,
      message: l.message,
      timestamp: l.timestamp.toISOString(),
      meta: l.meta
    }));
  }
}

// 8. Prisma Block Repository
export class PrismaBlockRepository implements IBlockRepository {
  async create(block: BlockDTO): Promise<BlockDTO> {
    try {
      const p = getPrisma();
      const created = await (p as any).block.create({
        data: {
          blockNumber: block.blockNumber,
          previousHash: block.previousHash,
          currentHash: block.currentHash,
          fileHash: block.fileHash,
          caseId: block.caseId,
          evidenceId: block.evidenceId,
          officerId: block.officerId,
          timestamp: new Date(block.timestamp),
          nonce: block.nonce,
          status: block.status
        }
      });
      return {
        ...block,
        timestamp: created.timestamp.toISOString()
      };
    } catch (e) {
      return block;
    }
  }

  async findAll(options?: { limit?: number; offset?: number; search?: string }): Promise<BlockDTO[]> {
    try {
      const p = getPrisma();
      const where: any = {};
      if (options?.search) {
        where.OR = [
          { fileHash: { contains: options.search, mode: 'insensitive' } },
          { caseId: { contains: options.search, mode: 'insensitive' } },
          { evidenceId: { contains: options.search, mode: 'insensitive' } }
        ];
      }
      const items = await (p as any).block.findMany({
        where,
        orderBy: { blockNumber: 'desc' },
        take: options?.limit || 100,
        skip: options?.offset || 0
      });
      return items.map((item: any) => ({
        blockNumber: item.blockNumber,
        previousHash: item.previousHash,
        currentHash: item.currentHash,
        fileHash: item.fileHash,
        caseId: item.caseId,
        evidenceId: item.evidenceId,
        officerId: item.officerId,
        timestamp: item.timestamp.toISOString(),
        nonce: item.nonce,
        status: item.status
      }));
    } catch (e) {
      return [];
    }
  }

  async findLatest(): Promise<BlockDTO | null> {
    try {
      const p = getPrisma();
      const latest = await (p as any).block.findFirst({
        orderBy: { blockNumber: 'desc' }
      });
      if (!latest) return null;
      return {
        blockNumber: latest.blockNumber,
        previousHash: latest.previousHash,
        currentHash: latest.currentHash,
        fileHash: latest.fileHash,
        caseId: latest.caseId,
        evidenceId: latest.evidenceId,
        officerId: latest.officerId,
        timestamp: latest.timestamp.toISOString(),
        nonce: latest.nonce,
        status: latest.status
      };
    } catch (e) {
      return null;
    }
  }

  async count(options?: { search?: string }): Promise<number> {
    try {
      const p = getPrisma();
      const where: any = {};
      if (options?.search) {
        where.OR = [
          { fileHash: { contains: options.search, mode: 'insensitive' } },
          { caseId: { contains: options.search, mode: 'insensitive' } },
          { evidenceId: { contains: options.search, mode: 'insensitive' } }
        ];
      }
      return await (p as any).block.count({ where });
    } catch (e) {
      return 0;
    }
  }

  async clearAll(): Promise<boolean> {
    try {
      const p = getPrisma();
      await (p as any).block.deleteMany();
      return true;
    } catch (e) {
      return false;
    }
  }
}
