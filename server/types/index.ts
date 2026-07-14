import { Request } from 'express';

export type UserRole = 'EVIDENCE_ADMIN' | 'FORENSIC_ANALYST' | 'INVESTIGATING_OFFICER' | 'ADMIN';

export interface JWTPayload {
  userId: string;
  badgeNumber: string;
  name: string;
  role: UserRole;
  department: string;
}

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

export interface OfficerDTO {
  id: string;
  badgeNumber: string;
  name: string;
  email: string;
  role: UserRole;
  nodeCount: number;
  createdAt: string;
}

export interface CaseDTO {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignedOfficer: string;
  badgeNumber: string;
  department: string;
  createdAt: string;
  evidenceIds: string[];
}

export interface EvidenceDTO {
  id: string;
  caseId: string;
  name: string;
  type: string;
  size: number;
  sha256: string;
  uploadedAt: string;
  uploadedBy: string;
  badgeNumber: string;
  status: string;
  fileUrl?: string | null;
  blockNumber?: number | null;
  txHash?: string | null;
  metadata: Record<string, string>;
}

export interface CustodyLogDTO {
  id: string;
  evidenceId: string;
  timestamp: string;
  officer: string;
  badgeNumber: string;
  action: string;
  location: string;
  status: string;
  blockNumber?: number | null;
  txHash?: string | null;
  details: string;
}

export interface SystemNotificationDTO {
  id: string;
  type: 'SUCCESS' | 'ERROR' | 'WARNING' | 'INFO';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  blockNumber?: number | null;
}

export interface ReportDTO {
  id: string;
  type: 'EVIDENCE' | 'CASE' | 'BLOCKCHAIN' | 'VERIFICATION';
  title: string;
  content: string;
  author: string;
  badgeNumber: string;
  createdAt: string;
}

export interface SystemLogDTO {
  id: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
  timestamp: string;
  meta?: string | null;
}

export interface DashboardStatsDTO {
  totalCases: number;
  activeCases: number;
  totalEvidence: number;
  verificationCount: number;
  compromisedCount: number;
  systemHealth: string;
  nodeStatus: string;
  currentBlockHeight: number;
  dbConnectionStatus: string;
  blockchainValid: boolean;
  blockchainStatusText: string;
  blockchainHealthPercentage: number;
}

export interface BlockDTO {
  blockNumber: number;
  previousHash: string;
  currentHash: string;
  fileHash: string;
  caseId: string;
  evidenceId: string;
  officerId: string;
  timestamp: string;
  nonce: number;
  status: string;
}
