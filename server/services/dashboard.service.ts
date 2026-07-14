import { RepositoryFactory } from '../repositories/factory';
import { DashboardStatsDTO, CaseDTO, EvidenceDTO, CustodyLogDTO } from '../types';
import { isSupabaseConnected } from '../database/supabase';
import { isDatabaseConnected } from '../database/client';
import { BlockchainService } from './blockchain.service';

export class DashboardService {
  private get caseRepo() { return RepositoryFactory.getCaseRepository(); }
  private get evidenceRepo() { return RepositoryFactory.getEvidenceRepository(); }
  private get logRepo() { return RepositoryFactory.getCustodyLogRepository(); }
  private blockchainService = new BlockchainService();

  async getDashboardStats(officerUser: any): Promise<DashboardStatsDTO> {
    const totalCases = await this.caseRepo.count();
    const activeCases = await this.caseRepo.count({ status: 'ACTIVE' });
    const totalEvidence = await this.evidenceRepo.count();
    
    // Count verification activities
    const allLogs = await this.logRepo.findAll({ limit: 1000 });
    const verificationCount = allLogs.filter(l => l.action === 'COURT_VERIFICATION').length;
    
    // Count compromised files
    const compromisedCount = await this.evidenceRepo.count({ status: 'TAMPERED' });

    // Determine aggregate system status
    let systemHealth = 'PRISTINE';
    if (compromisedCount > 0) {
      systemHealth = 'ALERT_DISCREPANCY';
    } else if (allLogs.length > 500) {
      systemHealth = 'STABLE_COMPACTING';
    }

    // Determine Database Connection Status
    let dbConnectionStatus = 'InMemory Fallback';
    if (isSupabaseConnected()) {
      dbConnectionStatus = 'Supabase (PostgreSQL)';
    } else if (isDatabaseConnected()) {
      dbConnectionStatus = 'Local Prisma (PostgreSQL)';
    }

    // Validate Chain & retrieve block metrics
    const chainValidation = await this.blockchainService.validateChain();
    const latestBlock = await RepositoryFactory.getBlockRepository().findLatest();
    const currentBlockHeight = latestBlock ? latestBlock.blockNumber : 10422;

    return {
      totalCases,
      activeCases,
      totalEvidence,
      verificationCount,
      compromisedCount,
      systemHealth,
      nodeStatus: `${officerUser.nodeCount || 8} Active Nodes`,
      currentBlockHeight,
      dbConnectionStatus,
      blockchainValid: chainValidation.valid,
      blockchainStatusText: chainValidation.status,
      blockchainHealthPercentage: chainValidation.valid ? 100 : 66
    };
  }

  async getDashboardRecentActivity(): Promise<{
    recentLogs: CustodyLogDTO[];
    recentCases: CaseDTO[];
    recentEvidence: EvidenceDTO[];
  }> {
    const recentLogs = await this.logRepo.findAll({ limit: 5 });
    const recentCases = await this.caseRepo.findAll({ limit: 5 });
    const recentEvidence = await this.evidenceRepo.findAll({ limit: 5 });

    return {
      recentLogs,
      recentCases,
      recentEvidence
    };
  }
}
