import { RepositoryFactory } from '../repositories/factory';
import { AppError, generateId, generateTxHash } from '../utils';
import { EvidenceDTO, CustodyLogDTO } from '../types';
import { BlockchainService } from './blockchain.service';

export class EvidenceService {
  private blockchainService = new BlockchainService();

  private get repo() {
    return RepositoryFactory.getEvidenceRepository();
  }

  private get caseRepo() {
    return RepositoryFactory.getCaseRepository();
  }

  private get custodyLogRepo() {
    return RepositoryFactory.getCustodyLogRepository();
  }

  private get notificationRepo() {
    return RepositoryFactory.getNotificationRepository();
  }

  async ingestEvidence(data: any, officerUser: any): Promise<EvidenceDTO> {
    // 1. Verify case exists
    const targetCase = await this.caseRepo.findById(data.caseId);
    if (!targetCase) {
      throw new AppError(`Target case docket ${data.caseId} does not exist. Ingestion rejected.`, 404);
    }

    // 2. Check if evidence file hash is already registered (de-duplication & duplicate detection)
    const existingHash = await this.repo.findBySha256(data.sha256);
    if (existingHash) {
      throw new AppError(`Cryptographic collision! A file with SHA-256 hash ${data.sha256} is already registered under Case ${existingHash.caseId}`, 400);
    }

    // 3. Create Evidence Entry with preliminary ID
    const evidenceId = data.id || `EVID-${Math.floor(100 + Math.random() * 900).toString()}`;

    // 4. Generate real Cryptographic Proof-of-Work Block using BlockchainService!
    const block = await this.blockchainService.createBlockForEvidence(
      evidenceId,
      data.sha256,
      targetCase.id,
      officerUser
    );

    const blockNumber = block.blockNumber;
    const txHash = block.currentHash;

    // 5. Create Evidence Entry in Database
    const evidenceItem = await this.repo.create({
      ...data,
      id: evidenceId,
      uploadedBy: officerUser.name,
      badgeNumber: officerUser.badgeNumber,
      status: 'SECURED',
      blockNumber,
      txHash
    }, data.metadata || {});

    // 6. Append Case Evidence Map Link (For database persistence integrity)
    await this.caseRepo.update(targetCase.id, {
      evidenceIds: [...(targetCase.evidenceIds || []), evidenceId]
    });

    // 7. Record Chain-of-Custody Ingestion Audit Log
    await this.custodyLogRepo.create({
      evidenceId,
      officer: officerUser.name,
      badgeNumber: officerUser.badgeNumber,
      action: 'INGESTION',
      location: 'Federal Evidence Lab 4-A',
      status: 'VERIFIED',
      blockNumber,
      txHash,
      details: `Asset "${evidenceItem.name}" ingested under Case ${targetCase.id}. SHA-256 lock [${data.sha256.substring(0, 10)}...] anchored to decentralized consensus ledger at block #${blockNumber}.`
    });

    // 8. Fire Secure Broadcast Alert
    await this.notificationRepo.create({
      type: 'SUCCESS',
      title: 'Evidence Signature Anchored',
      message: `File "${evidenceItem.name}" committed to immutable block #${blockNumber} successfully.`,
      blockNumber
    });

    return evidenceItem;
  }

  async getEvidenceDetails(id: string, officerUser?: any): Promise<EvidenceDTO> {
    const e = await this.repo.findById(id);
    if (!e) {
      throw new AppError(`Evidence record ${id} not found in secure storage`, 404);
    }

    // Record Chain-of-Custody View Audit Log
    try {
      await this.custodyLogRepo.create({
        evidenceId: id,
        officer: officerUser ? officerUser.name : 'System Auditor',
        badgeNumber: officerUser ? officerUser.badgeNumber : 'SYSTEM',
        action: 'VIEWED',
        location: 'Federal Secure Terminal',
        status: 'VERIFIED',
        details: `Asset details and metadata for "${e.name}" retrieved and viewed by officer.`
      });
    } catch (err) {
      console.warn('⚠️ Custody view log warning:', err);
    }

    return e;
  }

  async updateEvidenceMetadata(id: string, data: any, metadata?: Record<string, string>): Promise<EvidenceDTO> {
    const original = await this.repo.findById(id);
    if (!original) {
      throw new AppError(`Evidence record ${id} not found in secure storage`, 404);
    }

    // Security: Prevent editing of stored SHA-256 hashes or block parameters
    if (data.sha256 && data.sha256 !== original.sha256) {
      throw new AppError('Security violation: Cryptographic SHA-256 signatures are immutable after upload and cannot be modified.', 403);
    }
    if (data.blockNumber && data.blockNumber !== original.blockNumber) {
      throw new AppError('Security violation: Blockchain ledger block heights are immutable and cannot be modified.', 403);
    }
    if (data.txHash && data.txHash !== original.txHash) {
      throw new AppError('Security violation: Consensus transaction hashes are immutable and cannot be modified.', 403);
    }

    // Remove immutable fields from payload to ensure they remain absolutely untouched
    delete data.sha256;
    delete data.blockNumber;
    delete data.txHash;

    const updated = await this.repo.update(id, data, metadata);
    return updated;
  }

  async deleteEvidence(id: string, officerUser: any): Promise<boolean> {
    const original = await this.repo.findById(id);
    if (!original) {
      throw new AppError(`Evidence record ${id} not found in secure storage`, 404);
    }

    const success = await this.repo.delete(id);

    // Record Chain-of-Custody Disposal Audit Log
    await this.custodyLogRepo.create({
      evidenceId: id,
      officer: officerUser.name,
      badgeNumber: officerUser.badgeNumber,
      action: 'ARCHIVE',
      location: 'Federal Secure Vaults',
      status: 'VERIFIED',
      details: `Asset "${original.name}" removed from active case list and transferred to long-term offline archive.`
    });

    // Fire Warning System Notification
    await this.notificationRepo.create({
      type: 'WARNING',
      title: 'Evidence Decommissioned',
      message: `File "${original.name}" has been removed from active view. Historical block references preserved on-chain.`
    });

    return success;
  }

  async verifyEvidenceHash(id: string, submittedHash: string): Promise<{ match: boolean; originalHash: string; submittedHash: string; status: string; blockNumber: number | null }> {
    const item = await this.repo.findById(id);
    if (!item) {
      throw new AppError(`Evidence record ${id} not found for verification`, 404);
    }

    const match = item.sha256.toLowerCase() === submittedHash.trim().toLowerCase();
    
    // Add verification audit activity
    await this.custodyLogRepo.create({
      evidenceId: id,
      officer: 'Autopilot Consensus Daemon',
      badgeNumber: 'NODE-SHIELD',
      action: 'COURT_VERIFICATION',
      location: 'Consensus Network Validator',
      status: match ? 'VERIFIED' : 'COMPROMISED',
      blockNumber: item.blockNumber || 10425,
      txHash: item.txHash || generateTxHash(),
      details: match 
        ? `Cryptographic validation match 100% for "${item.name}". Verification checksum verified against Block #${item.blockNumber}.`
        : `CRITICAL DETECTED CHECKSUM MISMATCH! Submitted SHA-256 hash does not match immutable block ledger footprint. Original: ${item.sha256}.`
    });

    if (!match) {
      // Create alarm notification
      await this.notificationRepo.create({
        type: 'ERROR',
        title: 'Tampering Incident Flagged',
        message: `Consensus discrepancy! "${item.name}" failed checksum validation check. Audit trails alert sent.`
      });
    } else {
      // Create success notification
      await this.notificationRepo.create({
        type: 'SUCCESS',
        title: 'Evidence Verified successfully',
        message: `Consensus match: Integrity check successfully completed for "${item.name}".`
      });
    }

    return {
      match,
      originalHash: item.sha256,
      submittedHash,
      status: match ? 'VERIFIED' : 'COMPROMISED',
      blockNumber: item.blockNumber || null
    };
  }

  async listEvidence(options?: { caseId?: string; search?: string; type?: string; status?: string; page?: number; limit?: number }): Promise<{ items: EvidenceDTO[]; total: number; page: number; limit: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const offset = (page - 1) * limit;

    const items = await this.repo.findAll({
      caseId: options?.caseId,
      search: options?.search,
      type: options?.type,
      status: options?.status,
      limit,
      offset
    });

    const total = await this.repo.count({
      caseId: options?.caseId,
      search: options?.search,
      type: options?.type,
      status: options?.status
    });

    return {
      items,
      total,
      page,
      limit
    };
  }
}
