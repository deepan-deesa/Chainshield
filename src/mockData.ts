import { Case, EvidenceItem, Block, AuditLog, UserProfile, SystemNotification, EvidenceType, CasePriority, CaseStatus } from './types';

// Helper to generate mock SHA-256-like strings
function generateMockHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `${hex}4d89a1c8ee1042789f41d99ee70172bfac23b9d19a3b8d7e6c518bf9`.substring(0, 64);
}

// 1. Generate 15 Realistic Police Officers / Investigators
export const mockUserProfile: UserProfile = {
  id: 'usr-9941',
  name: 'Detective Marcus Ramirez',
  badgeNumber: 'SH-9941',
  role: 'EVIDENCE_ADMIN',
  department: 'Federal Cyber Crime Division',
  securityClearance: 'Level 5 (State-Security)',
  publicKey: '0x7b4c5b1b4d89a1c8ee1042789f41d99ee70172bfac',
  hardwareKeyId: 'YubiKey-FIDO2-8812-9901',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
};

export const mockOfficers: UserProfile[] = [
  mockUserProfile,
  {
    id: 'usr-4412',
    name: 'Analyst Sarah Chen',
    badgeNumber: 'SH-4412',
    role: 'FORENSIC_ANALYST',
    department: 'Infrastructure Security Team',
    securityClearance: 'Level 4 (Forensic-Tech)',
    publicKey: '0xfa4d3c9210b3ef2d948ac50e7b95ccaa211f4d36',
    hardwareKeyId: 'YubiKey-FIDO2-1102-4412',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'usr-1029',
    name: 'Officer Tyler Vance',
    badgeNumber: 'SH-1029',
    role: 'INVESTIGATING_OFFICER',
    department: 'Tactical Cyber Patrol',
    securityClearance: 'Level 3 (Field-Access)',
    publicKey: '0x0d2f8e916ccb23a104f678ef40a92cd118afb37d',
    hardwareKeyId: 'YubiKey-FIDO2-5502-1029',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'usr-8012',
    name: 'Prosecutor Evelyn Stone',
    badgeNumber: 'PR-8012',
    role: 'INVESTIGATING_OFFICER',
    department: 'District Attorney Office',
    securityClearance: 'Level 4 (Legal-Vault)',
    publicKey: '0x39a9cf3cbda809eefef7c8ea8110b98fbcde0aa9',
    hardwareKeyId: 'YubiKey-FIDO2-8012-7711',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'usr-0012',
    name: 'Judge Thomas Reyes',
    badgeNumber: 'JD-0012',
    role: 'INVESTIGATING_OFFICER',
    department: 'Federal District Court',
    securityClearance: 'Level 5 (State-Security)',
    publicKey: '0xe9a4d87bb00cf900dfcde11ee904ba88cde0aa3b',
    hardwareKeyId: 'YubiKey-FIDO2-0012-9922',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'usr-2051',
    name: 'Agent James Carter',
    badgeNumber: 'FB-2051',
    role: 'EVIDENCE_ADMIN',
    department: 'Cyber Crime Task Force',
    securityClearance: 'Level 5 (State-Security)',
    publicKey: '0x1a9e8f498bc19d3ee77bfcf4cc98d6c70ab00ff6',
    hardwareKeyId: 'YubiKey-FIDO2-2051-5511',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'usr-3104',
    name: 'Sgt. Elena Rostova',
    badgeNumber: 'SH-3104',
    role: 'INVESTIGATING_OFFICER',
    department: 'Internal Affairs Security Unit',
    securityClearance: 'Level 4 (Forensic-Tech)',
    publicKey: '0x8b79cae922114de9fa6ef012be7ef9283e78aef9',
    hardwareKeyId: 'YubiKey-FIDO2-3104-1221',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'usr-1102',
    name: 'Investigator Liam Vance',
    badgeNumber: 'SH-1102',
    role: 'INVESTIGATING_OFFICER',
    department: 'Narcotics Cyber Intel',
    securityClearance: 'Level 3 (Field-Access)',
    publicKey: '0xc90f2bda110ffccde8ea40d210bbf94998ee8e10',
    hardwareKeyId: 'YubiKey-FIDO2-1102-3301',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'usr-4155',
    name: 'Analyst Jordan Croft',
    badgeNumber: 'SH-4155',
    role: 'FORENSIC_ANALYST',
    department: 'Digital Media Forensics',
    securityClearance: 'Level 3 (Field-Access)',
    publicKey: '0x52bf8e90aa9cdd8bde71f4df4a18e001dfa1fde9',
    hardwareKeyId: 'YubiKey-FIDO2-4155-2244',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'usr-6602',
    name: 'Officer Maya Lin',
    badgeNumber: 'SH-6602',
    role: 'INVESTIGATING_OFFICER',
    department: 'State Patrol Tech Unit',
    securityClearance: 'Level 3 (Field-Access)',
    publicKey: '0x74209bf11c90fa9bf11c90fa9bf11c90fa9bf11c',
    hardwareKeyId: 'YubiKey-FIDO2-6602-0041',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'usr-8821',
    name: 'Director Arthur Pendelton',
    badgeNumber: 'DIR-8821',
    role: 'EVIDENCE_ADMIN',
    department: 'Federal Cyber Command',
    securityClearance: 'Level 5 (State-Security)',
    publicKey: '0x9941af9941af9941af9941af9941af9941af9941',
    hardwareKeyId: 'YubiKey-FIDO2-8821-MASTER',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'usr-5114',
    name: 'Inspector Kenji Sato',
    badgeNumber: 'SH-5114',
    role: 'INVESTIGATING_OFFICER',
    department: 'Counter-Terrorism Cyber Unit',
    securityClearance: 'Level 4 (Forensic-Tech)',
    publicKey: '0x5114 Kenji Sato PubKey Cryptographic Lock',
    hardwareKeyId: 'YubiKey-FIDO2-5114-1144',
    avatarUrl: 'https://images.unsplash.com/photo-1489980508314-941910ded1f4?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'usr-7110',
    name: 'Analyst Sophia Martinez',
    badgeNumber: 'SH-7110',
    role: 'FORENSIC_ANALYST',
    department: 'Financial Cyber Crimes Group',
    securityClearance: 'Level 4 (Forensic-Tech)',
    publicKey: '0x7110 Sophia Martinez PubKey Cryptographic Lock',
    hardwareKeyId: 'YubiKey-FIDO2-7110-8844',
    avatarUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'usr-9221',
    name: 'Deputy Chief Richard Wright',
    badgeNumber: 'SH-9221',
    role: 'EVIDENCE_ADMIN',
    department: 'Cyber Forensics Unit',
    securityClearance: 'Level 5 (State-Security)',
    publicKey: '0x9221 Richard Wright PubKey Cryptographic Lock',
    hardwareKeyId: 'YubiKey-FIDO2-9221-5599',
    avatarUrl: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'usr-3311',
    name: 'Specialist David Kim',
    badgeNumber: 'SH-3311',
    role: 'FORENSIC_ANALYST',
    department: 'Malware Analysis Lab',
    securityClearance: 'Level 4 (Forensic-Tech)',
    publicKey: '0x3311 David Kim PubKey Cryptographic Lock',
    hardwareKeyId: 'YubiKey-FIDO2-3311-0022',
    avatarUrl: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&q=80&w=200'
  }
];

// Helper dictionaries for generating rich names and texts
const caseTopics = [
  { title: 'Intellectual Property Exfiltration', desc: 'Exfiltration of corporate blueprints, schematics, and source code by external state actors.' },
  { title: 'Ransomware Network Attack', desc: 'Intrusion and payload execution targeting enterprise cloud directory and storage vaults.' },
  { title: 'API Exploitation & Account Takeover', desc: 'Malicious API scraping and session token hijacking leading to unauthorized funds transfer.' },
  { title: 'Social Engineering Spear-Phishing', desc: 'Credential harvesting campaign mimicking internal security portals to obtain root credentials.' },
  { title: 'Firmware Tampering & IoT Exploit', desc: 'Firmware modification on manufacturing SCADA controllers causing physical sensor alerts.' },
  { title: 'Identity Theft & Crypto Laundering', desc: 'Automated synthesis of identity documents used to pass AML checks on decentralized protocols.' },
  { title: 'Unmanned Delivery Route Spoofing', desc: 'BGP routing interception and spoofing of commercial drone delivery path coordinates.' },
  { title: 'Insider Threat Data Spill', desc: 'Unauthorized download and leak of customer identity records onto public index forums.' }
];

const fileNames = [
  'camera_corridor_h264.mp4', 'syslog_export.json', 'network_traffic.pcap',
  'disk_image_dd.raw', 'memory_dump.dmp', 'credential_hash_dump.txt',
  'whatsapp_chat_backup.db', 'firmware_v2.0_backup.bin', 'metadata_stamp.xml',
  'financial_ledger_excel.xlsx', 'compromised_module.dll', 'ransom_note.rtf',
  'api_call_history.log', 'fingerprint_scan.png', 'dns_queries.csv'
];

const evidenceTypes: EvidenceType[] = ['CCTV', 'DOCUMENT', 'MOBILE', 'VIDEO', 'AUDIO', 'IMAGE'];

// 2. Generate 50 Cases
const casesList: Case[] = [];

// Seed the 5 primary cases first for continuity
const seedCases: Case[] = [
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
    evidenceIds: []
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
    evidenceIds: []
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
    evidenceIds: []
  },
  {
    id: 'CASE-2026-881Z',
    title: 'Autonomous Transit Control Tampering',
    description: 'Signal interception and route spoofing of drone delivery corridors.',
    status: 'COURT_HEARING',
    priority: 'MEDIUM',
    assignedOfficer: 'Officer Tyler Vance',
    badgeNumber: 'SH-1029',
    department: 'Tactical Cyber Patrol',
    createdAt: '2026-07-09T11:22:00Z',
    evidenceIds: []
  },
  {
    id: 'CASE-2026-112B',
    title: 'High-Frequency Trading API Exploitation',
    description: 'Corporate insider leak of proprietary trading algorithm sandbox parameters.',
    status: 'CLOSED',
    priority: 'LOW',
    assignedOfficer: 'Analyst Sarah Chen',
    badgeNumber: 'SH-4412',
    department: 'Financial Cyber Crimes Group',
    createdAt: '2026-07-01T16:00:00Z',
    evidenceIds: []
  }
];

casesList.push(...seedCases);

// Generate remaining 45 cases
const priorities: CasePriority[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
const statuses: CaseStatus[] = ['ACTIVE', 'UNDER_REVIEW', 'COURT_HEARING', 'CLOSED'];

for (let i = 6; i <= 50; i++) {
  const topic = caseTopics[i % caseTopics.length];
  const officer = mockOfficers[i % mockOfficers.length];
  const caseId = `CASE-2026-${100 + i}X`;
  
  casesList.push({
    id: caseId,
    title: `${topic.title} [Sector ${10 + i}]`,
    description: `${topic.desc} Comprehensive evidence logs anchored in hyper-secure blockchain ledgers.`,
    status: statuses[i % statuses.length],
    priority: priorities[i % priorities.length],
    assignedOfficer: officer.name,
    badgeNumber: officer.badgeNumber,
    department: officer.department,
    createdAt: new Date(Date.now() - (60 - i) * 24 * 60 * 60 * 1000).toISOString(),
    evidenceIds: []
  });
}

export const initialCases = casesList;

// 3. Generate 150 Evidence Records
const evidenceList: EvidenceItem[] = [];

// Base initial evidence items
const seedEvidence: EvidenceItem[] = [
  {
    id: 'EVID-001',
    caseId: 'CASE-2026-991A',
    name: 'north_vault_corridor_cctv.mp4',
    type: 'CCTV',
    size: 245100000,
    sha256: '7e4c5b1b4d89a1c8ee1042789f41d99ee70172bfac23b9d19a3b8d7e6c518bf9',
    uploadedAt: '2026-07-02T11:05:00Z',
    uploadedBy: 'Det. Marcus Ramirez',
    badgeNumber: 'SH-9941',
    status: 'SECURED',
    metadata: {
      deviceModel: 'Hikvision Core-X9',
      gpsCoordinates: '40.7128° N, 74.0060° W',
      captureDate: '2026-07-01T23:15:22Z',
      duration: '04:12',
      resolution: '1920x1080 @ 30fps',
      sourcePlatform: 'Vault DVR System',
      fileExtension: 'mp4'
    },
    blockNumber: 10420
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
    metadata: {
      deviceModel: 'Honeywell Control Hub v4',
      gpsCoordinates: '40.7128° N, 74.0060° W',
      captureDate: '2026-07-02T02:00:00Z',
      sourcePlatform: 'Active Directory Exporter',
      fileExtension: 'csv'
    },
    blockNumber: 10421
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
    metadata: {
      deviceModel: 'SCADA Controller RTU-12',
      gpsCoordinates: '41.8781° N, 87.6298° W',
      captureDate: '2026-07-05T05:44:12Z',
      sourcePlatform: 'Wireshark Extraction',
      fileExtension: 'bin'
    },
    blockNumber: 10422
  },
  {
    id: 'EVID-004',
    caseId: 'CASE-2026-104X',
    name: 'scada_network_pcaps.pcap',
    type: 'DOCUMENT',
    size: 512000000,
    sha256: '9e3bf125890fae00bb883bca9bcdd8ee0fa3d002abce8e722df0e104f8dd2e99',
    uploadedAt: '2026-07-05T10:05:00Z',
    uploadedBy: 'Analyst Sarah Chen',
    badgeNumber: 'SH-4412',
    status: 'SECURED',
    metadata: {
      deviceModel: 'Cisco IE-3000 Switch',
      gpsCoordinates: '41.8781° N, 87.6298° W',
      captureDate: '2026-07-05T06:00:00Z',
      sourcePlatform: 'Mirror Port Dump',
      fileExtension: 'pcap'
    },
    blockNumber: 10423
  },
  {
    id: 'EVID-005',
    caseId: 'CASE-2026-552D',
    name: 'manifest_exfil_session.log',
    type: 'DOCUMENT',
    size: 420000,
    sha256: '33a8b4119d2bceee90209cda8118f772e420b991d37449a0b12a68c07e2df9ee',
    uploadedAt: '2026-07-08T15:10:00Z',
    uploadedBy: 'Det. Marcus Ramirez',
    badgeNumber: 'SH-9941',
    status: 'SECURED',
    metadata: {
      deviceModel: 'Fortinet FortiGate 100F',
      gpsCoordinates: '25.7617° N, 80.1918° W',
      captureDate: '2026-07-08T13:02:11Z',
      sourcePlatform: 'Syslog Collector',
      fileExtension: 'log'
    },
    blockNumber: 10424
  },
  {
    id: 'EVID-006',
    caseId: 'CASE-2026-881Z',
    name: 'corridor_interception_audio.wav',
    type: 'AUDIO',
    size: 14200000,
    sha256: 'e99a80e4b8543cda01d14e966bbfbd88c9a3b8da7df899f14022bf228fa8d39c',
    uploadedAt: '2026-07-09T12:00:00Z',
    uploadedBy: 'Officer Tyler Vance',
    badgeNumber: 'SH-1029',
    status: 'SECURED',
    metadata: {
      deviceModel: 'RF Explorer Pro',
      gpsCoordinates: '34.0522° N, 118.2437° W',
      captureDate: '2026-07-09T09:15:30Z',
      duration: '01:22',
      sourcePlatform: 'SDR Recorder Module',
      fileExtension: 'wav'
    },
    blockNumber: 10425
  },
  {
    id: 'EVID-007',
    caseId: 'CASE-2026-112B',
    name: 'leaked_algo_payload.json',
    type: 'DOCUMENT',
    size: 95000,
    sha256: '772b118fbda8e77a28bbdf92caecdd8ee09bbca198bb4b93f18e9c07e99ff1e2',
    uploadedAt: '2026-07-01T17:15:00Z',
    uploadedBy: 'Analyst Sarah Chen',
    badgeNumber: 'SH-4412',
    status: 'SECURED',
    metadata: {
      deviceModel: 'Forensic Workstation-01',
      gpsCoordinates: '40.7128° N, 74.0060° W',
      captureDate: '2026-07-01T16:30:00Z',
      sourcePlatform: 'Git Repository Snapshot',
      fileExtension: 'json'
    },
    blockNumber: 10419
  }
];

evidenceList.push(...seedEvidence);

// Generate remaining 143 evidence items and distribute them among the 50 cases
for (let i = 8; i <= 150; i++) {
  const caseObj = initialCases[i % initialCases.length];
  const officer = mockOfficers[i % mockOfficers.length];
  const fileDesc = fileNames[i % fileNames.length];
  const fileExt = fileDesc.split('.')[1];
  const type = evidenceTypes[i % evidenceTypes.length];
  const size = Math.floor(1024 * 50 + (i * 1234567) % (1024 * 1024 * 100)); // random sizes from 50KB to 100MB
  const evId = `EVID-${100 + i}`;
  const blockNum = 10425 + i; // sequentially align block height

  const item: EvidenceItem = {
    id: evId,
    caseId: caseObj.id,
    name: `${evId.toLowerCase()}_${fileDesc}`,
    type,
    size,
    sha256: generateMockHash(`${evId}_${fileDesc}_${size}`),
    uploadedAt: new Date(Date.now() - (60 - (i % 60)) * 24 * 60 * 60 * 1000 + (i * 1000)).toISOString(),
    uploadedBy: officer.name,
    badgeNumber: officer.badgeNumber,
    status: 'SECURED',
    metadata: {
      deviceModel: 'Federal Forensic Station Suite 2',
      gpsCoordinates: '38.9072° N, 77.0369° W',
      captureDate: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000).toISOString(),
      fileExtension: fileExt,
      sourcePlatform: 'State Cryptographic Vault'
    },
    blockNumber: blockNum
  };

  evidenceList.push(item);
  
  // Link to case
  caseObj.evidenceIds.push(evId);
}

// Link base evidence to base cases
initialCases[0].evidenceIds = ['EVID-001', 'EVID-002'];
initialCases[1].evidenceIds = ['EVID-003', 'EVID-004'];
initialCases[2].evidenceIds = ['EVID-005'];
initialCases[3].evidenceIds = ['EVID-006'];
initialCases[4].evidenceIds = ['EVID-007'];

export const initialEvidence = evidenceList;

// 4. Generate 150 Blockchain Blocks
// Ensure they form a 100% correct, unbroken cryptographic linked-list!
const blocksList: Block[] = [];

let lastHash = '0000000000000000000000000000000000000000000000000000000000000000';

for (let i = 0; i < 150; i++) {
  const blockNum = 10419 + i;
  
  // Map this block to an evidence record if possible, otherwise use dummy forensic anchor
  const linkedEvidence = initialEvidence[i % initialEvidence.length];
  const linkedCase = initialCases.find(c => c.id === linkedEvidence.caseId) || initialCases[0];
  
  const content = `${blockNum}${lastHash}${linkedEvidence.sha256}${linkedEvidence.caseId}${linkedEvidence.id}${linkedEvidence.uploadedBy}${linkedEvidence.uploadedAt}`;
  const currentHash = generateMockHash(content);

  blocksList.push({
    blockNumber: blockNum,
    previousHash: lastHash,
    currentHash,
    timestamp: linkedEvidence.uploadedAt,
    caseId: linkedEvidence.caseId,
    caseTitle: linkedCase.title,
    evidenceId: linkedEvidence.id,
    evidenceName: linkedEvidence.name,
    officer: linkedEvidence.uploadedBy,
    badgeNumber: linkedEvidence.badgeNumber,
    fileHash: linkedEvidence.sha256,
    status: 'STABLE',
    nonce: 10000 + (i * 123) % 90000
  });

  lastHash = currentHash;
}

export const initialBlocks = blocksList;

// 5. Generate 300 Chain of Custody Audit Logs
const auditLogsList: AuditLog[] = [];

const actions: ('INGESTION' | 'ACCESS' | 'DOWNLOAD' | 'TRANSFER' | 'COURT_VERIFICATION' | 'ARCHIVE')[] = [
  'INGESTION', 'ACCESS', 'DOWNLOAD', 'TRANSFER', 'COURT_VERIFICATION', 'ARCHIVE'
];
const locations = [
  'Cyber Forensics Lab-01', 'Secure Transit Storage Locker',
  'Federal District Court 4B', 'DA Legal Records Office',
  'Mobile Forensic Unit Terminal', 'FBI Secure Ingestion Point',
  'State Evidence Storage Depository'
];

// Ingestion logs for all 150 evidence items
initialEvidence.forEach((ev, idx) => {
  const linkedBlock = initialBlocks.find(b => b.evidenceId === ev.id) || initialBlocks[0];
  auditLogsList.push({
    id: `LOG-INGEST-${100 + idx}`,
    evidenceId: ev.id,
    timestamp: ev.uploadedAt,
    officer: ev.uploadedBy,
    badgeNumber: ev.badgeNumber,
    action: 'INGESTION',
    location: locations[idx % locations.length],
    status: 'VERIFIED',
    blockNumber: ev.blockNumber,
    txHash: linkedBlock.currentHash,
    details: `Cryptographic ingestion signature locked. File "${ev.name}" uploaded successfully by ${ev.uploadedBy}.`
  });
});

// Generate another 150 logs to complete 300 logs (representing actions like ACCESS, DOWNLOAD, TRANSFER, COURT_VERIFICATION)
for (let i = 1; i <= 150; i++) {
  const ev = initialEvidence[i % initialEvidence.length];
  const officer = mockOfficers[i % mockOfficers.length];
  const action = actions[i % actions.length];
  const linkedBlock = initialBlocks.find(b => b.evidenceId === ev.id) || initialBlocks[0];

  auditLogsList.push({
    id: `LOG-ACT-${200 + i}`,
    evidenceId: ev.id,
    // Slightly after the ingestion time
    timestamp: new Date(new Date(ev.uploadedAt).getTime() + i * 4 * 60 * 60 * 1000).toISOString(),
    officer: officer.name,
    badgeNumber: officer.badgeNumber,
    action,
    location: locations[(i + 3) % locations.length],
    status: 'VERIFIED',
    blockNumber: ev.blockNumber,
    txHash: generateMockHash(`${ev.id}_action_${i}`),
    details: `Asset status check. Action: ${action}. Target record "${ev.name}" read and signature validated in block #${ev.blockNumber}.`
  });
}

// Sort chronological (newest first)
export const initialAuditLogs = auditLogsList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

// 6. Notifications
export const initialNotifications: SystemNotification[] = [
  {
    id: 'NOT-001',
    type: 'SUCCESS',
    title: 'Block Mined Successfully',
    message: 'Evidence "north_vault_corridor_cctv.mp4" has been permanently anchored in block #10420.',
    timestamp: new Date().toISOString(),
    read: false,
    blockNumber: 10420
  },
  {
    id: 'NOT-002',
    type: 'INFO',
    title: 'Courtroom Verification Passed',
    message: 'Judge Thomas Reyes executed high-speed hash check on "vault_access_logs.csv". Match: 100%.',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    read: false
  },
  {
    id: 'NOT-003',
    type: 'WARNING',
    title: 'Consensus Delay Warning',
    message: 'Private node validation consensus latency rose briefly to 240ms. Auto-recovery active.',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    read: true
  },
  {
    id: 'NOT-004',
    type: 'SUCCESS',
    title: 'Consensus Network Fully Sync\'d',
    message: 'All 150 blocks validated. Integrity scan shows 100% cryptographic ledger consistency.',
    timestamp: new Date(Date.now() - 60 * 1000).toISOString(),
    read: false
  }
];
