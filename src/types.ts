export type CaseStatus = 'ACTIVE' | 'UNDER_REVIEW' | 'COURT_HEARING' | 'CLOSED';
export type CasePriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type EvidenceType = 'VIDEO' | 'IMAGE' | 'AUDIO' | 'DOCUMENT' | 'CCTV' | 'MOBILE';

export interface AuditLog {
  id: string;
  evidenceId: string;
  timestamp: string;
  officer: string;
  badgeNumber: string;
  action: 'INGESTION' | 'ACCESS' | 'DOWNLOAD' | 'TRANSFER' | 'COURT_VERIFICATION' | 'ARCHIVE';
  location: string;
  status: 'VERIFIED' | 'COMPROMISED' | 'PENDING';
  blockNumber: number;
  txHash: string;
  details: string;
}

export interface EvidenceItem {
  id: string;
  caseId: string;
  name: string;
  type: EvidenceType;
  size: number; // in bytes
  sha256: string;
  uploadedAt: string;
  uploadedBy: string;
  badgeNumber: string;
  status: 'SECURED' | 'VERIFIED' | 'TAMPERED';
  metadata: {
    deviceModel?: string;
    gpsCoordinates?: string;
    captureDate?: string;
    duration?: string; // for audio/video
    resolution?: string; // for image/video
    sourcePlatform?: string;
    fileExtension: string;
  };
  blockNumber: number;
}

export interface Case {
  id: string;
  title: string;
  description: string;
  status: CaseStatus;
  priority: CasePriority;
  assignedOfficer: string;
  badgeNumber: string;
  department: string;
  createdAt: string;
  evidenceIds: string[];
}

export interface Block {
  blockNumber: number;
  previousHash: string;
  currentHash: string;
  timestamp: string;
  caseId: string;
  caseTitle: string;
  evidenceId: string;
  evidenceName: string;
  officer: string;
  badgeNumber: string;
  fileHash: string;
  status: 'STABLE' | 'MINING' | 'ORPHANED';
  nonce: number;
}

export interface UserProfile {
  id: string;
  name: string;
  badgeNumber: string;
  role: 'EVIDENCE_ADMIN' | 'FORENSIC_ANALYST' | 'INVESTIGATING_OFFICER';
  department: string;
  securityClearance: string;
  publicKey: string;
  hardwareKeyId: string;
  avatarUrl?: string;
}

export interface SystemNotification {
  id: string;
  type: 'SUCCESS' | 'ERROR' | 'WARNING' | 'INFO';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  blockNumber?: number;
}
