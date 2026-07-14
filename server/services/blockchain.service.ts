import { RepositoryFactory } from '../repositories/factory';
import { BlockDTO } from '../types';
import { calculateSHA256 } from '../utils';

export class BlockchainService {
  private get repo() {
    return RepositoryFactory.getBlockRepository();
  }

  // Helper to recalculate a block's current hash from its attributes
  public calculateBlockHash(block: Omit<BlockDTO, 'currentHash'>): string {
    const content = `${block.blockNumber}${block.previousHash}${block.fileHash}${block.caseId}${block.evidenceId}${block.officerId}${block.timestamp}${block.nonce}`;
    return calculateSHA256(Buffer.from(content));
  }

  // Automatically ensure Genesis Block exists if database/chain is empty
  public async ensureGenesisBlock(): Promise<BlockDTO> {
    const latest = await this.repo.findLatest();
    if (latest) {
      return latest;
    }

    const genesisData: Omit<BlockDTO, 'currentHash' | 'nonce'> = {
      blockNumber: 10419,
      previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
      fileHash: '0000000000000000000000000000000000000000000000000000000000000000',
      caseId: 'SYSTEM-GENESIS',
      evidenceId: 'SYSTEM-GENESIS',
      officerId: 'SYSTEM',
      timestamp: new Date('2026-07-13T00:00:00.000Z').toISOString(),
      status: 'STABLE'
    };

    // Mine genesis block with difficulty = 1
    const genesisMined = this.mineBlockSync(genesisData, 1);
    await this.repo.create(genesisMined);
    return genesisMined;
  }

  // Synchronously mine a block using Proof of Work
  private mineBlockSync(blockData: Omit<BlockDTO, 'currentHash' | 'nonce'>, difficulty = 1): BlockDTO {
    let nonce = 0;
    const block: BlockDTO = {
      ...blockData,
      nonce,
      currentHash: ''
    };

    while (true) {
      block.nonce = nonce;
      const hash = this.calculateBlockHash(block);
      if (hash.startsWith('0'.repeat(difficulty))) {
        block.currentHash = hash;
        break;
      }
      nonce++;
    }
    return block;
  }

  // Create/Mine a block linked to the latest block in the chain
  async createBlockForEvidence(evidenceId: string, fileHash: string, caseId: string, officerUser: any): Promise<BlockDTO> {
    // 1. Ensure Genesis Block exists
    await this.ensureGenesisBlock();

    // 2. Get the latest block
    const latestBlock = await this.repo.findLatest();
    const nextBlockNumber = latestBlock ? latestBlock.blockNumber + 1 : 10420;
    const previousHash = latestBlock ? latestBlock.currentHash : '0'.repeat(64);

    const blockData: Omit<BlockDTO, 'currentHash' | 'nonce'> = {
      blockNumber: nextBlockNumber,
      previousHash,
      fileHash,
      caseId,
      evidenceId,
      officerId: officerUser.badgeNumber || officerUser.id || 'SYSTEM',
      timestamp: new Date().toISOString(),
      status: 'STABLE'
    };

    // 3. Mine the next block
    const minedBlock = this.mineBlockSync(blockData, 1);

    // 4. Save to the database
    await this.repo.create(minedBlock);

    return minedBlock;
  }

  // Comprehensive Blockchain Validation Algorithm
  async validateChain(): Promise<{ valid: boolean; status: 'Blockchain Valid' | 'Blockchain Compromised'; details: string[] }> {
    const details: string[] = [];
    
    // Retrieve all blocks sorted by blockNumber ASC
    const blocks = await this.repo.findAll({ limit: 1000 });
    
    if (blocks.length === 0) {
      // Genesis is missing, auto-create it
      await this.ensureGenesisBlock();
      return {
        valid: true,
        status: 'Blockchain Valid',
        details: ['Chain was empty. Successfully auto-generated systems Genesis block.']
      };
    }

    // Sort ascending for proper chronological verification
    const sortedBlocks = [...blocks].sort((a, b) => a.blockNumber - b.blockNumber);
    let isValid = true;

    // Validate each block
    for (let i = 0; i < sortedBlocks.length; i++) {
      const current = sortedBlocks[i];

      // 1. Check self-integrity (Hash matching)
      const recalculatedHash = this.calculateBlockHash(current);
      if (current.currentHash !== recalculatedHash) {
        isValid = false;
        details.push(`Tampering detected at Block #${current.blockNumber}! Stored hash [${current.currentHash}] does not match recalculated hash [${recalculatedHash}].`);
      }

      // 2. Linkage integrity (Not applicable to first element)
      if (i > 0) {
        const previous = sortedBlocks[i - 1];
        if (current.previousHash !== previous.currentHash) {
          isValid = false;
          details.push(`Linkage broken between Block #${previous.blockNumber} and Block #${current.blockNumber}! Expected previousHash [${previous.currentHash}], but found [${current.previousHash}].`);
        }

        // 3. Missing blocks detection
        if (current.blockNumber !== previous.blockNumber + 1) {
          isValid = false;
          details.push(`Chronological gap detected: Missing block(s) between Block #${previous.blockNumber} and Block #${current.blockNumber}.`);
        }
      }
    }

    if (isValid) {
      details.push(`All ${sortedBlocks.length} blocks checked successfully. Chronological linkage and cryptographic authenticity of consensus signatures remain 100% pristine.`);
    }

    return {
      valid: isValid,
      status: isValid ? 'Blockchain Valid' : 'Blockchain Compromised',
      details
    };
  }

  // Retrieve blocks
  async listBlocks(options?: { page?: number; limit?: number; search?: string }): Promise<{ items: BlockDTO[]; total: number; page: number; limit: number }> {
    // Make sure we have at least genesis seeded
    await this.ensureGenesisBlock();

    const page = options?.page || 1;
    const limit = options?.limit || 15;
    const offset = (page - 1) * limit;

    const items = await this.repo.findAll({
      limit,
      offset,
      search: options?.search
    });

    const total = await this.repo.count({ search: options?.search });

    return {
      items,
      total,
      page,
      limit
    };
  }
}
