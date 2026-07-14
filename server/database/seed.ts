import { getPrisma } from './client';
import crypto from 'crypto';

interface BlockDTO {
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

// Helper to mine a block using SHA-256 proof-of-work (defined at module scope)
function mineBlockLocal(
  blockNumber: number,
  prevHash: string,
  fileHash: string,
  caseId: string,
  evidenceId: string,
  officerId: string
): BlockDTO {
  let nonce = 0;
  const block: BlockDTO = {
    blockNumber,
    previousHash: prevHash,
    currentHash: '',
    fileHash,
    caseId,
    evidenceId,
    officerId,
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
}

export async function seedDatabaseIfNeeded() {
  const prisma = getPrisma();

  try {
    const officerCount = await prisma.officer.count();
    if (officerCount > 0) {
      console.log('Database already has data. Skipping seed.');
      return;
    }

    console.log('🌱 Seeding Supabase database with initial hackathon datasets...');
    
    // 1. Seed Officer Detective Marcus Ramirez
    const officerId = 'usr-9941';
    await prisma.officer.create({
      data: {
        id: officerId,
        badgeNumber: 'SH-9941',
        name: 'Detective Marcus Ramirez',
        email: 'marcus.ramirez@police.gov',
        passwordHash: '$2b$10$fallbackhashforpasswordmarcusramirez2026sec', // bcrypt hashed 'password'
        role: 'EVIDENCE_ADMIN',
        nodeCount: 8
      }
    });

    // 2. Seed Cases
    await prisma.case.createMany({
      data: [
        {
          id: 'CASE-2026-991A',
          title: 'Metro Bank Vault Intrusion',
          description: 'Investigation into physical and network-assisted safe box breach at main terminal.',
          status: 'ACTIVE',
          priority: 'CRITICAL',
          category: 'Cyber Heist',
          officerId: officerId,
          officerName: 'Det. Marcus Ramirez',
          badgeNumber: 'SH-9941'
        },
        {
          id: 'CASE-2026-104X',
          title: 'Ransomware Attack on City Water Grid',
          description: 'Malicious firmware injection threatening critical utility control modules.',
          status: 'ACTIVE',
          priority: 'CRITICAL',
          category: 'Critical Infrastructure',
          officerId: null,
          officerName: 'Analyst Sarah Chen',
          badgeNumber: 'SH-4412'
        },
        {
          id: 'CASE-2026-552D',
          title: 'Port Authority Database Compromise',
          description: 'Exfiltration of custom manifest logs containing state defense transit indices.',
          status: 'UNDER_REVIEW',
          priority: 'HIGH',
          category: 'Data Exfiltration',
          officerId: officerId,
          officerName: 'Det. Marcus Ramirez',
          badgeNumber: 'SH-9941'
        }
      ]
    });

    // 3. Seed Evidence
    await prisma.evidence.createMany({
      data: [
        {
          id: 'EVID-001',
          caseId: 'CASE-2026-991A',
          name: 'north_vault_corridor_cctv.mp4',
          type: 'VIDEO',
          size: 245100000,
          sha256: '7e4c5b1b4d89a1c8ee1042789f41d99ee70172bfac23b9d19a3b8d7e6c518bf9',
          status: 'SECURED',
          blockNumber: 10420,
          txHash: '0x1a9e8f498bc19d3ee77bfcf4cc98d6c70ab00ff61b8f04c63bf90d7f25e791b7',
          officerId: officerId,
          officerName: 'Det. Marcus Ramirez',
          badgeNumber: 'SH-9941'
        },
        {
          id: 'EVID-002',
          caseId: 'CASE-2026-991A',
          name: 'vault_access_logs.csv',
          type: 'DOCUMENT',
          size: 1420000,
          sha256: 'fa4d3c9210b3ef2d948ac50e7b95ccaa211f4d3606bb4b6a1e3ff62b5d40941a',
          status: 'SECURED',
          blockNumber: 10421,
          txHash: '0x39a9cf3cbda809eefef7c8ea8110b98fbcde0aa9d37aa9b92200fe0176df9bb0',
          officerId: officerId,
          officerName: 'Det. Marcus Ramirez',
          badgeNumber: 'SH-9941'
        },
        {
          id: 'EVID-003',
          caseId: 'CASE-2026-104X',
          name: 'malicious_firmware_dump.bin',
          type: 'MOBILE',
          size: 8900000,
          sha256: '0d2f8e916ccb23a104f678ef40a92cd118afb37deaa838bf228ee04209938d81',
          status: 'SECURED',
          blockNumber: 10422,
          txHash: '0x8b79cae922114de9fa6ef012be7ef9283e78aef91209b0fc00fca3be4de98a2c',
          officerId: null,
          officerName: 'Analyst Sarah Chen',
          badgeNumber: 'SH-4412'
        }
      ]
    });

    // 4. Seed Evidence Metadata
    await prisma.evidenceMetadata.createMany({
      data: [
        { evidenceId: 'EVID-001', key: 'deviceModel', value: 'Hikvision Core-X9' },
        { evidenceId: 'EVID-001', key: 'gpsCoordinates', value: '40.7128° N, 74.0060° W' },
        { evidenceId: 'EVID-001', key: 'captureDate', value: '2026-07-01T23:15:22Z' },
        { evidenceId: 'EVID-001', key: 'duration', value: '04:12' },
        { evidenceId: 'EVID-001', key: 'resolution', value: '1920x1080 @ 30fps' },
        { evidenceId: 'EVID-001', key: 'sourcePlatform', value: 'Vault DVR System' },
        { evidenceId: 'EVID-001', key: 'fileExtension', value: 'mp4' },

        { evidenceId: 'EVID-002', key: 'deviceModel', value: 'Honeywell Control Hub v4' },
        { evidenceId: 'EVID-002', key: 'gpsCoordinates', value: '40.7128° N, 74.0060° W' },
        { evidenceId: 'EVID-002', key: 'captureDate', value: '2026-07-02T02:00:00Z' },
        { evidenceId: 'EVID-002', key: 'sourcePlatform', value: 'Active Directory Exporter' },
        { evidenceId: 'EVID-002', key: 'fileExtension', value: 'csv' },

        { evidenceId: 'EVID-003', key: 'deviceModel', value: 'SCADA Controller RTU-12' },
        { evidenceId: 'EVID-003', key: 'gpsCoordinates', value: '41.8781° N, 87.6298° W' },
        { evidenceId: 'EVID-003', key: 'captureDate', value: '2026-07-05T05:44:12Z' },
        { evidenceId: 'EVID-003', key: 'sourcePlatform', value: 'Wireshark Extraction' },
        { evidenceId: 'EVID-003', key: 'fileExtension', value: 'bin' }
      ]
    });

    // 5. Seed Custody Logs
    await prisma.chainOfCustodyLog.createMany({
      data: [
        {
          id: 'LOG-001',
          evidenceId: 'EVID-001',
          timestamp: new Date('2026-07-02T11:05:00Z'),
          officer: 'Det. Marcus Ramirez',
          badgeNumber: 'SH-9941',
          action: 'INGESTION',
          location: 'Cyber Forensics Lab-01',
          status: 'VERIFIED',
          blockNumber: 10420,
          txHash: '0x1a9e8f498bc19d3ee77bfcf4cc98d6c70ab00ff61b8f04c63bf90d7f25e791b7',
          details: 'Initial raw file ingestion from physical Kingston USB forensic backup.',
          officerId: officerId
        },
        {
          id: 'LOG-002',
          evidenceId: 'EVID-001',
          timestamp: new Date('2026-07-03T09:14:00Z'),
          officer: 'Analyst Sarah Chen',
          badgeNumber: 'SH-4412',
          action: 'ACCESS',
          location: 'Forensic Workstation-03',
          status: 'VERIFIED',
          blockNumber: 10420,
          txHash: '0x3cbda8110b98fbcde0aa9d37aa9b92200fe0176df9bb01a9e8f498bc19d3ee77',
          details: 'Read file authorization generated for digital surveillance sequence enhancement.',
          officerId: null
        },
        {
          id: 'LOG-003',
          evidenceId: 'EVID-002',
          timestamp: new Date('2026-07-02T11:32:00Z'),
          officer: 'Det. Marcus Ramirez',
          badgeNumber: 'SH-9941',
          action: 'INGESTION',
          location: 'Cyber Forensics Lab-01',
          status: 'VERIFIED',
          blockNumber: 10421,
          txHash: '0x39a9cf3cbda809eefef7c8ea8110b98fbcde0aa9d37aa9b92200fe0176df9bb0',
          details: 'Ingestion of CSV active directory authorization entries.',
          officerId: officerId
        }
      ]
    });

    // 6. Seed Notifications
    await prisma.notification.createMany({
      data: [
        {
          id: 'NOT-001',
          type: 'SUCCESS',
          title: 'Block Mined Successfully',
          message: 'Evidence "north_vault_corridor_cctv.mp4" has been permanently anchored in block #10420.',
          timestamp: new Date('2026-07-12T10:00:00Z'),
          read: false,
          blockNumber: 10420
        },
        {
          id: 'NOT-002',
          type: 'INFO',
          title: 'Courtroom Verification Passed',
          message: 'Judge Thomas Reyes executed high-speed hash check on "vault_access_logs.csv". Match: 100%.',
          timestamp: new Date('2026-07-12T14:31:00Z'),
          read: false
        }
      ]
    });

    // 7. Mine & Seed Blocks
    const genesis = mineBlockLocal(
      10419,
      '0000000000000000000000000000000000000000000000000000000000000000',
      '0000000000000000000000000000000000000000000000000000000000000000',
      'GENESIS',
      'GENESIS',
      officerId
    );
    const b1 = mineBlockLocal(
      10420,
      genesis.currentHash,
      '7e4c5b1b4d89a1c8ee1042789f41d99ee70172bfac23b9d19a3b8d7e6c518bf9',
      'CASE-2026-991A',
      'EVID-001',
      officerId
    );
    const b2 = mineBlockLocal(
      10421,
      b1.currentHash,
      'fa4d3c9210b3ef2d948ac50e7b95ccaa211f4d3606bb4b6a1e3ff62b5d40941a',
      'CASE-2026-991A',
      'EVID-002',
      officerId
    );
    const b3 = mineBlockLocal(
      10422,
      b2.currentHash,
      '0d2f8e916ccb23a104f678ef40a92cd118afb37deaa838bf228ee04209938d81',
      'CASE-2026-104X',
      'EVID-003',
      officerId
    );

    const blocksArray = [genesis, b1, b2, b3];
    // Use (prisma as any) because the Prisma typed client may not expose `.block`
    // until the client is freshly regenerated in the IDE — matches PrismaBlockRepository pattern
    const prismaAny = prisma as any;
    for (const b of blocksArray) {
      await prismaAny.block.create({
        data: {
          blockNumber: b.blockNumber,
          previousHash: b.previousHash,
          currentHash: b.currentHash,
          fileHash: b.fileHash,
          caseId: b.caseId,
          evidenceId: b.evidenceId,
          officerId: b.officerId,
          timestamp: new Date(b.timestamp),
          nonce: b.nonce,
          status: b.status
        }
      });
    }

    console.log('✅ Supabase database seeded successfully.');
  } catch (err: any) {
    console.error('❌ Database seeding failed:', err.message);
  }
}
