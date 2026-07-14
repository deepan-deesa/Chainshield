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
  UserRole,
  BlockDTO
} from '../../types';
import { generateId, generateTxHash } from '../../utils';
import crypto from 'crypto';

// Global Memory State
const officers: Map<string, any> = new Map();
const cases: Map<string, CaseDTO> = new Map();
const evidence: Map<string, EvidenceDTO> = new Map();
const blocks: Map<number, BlockDTO> = new Map();
const custodyLogs: CustodyLogDTO[] = [];
const notifications: SystemNotificationDTO[] = [];
const reports: Map<string, ReportDTO> = new Map();
const systemLogs: SystemLogDTO[] = [];

// Seed Initial Data Helper
let seeded = false;
export function seedInMemoryDb() {
  if (seeded) return;
  seeded = true;

  // Helper to mine blocks sequentially for initial data validation
  const mineBlockLocal = (blockNumber: number, prevHash: string, fileHash: string, caseId: string, evidenceId: string): BlockDTO => {
    let nonce = 0;
    const block: BlockDTO = {
      blockNumber,
      previousHash: prevHash,
      currentHash: '',
      fileHash,
      caseId,
      evidenceId,
      officerId: 'usr-9941',
      timestamp: new Date().toISOString(),
      nonce: 0,
      status: 'STABLE'
    };
    while (true) {
      block.nonce = nonce;
      const content = `${block.blockNumber}${block.previousHash}${block.fileHash}${block.caseId}${block.evidenceId}${block.officerId}${block.timestamp}${block.nonce}`;
      const hash = crypto.createHash('sha256').update(content).digest('hex');
      if (hash.startsWith('0')) {
        block.currentHash = hash;
        break;
      }
      nonce++;
    }
    return block;
  };

  // Seed Genesis Block
  const genesis = mineBlockLocal(
    10419,
    '0000000000000000000000000000000000000000000000000000000000000000',
    '0000000000000000000000000000000000000000000000000000000000000000',
    'GENESIS',
    'GENESIS'
  );
  blocks.set(genesis.blockNumber, genesis);

  // Seed Block #10420 (for EVID-001)
  const b1 = mineBlockLocal(
    10420,
    genesis.currentHash,
    '7e4c5b1b4d89a1c8ee1042789f41d99ee70172bfac23b9d19a3b8d7e6c518bf9',
    'CASE-2026-991A',
    'EVID-001'
  );
  blocks.set(b1.blockNumber, b1);

  // Seed Block #10421 (for EVID-002)
  const b2 = mineBlockLocal(
    10421,
    b1.currentHash,
    'fa4d3c9210b3ef2d948ac50e7b95ccaa211f4d3606bb4b6a1e3ff62b5d40941a',
    'CASE-2026-991A',
    'EVID-002'
  );
  blocks.set(b2.blockNumber, b2);

  // Seed Block #10422 (for EVID-003)
  const b3 = mineBlockLocal(
    10422,
    b2.currentHash,
    '0d2f8e916ccb23a104f678ef40a92cd118afb37deaa838bf228ee04209938d81',
    'CASE-2026-104X',
    'EVID-003'
  );
  blocks.set(b3.blockNumber, b3);

  // Seed Detective Marcus Ramirez
  officers.set('SH-9941', {
    id: 'usr-9941',
    badgeNumber: 'SH-9941',
    name: 'Detective Marcus Ramirez',
    email: 'marcus.ramirez@police.gov',
    passwordHash: '$2b$10$fallbackhashforpasswordmarcusramirez2026sec', // bcrypt hashed 'password'
    role: 'EVIDENCE_ADMIN',
    nodeCount: 8,
    createdAt: new Date().toISOString()
  });

  // Seed standard cases
  const initialCases = [
    {
      id: 'CASE-2026-991A',
      title: 'Metro Bank Vault Intrusion',
      description: 'Investigation into physical and network-assisted safe box breach at main terminal.',
      status: 'ACTIVE',
      priority: 'CRITICAL',
      assignedOfficer: 'Det. Marcus Ramirez',
      badgeNumber: 'SH-9941',
      department: 'Cyber Forensics Unit',
      createdAt: '2026-07-02T10:14:00Z',
      evidenceIds: ['EVID-001', 'EVID-002']
    },
    {
      id: 'CASE-2026-104X',
      title: 'Ransomware Attack on City Water Grid',
      description: 'Malicious firmware injection threatening critical utility control modules.',
      status: 'ACTIVE',
      priority: 'CRITICAL',
      assignedOfficer: 'Analyst Sarah Chen',
      badgeNumber: 'SH-4412',
      department: 'Infrastructure Security Team',
      createdAt: '2026-07-05T08:30:00Z',
      evidenceIds: ['EVID-003', 'EVID-004']
    },
    {
      id: 'CASE-2026-552D',
      title: 'Port Authority Database Compromise',
      description: 'Exfiltration of custom manifest logs containing state defense transit indices.',
      status: 'UNDER_REVIEW',
      priority: 'HIGH',
      assignedOfficer: 'Det. Marcus Ramirez',
      badgeNumber: 'SH-9941',
      department: 'Cyber Forensics Unit',
      createdAt: '2026-07-08T14:45:00Z',
      evidenceIds: ['EVID-005']
    }
  ];

  initialCases.forEach(c => cases.set(c.id, c));

  // Seed Evidence
  const initialEvidence = [
    {
      id: 'EVID-001',
      caseId: 'CASE-2026-991A',
      name: 'north_vault_corridor_cctv.mp4',
      type: 'VIDEO',
      size: 245100000,
      sha256: '7e4c5b1b4d89a1c8ee1042789f41d99ee70172bfac23b9d19a3b8d7e6c518bf9',
      uploadedAt: '2026-07-02T11:05:00Z',
      uploadedBy: 'Det. Marcus Ramirez',
      badgeNumber: 'SH-9941',
      status: 'SECURED',
      blockNumber: 10420,
      txHash: '0x1a9e8f498bc19d3ee77bfcf4cc98d6c70ab00ff61b8f04c63bf90d7f25e791b7',
      metadata: {
        deviceModel: 'Hikvision Core-X9',
        gpsCoordinates: '40.7128° N, 74.0060° W',
        captureDate: '2026-07-01T23:15:22Z',
        duration: '04:12',
        resolution: '1920x1080 @ 30fps',
        sourcePlatform: 'Vault DVR System',
        fileExtension: 'mp4'
      }
    },
    {
      id: 'EVID-002',
      caseId: 'CASE-2026-991A',
      name: 'vault_access_logs.csv',
      type: 'DOCUMENT',
      size: 1420000,
      sha256: 'fa4d3c9210b3ef2d948ac50e7b95ccaa211f4d3606bb4b6a1e3ff62b5d40941a',
      uploadedAt: '2026-07-02T11:32:00Z',
      uploadedBy: 'Det. Marcus Ramirez',
      badgeNumber: 'SH-9941',
      status: 'SECURED',
      blockNumber: 10421,
      txHash: '0x39a9cf3cbda809eefef7c8ea8110b98fbcde0aa9d37aa9b92200fe0176df9bb0',
      metadata: {
        deviceModel: 'Honeywell Control Hub v4',
        gpsCoordinates: '40.7128° N, 74.0060° W',
        captureDate: '2026-07-02T02:00:00Z',
        sourcePlatform: 'Active Directory Exporter',
        fileExtension: 'csv'
      }
    },
    {
      id: 'EVID-003',
      caseId: 'CASE-2026-104X',
      name: 'malicious_firmware_dump.bin',
      type: 'MOBILE',
      size: 8900000,
      sha256: '0d2f8e916ccb23a104f678ef40a92cd118afb37deaa838bf228ee04209938d81',
      uploadedAt: '2026-07-05T09:12:00Z',
      uploadedBy: 'Analyst Sarah Chen',
      badgeNumber: 'SH-4412',
      status: 'SECURED',
      blockNumber: 10422,
      txHash: '0x8b79cae922114de9fa6ef012be7ef9283e78aef91209b0fc00fca3be4de98a2c',
      metadata: {
        deviceModel: 'SCADA Controller RTU-12',
        gpsCoordinates: '41.8781° N, 87.6298° W',
        captureDate: '2026-07-05T05:44:12Z',
        sourcePlatform: 'Wireshark Extraction',
        fileExtension: 'bin'
      }
    }
  ];

  initialEvidence.forEach(e => evidence.set(e.id, e));

  // Seed Custody Logs
  const initialAuditLogs = [
    {
      id: 'LOG-001',
      evidenceId: 'EVID-001',
      timestamp: '2026-07-02T11:05:00Z',
      officer: 'Det. Marcus Ramirez',
      badgeNumber: 'SH-9941',
      action: 'INGESTION',
      location: 'Cyber Forensics Lab-01',
      status: 'VERIFIED',
      blockNumber: 10420,
      txHash: '0x1a9e8f498bc19d3ee77bfcf4cc98d6c70ab00ff61b8f04c63bf90d7f25e791b7',
      details: 'Initial raw file ingestion from physical Kingston USB forensic backup.'
    },
    {
      id: 'LOG-002',
      evidenceId: 'EVID-001',
      timestamp: '2026-07-03T09:14:00Z',
      officer: 'Analyst Sarah Chen',
      badgeNumber: 'SH-4412',
      action: 'ACCESS',
      location: 'Forensic Workstation-03',
      status: 'VERIFIED',
      blockNumber: 10420,
      txHash: '0x3cbda8110b98fbcde0aa9d37aa9b92200fe0176df9bb01a9e8f498bc19d3ee77',
      details: 'Read file authorization generated for digital surveillance sequence enhancement.'
    },
    {
      id: 'LOG-003',
      evidenceId: 'EVID-002',
      timestamp: '2026-07-02T11:32:00Z',
      officer: 'Det. Marcus Ramirez',
      badgeNumber: 'SH-9941',
      action: 'INGESTION',
      location: 'Cyber Forensics Lab-01',
      status: 'VERIFIED',
      blockNumber: 10421,
      txHash: '0x39a9cf3cbda809eefef7c8ea8110b98fbcde0aa9d37aa9b92200fe0176df9bb0',
      details: 'Ingestion of CSV active directory authorization entries.'
    }
  ];

  initialAuditLogs.forEach(l => custodyLogs.push(l));

  // Seed Notifications
  const initialNotifications = [
    {
      id: 'NOT-001',
      type: 'SUCCESS' as const,
      title: 'Block Mined Successfully',
      message: 'Evidence "north_vault_corridor_cctv.mp4" has been permanently anchored in block #10420.',
      timestamp: '2026-07-12T10:00:00Z',
      read: false,
      blockNumber: 10420
    },
    {
      id: 'NOT-002',
      type: 'INFO' as const,
      title: 'Courtroom Verification Passed',
      message: 'Judge Thomas Reyes executed high-speed hash check on "vault_access_logs.csv". Match: 100%.',
      timestamp: '2026-07-12T14:31:00Z',
      read: false
    }
  ];

  initialNotifications.forEach(n => notifications.push(n));
}

// 1. Officer Repository Implementation
export class InMemoryOfficerRepository implements IOfficerRepository {
  constructor() { seedInMemoryDb(); }

  async findById(id: string): Promise<OfficerDTO | null> {
    const o = Array.from(officers.values()).find(of => of.id === id);
    if (!o) return null;
    const { passwordHash, ...dto } = o;
    return dto;
  }

  async findByBadgeNumber(badgeNumber: string): Promise<OfficerDTO | null> {
    const o = officers.get(badgeNumber);
    if (!o) return null;
    const { passwordHash, ...dto } = o;
    return dto;
  }

  async findByEmail(email: string): Promise<OfficerDTO | null> {
    const o = Array.from(officers.values()).find(of => of.email.toLowerCase() === email.toLowerCase());
    if (!o) return null;
    const { passwordHash, ...dto } = o;
    return dto;
  }

  async getPasswordHashByBadge(badgeNumber: string): Promise<string | null> {
    const o = officers.get(badgeNumber);
    return o ? o.passwordHash : null;
  }

  async create(data: any): Promise<OfficerDTO> {
    const id = data.id || generateId('USR');
    const newOfficer = {
      id,
      badgeNumber: data.badgeNumber,
      name: data.name,
      email: data.email,
      passwordHash: data.passwordHash,
      role: data.role || 'INVESTIGATING_OFFICER',
      nodeCount: data.nodeCount || 8,
      createdAt: new Date().toISOString()
    };
    officers.set(newOfficer.badgeNumber, newOfficer);
    const { passwordHash, ...dto } = newOfficer;
    return dto;
  }

  async update(id: string, data: any): Promise<OfficerDTO> {
    const original = Array.from(officers.values()).find(of => of.id === id);
    if (!original) throw new Error('Officer not found');

    const updated = { ...original, ...data };
    officers.set(updated.badgeNumber, updated);
    const { passwordHash, ...dto } = updated;
    return dto;
  }
}

// 2. Case Repository Implementation
export class InMemoryCaseRepository implements ICaseRepository {
  constructor() { seedInMemoryDb(); }

  async findById(id: string): Promise<CaseDTO | null> {
    return cases.get(id) || null;
  }

  async findAll(options?: { search?: string; status?: string; priority?: string; limit?: number; offset?: number }): Promise<CaseDTO[]> {
    let list = Array.from(cases.values());
    
    if (options?.search) {
      const s = options.search.toLowerCase();
      list = list.filter(c => c.title.toLowerCase().includes(s) || c.description.toLowerCase().includes(s) || c.id.toLowerCase().includes(s));
    }
    if (options?.status) {
      list = list.filter(c => c.status === options.status);
    }
    if (options?.priority) {
      list = list.filter(c => c.priority === options.priority);
    }

    // Sort descending by creation date
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const limit = options?.limit || 10;
    const offset = options?.offset || 0;
    return list.slice(offset, offset + limit);
  }

  async create(data: any): Promise<CaseDTO> {
    const id = data.id || generateId('CASE');
    const newCase: CaseDTO = {
      id,
      title: data.title,
      description: data.description,
      status: data.status || 'ACTIVE',
      priority: data.priority || 'MEDIUM',
      assignedOfficer: data.assignedOfficer,
      badgeNumber: data.badgeNumber,
      department: data.department || 'Federal Forensics Division',
      createdAt: new Date().toISOString(),
      evidenceIds: []
    };
    cases.set(id, newCase);
    return newCase;
  }

  async update(id: string, data: any): Promise<CaseDTO> {
    const original = cases.get(id);
    if (!original) throw new Error('Case not found');

    const updated: CaseDTO = { ...original, ...data, id }; // Ensure ID is immutable
    cases.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return cases.delete(id);
  }

  async count(options?: { search?: string; status?: string; priority?: string }): Promise<number> {
    let list = Array.from(cases.values());
    if (options?.search) {
      const s = options.search.toLowerCase();
      list = list.filter(c => c.title.toLowerCase().includes(s) || c.description.toLowerCase().includes(s) || c.id.toLowerCase().includes(s));
    }
    if (options?.status) {
      list = list.filter(c => c.status === options.status);
    }
    if (options?.priority) {
      list = list.filter(c => c.priority === options.priority);
    }
    return list.length;
  }
}

// 3. Evidence Repository Implementation
export class InMemoryEvidenceRepository implements IEvidenceRepository {
  constructor() { seedInMemoryDb(); }

  async findById(id: string): Promise<EvidenceDTO | null> {
    return evidence.get(id) || null;
  }

  async findBySha256(sha256: string): Promise<EvidenceDTO | null> {
    return Array.from(evidence.values()).find(e => e.sha256 === sha256) || null;
  }

  async findAll(options?: { caseId?: string; search?: string; type?: string; status?: string; limit?: number; offset?: number }): Promise<EvidenceDTO[]> {
    let list = Array.from(evidence.values());

    if (options?.caseId) {
      list = list.filter(e => e.caseId === options.caseId);
    }
    if (options?.search) {
      const s = options.search.toLowerCase();
      list = list.filter(e => e.name.toLowerCase().includes(s) || e.id.toLowerCase().includes(s));
    }
    if (options?.type) {
      list = list.filter(e => e.type === options.type);
    }
    if (options?.status) {
      list = list.filter(e => e.status === options.status);
    }

    list.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

    const limit = options?.limit || 10;
    const offset = options?.offset || 0;
    return list.slice(offset, offset + limit);
  }

  async create(data: any, metadata: Record<string, string> = {}): Promise<EvidenceDTO> {
    const id = data.id || generateId('EVID');
    const newEvidence: EvidenceDTO = {
      id,
      caseId: data.caseId,
      name: data.name,
      type: data.type || 'DOCUMENT',
      size: data.size,
      sha256: data.sha256,
      uploadedAt: new Date().toISOString(),
      uploadedBy: data.uploadedBy || 'Det. Ramirez',
      badgeNumber: data.badgeNumber || 'SH-9941',
      status: data.status || 'SECURED',
      fileUrl: data.fileUrl || null,
      blockNumber: data.blockNumber || Math.floor(10425 + Math.random() * 10),
      txHash: data.txHash || generateTxHash(),
      metadata: { ...data.metadata, ...metadata }
    };
    evidence.set(id, newEvidence);

    // Update case evidence list mapping
    const parentCase = cases.get(data.caseId);
    if (parentCase) {
      parentCase.evidenceIds = [...(parentCase.evidenceIds || []), id];
      cases.set(data.caseId, parentCase);
    }

    return newEvidence;
  }

  async update(id: string, data: any, metadata?: Record<string, string>): Promise<EvidenceDTO> {
    const original = evidence.get(id);
    if (!original) throw new Error('Evidence not found');

    const updated: EvidenceDTO = { 
      ...original, 
      ...data, 
      id,
      metadata: metadata ? { ...original.metadata, ...metadata } : original.metadata 
    };
    evidence.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const ev = evidence.get(id);
    if (!ev) return false;

    // Remove from parent case mapping
    const parentCase = cases.get(ev.caseId);
    if (parentCase) {
      parentCase.evidenceIds = parentCase.evidenceIds.filter(eId => eId !== id);
      cases.set(ev.caseId, parentCase);
    }

    return evidence.delete(id);
  }

  async count(options?: { caseId?: string; search?: string; type?: string; status?: string }): Promise<number> {
    let list = Array.from(evidence.values());
    if (options?.caseId) {
      list = list.filter(e => e.caseId === options.caseId);
    }
    if (options?.search) {
      const s = options.search.toLowerCase();
      list = list.filter(e => e.name.toLowerCase().includes(s) || e.id.toLowerCase().includes(s));
    }
    if (options?.type) {
      list = list.filter(e => e.type === options.type);
    }
    if (options?.status) {
      list = list.filter(e => e.status === options.status);
    }
    return list.length;
  }
}

// 4. Custody Log Repository Implementation
export class InMemoryCustodyLogRepository implements ICustodyLogRepository {
  constructor() { seedInMemoryDb(); }

  async create(data: any): Promise<CustodyLogDTO> {
    const log: CustodyLogDTO = {
      id: data.id || generateId('LOG'),
      evidenceId: data.evidenceId,
      timestamp: new Date().toISOString(),
      officer: data.officer,
      badgeNumber: data.badgeNumber,
      action: data.action,
      location: data.location,
      status: data.status || 'VERIFIED',
      blockNumber: data.blockNumber || 10425,
      txHash: data.txHash || generateTxHash(),
      details: data.details
    };
    custodyLogs.unshift(log); // Prepend to show most recent first
    return log;
  }

  async findByEvidenceId(evidenceId: string): Promise<CustodyLogDTO[]> {
    return custodyLogs.filter(l => l.evidenceId === evidenceId);
  }

  async findByOfficerBadge(badgeNumber: string): Promise<CustodyLogDTO[]> {
    return custodyLogs.filter(l => l.badgeNumber === badgeNumber);
  }

  async findAll(options?: { limit?: number; offset?: number }): Promise<CustodyLogDTO[]> {
    const limit = options?.limit || 20;
    const offset = options?.offset || 0;
    return custodyLogs.slice(offset, offset + limit);
  }
}

// 5. Notification Repository Implementation
export class InMemoryNotificationRepository implements INotificationRepository {
  constructor() { seedInMemoryDb(); }

  async findAll(options?: { limit?: number; offset?: number }): Promise<SystemNotificationDTO[]> {
    const limit = options?.limit || 50;
    const offset = options?.offset || 0;
    return notifications.slice(offset, offset + limit);
  }

  async create(data: any): Promise<SystemNotificationDTO> {
    const not: SystemNotificationDTO = {
      id: data.id || generateId('NOT'),
      type: data.type || 'INFO',
      title: data.title,
      message: data.message,
      timestamp: new Date().toISOString(),
      read: false,
      blockNumber: data.blockNumber || null
    };
    notifications.unshift(not);
    return not;
  }

  async markAsRead(id: string): Promise<SystemNotificationDTO | null> {
    const not = notifications.find(n => n.id === id);
    if (!not) return null;
    not.read = true;
    return not;
  }

  async markAllAsRead(): Promise<boolean> {
    notifications.forEach(n => n.read = true);
    return true;
  }

  async clearAll(): Promise<boolean> {
    notifications.length = 0;
    return true;
  }
}

// 6. Report Repository Implementation
export class InMemoryReportRepository implements IReportRepository {
  constructor() { seedInMemoryDb(); }

  async create(data: any): Promise<ReportDTO> {
    const id = data.id || generateId('REP');
    const newReport: ReportDTO = {
      id,
      type: data.type,
      title: data.title,
      content: data.content,
      author: data.author,
      badgeNumber: data.badgeNumber,
      createdAt: new Date().toISOString()
    };
    reports.set(id, newReport);
    return newReport;
  }

  async findAll(options?: { limit?: number; offset?: number }): Promise<ReportDTO[]> {
    let list = Array.from(reports.values());
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const limit = options?.limit || 15;
    const offset = options?.offset || 0;
    return list.slice(offset, offset + limit);
  }

  async findById(id: string): Promise<ReportDTO | null> {
    return reports.get(id) || null;
  }
}

// 7. System Log Repository Implementation
export class InMemorySystemLogRepository implements ISystemLogRepository {
  async create(data: any): Promise<SystemLogDTO> {
    const log: SystemLogDTO = {
      id: generateId('SYSLOG'),
      level: data.level || 'INFO',
      message: data.message,
      timestamp: new Date().toISOString(),
      meta: data.meta || null
    };
    systemLogs.unshift(log);
    return log;
  }

  async findAll(options?: { limit?: number; offset?: number }): Promise<SystemLogDTO[]> {
    const limit = options?.limit || 50;
    const offset = options?.offset || 0;
    return systemLogs.slice(offset, offset + limit);
  }
}

// 8. Block Repository Implementation
export class InMemoryBlockRepository implements IBlockRepository {
  constructor() { seedInMemoryDb(); }

  async create(block: BlockDTO): Promise<BlockDTO> {
    blocks.set(block.blockNumber, block);
    return block;
  }

  async findAll(options?: { limit?: number; offset?: number; search?: string }): Promise<BlockDTO[]> {
    let list = Array.from(blocks.values());
    list.sort((a, b) => b.blockNumber - a.blockNumber); // Highest block number first (descending order)

    if (options?.search) {
      const s = options.search.toLowerCase();
      list = list.filter(b => 
        b.blockNumber.toString().includes(s) ||
        b.fileHash.toLowerCase().includes(s) ||
        b.caseId.toLowerCase().includes(s) ||
        b.evidenceId.toLowerCase().includes(s) ||
        b.previousHash.toLowerCase().includes(s) ||
        b.currentHash.toLowerCase().includes(s)
      );
    }

    const limit = options?.limit || 100;
    const offset = options?.offset || 0;
    return list.slice(offset, offset + limit);
  }

  async findLatest(): Promise<BlockDTO | null> {
    if (blocks.size === 0) return null;
    const sorted = Array.from(blocks.values()).sort((a, b) => b.blockNumber - a.blockNumber);
    return sorted[0];
  }

  async count(options?: { search?: string }): Promise<number> {
    let list = Array.from(blocks.values());
    if (options?.search) {
      const s = options.search.toLowerCase();
      list = list.filter(b => 
        b.blockNumber.toString().includes(s) ||
        b.fileHash.toLowerCase().includes(s) ||
        b.caseId.toLowerCase().includes(s) ||
        b.evidenceId.toLowerCase().includes(s)
      );
    }
    return list.length;
  }

  async clearAll(): Promise<boolean> {
    blocks.clear();
    return true;
  }
}
