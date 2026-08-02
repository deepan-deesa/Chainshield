import { supabase } from './supabaseClient';
import { Case, EvidenceItem, Block, AuditLog, SystemNotification } from '../types';

const STORAGE_KEYS = {
  CASES: 'chainshield_db_cases',
  EVIDENCE: 'chainshield_db_evidence',
  BLOCKS: 'chainshield_db_blocks',
  LOGS: 'chainshield_db_logs',
  NOTIFICATIONS: 'chainshield_db_notifications',
};

// Local storage helper functions to ensure offline/resilient persistence
function getLocalArray<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error(`[ChainShield DB] Local storage read error for ${key}:`, e);
    return [];
  }
}

function saveLocalArray<T>(key: string, data: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`[ChainShield DB] Local storage write error for ${key}:`, e);
  }
}

/**
 * Load all user data from Supabase Database tables, falling back to local database storage
 */
export async function loadUserDataFromDB(userId?: string): Promise<{
  cases: Case[];
  evidence: EvidenceItem[];
  blocks: Block[];
  logs: AuditLog[];
  notifications: SystemNotification[];
}> {
  console.log('[ChainShield DB] Fetching user database records for ID:', userId);

  let localCases = getLocalArray<Case>(STORAGE_KEYS.CASES);
  let localEvidence = getLocalArray<EvidenceItem>(STORAGE_KEYS.EVIDENCE);
  let localBlocks = getLocalArray<Block>(STORAGE_KEYS.BLOCKS);
  let localLogs = getLocalArray<AuditLog>(STORAGE_KEYS.LOGS);
  let localNotifications = getLocalArray<SystemNotification>(STORAGE_KEYS.NOTIFICATIONS);

  if (!userId) {
    return {
      cases: localCases,
      evidence: localEvidence,
      blocks: localBlocks,
      logs: localLogs,
      notifications: localNotifications,
    };
  }

  try {
    // 1. Fetch Cases
    const { data: dbCases } = await supabase.from('Case').select('*').eq('user_id', userId);
    if (dbCases && dbCases.length > 0) {
      localCases = dbCases.map((c: any) => ({
        id: c.id,
        title: c.title,
        description: c.description || '',
        status: c.status || 'ACTIVE',
        priority: c.priority || 'HIGH',
        assignedOfficer: c.officerName || c.assignedOfficer || 'Investigator',
        badgeNumber: c.badgeNumber || '',
        department: c.department || 'Federal Cyber Crime Division',
        createdAt: c.createdAt || c.created_at || new Date().toISOString(),
        evidenceIds: c.evidenceIds || []
      }));
      saveLocalArray(STORAGE_KEYS.CASES, localCases);
    }

    // 2. Fetch Evidence items (SHA-256 records)
    const { data: dbEvidence } = await supabase.from('Evidence').select('*').eq('user_id', userId);
    if (dbEvidence && dbEvidence.length > 0) {
      localEvidence = dbEvidence.map((e: any) => ({
        id: e.id,
        caseId: e.caseId,
        name: e.name,
        type: e.type || 'DOCUMENT',
        size: e.size || 0,
        sha256: e.sha256,
        uploadedAt: e.uploadedAt || e.uploadDate || e.created_at || new Date().toISOString(),
        uploadedBy: e.uploadedBy || e.officerName || 'Investigator',
        badgeNumber: e.badgeNumber || '',
        status: e.status || 'SECURED',
        metadata: e.metadata || { fileExtension: e.name ? e.name.split('.').pop() || 'bin' : 'bin' },
        blockNumber: e.blockNumber || 10426
      }));
      saveLocalArray(STORAGE_KEYS.EVIDENCE, localEvidence);
    }

    // 3. Fetch Blockchain Blocks
    const { data: dbBlocks } = await supabase.from('Block').select('*').eq('user_id', userId);
    if (dbBlocks && dbBlocks.length > 0) {
      localBlocks = dbBlocks.map((b: any) => ({
        blockNumber: b.blockNumber,
        previousHash: b.previousHash,
        currentHash: b.currentHash,
        timestamp: b.timestamp || b.created_at || new Date().toISOString(),
        caseId: b.caseId,
        caseTitle: b.caseTitle || 'Security Locker',
        evidenceId: b.evidenceId,
        evidenceName: b.evidenceName || 'Ingested Asset',
        officer: b.officer || 'Investigator',
        badgeNumber: b.badgeNumber || '',
        fileHash: b.fileHash,
        status: b.status || 'STABLE',
        nonce: b.nonce || 10000
      }));
      saveLocalArray(STORAGE_KEYS.BLOCKS, localBlocks);
    }

    // 4. Fetch Chain of Custody Audit Logs
    const { data: dbLogs } = await supabase.from('ChainOfCustodyLog').select('*').eq('user_id', userId);
    if (dbLogs && dbLogs.length > 0) {
      localLogs = dbLogs.map((l: any) => ({
        id: l.id,
        evidenceId: l.evidenceId,
        timestamp: l.timestamp || l.created_at || new Date().toISOString(),
        officer: l.officer,
        badgeNumber: l.badgeNumber,
        action: l.action || 'INGESTION',
        location: l.location || 'Federal Evidence Enclave',
        status: l.status || 'VERIFIED',
        blockNumber: l.blockNumber || 10426,
        txHash: l.txHash || btoa(l.id).substring(0, 32),
        details: l.details || ''
      }));
      saveLocalArray(STORAGE_KEYS.LOGS, localLogs);
    }

    // 5. Fetch System Notifications
    const { data: dbNotifications } = await supabase.from('Notification').select('*').eq('user_id', userId);
    if (dbNotifications && dbNotifications.length > 0) {
      localNotifications = dbNotifications.map((n: any) => ({
        id: n.id,
        type: n.type || 'INFO',
        title: n.title,
        message: n.message,
        timestamp: n.timestamp || n.created_at || new Date().toISOString(),
        read: n.read || false,
        blockNumber: n.blockNumber
      }));
      saveLocalArray(STORAGE_KEYS.NOTIFICATIONS, localNotifications);
    }
  } catch (err) {
    console.warn('[ChainShield DB] Supabase table load notice (using resilient local database):', err);
  }

  return {
    cases: localCases,
    evidence: localEvidence,
    blocks: localBlocks,
    logs: localLogs,
    notifications: localNotifications,
  };
}

/**
 * Save a new Case to the database
 */
export async function saveCaseToDB(newCase: Case, userId?: string) {
  // Update local DB storage immediately
  const current = getLocalArray<Case>(STORAGE_KEYS.CASES);
  saveLocalArray(STORAGE_KEYS.CASES, [newCase, ...current]);

  if (!userId) return;

  try {
    await supabase.from('Case').upsert({
      id: newCase.id,
      title: newCase.title,
      description: newCase.description,
      status: newCase.status,
      priority: newCase.priority,
      officerName: newCase.assignedOfficer,
      badgeNumber: newCase.badgeNumber,
      category: 'GENERAL_INVESTIGATION',
      user_id: userId,
      createdAt: newCase.createdAt
    });
    console.log(`[ChainShield DB] Case ${newCase.id} successfully saved to database.`);
  } catch (err) {
    console.warn(`[ChainShield DB] Notice saving Case ${newCase.id} to Supabase:`, err);
  }
}

/**
 * Save an Evidence item (with SHA-256 hash) to the database
 */
export async function saveEvidenceToDB(newEvidence: EvidenceItem, userId?: string) {
  const current = getLocalArray<EvidenceItem>(STORAGE_KEYS.EVIDENCE);
  saveLocalArray(STORAGE_KEYS.EVIDENCE, [newEvidence, ...current]);

  if (!userId) return;

  try {
    await supabase.from('Evidence').upsert({
      id: newEvidence.id,
      caseId: newEvidence.caseId,
      name: newEvidence.name,
      type: newEvidence.type,
      size: newEvidence.size,
      sha256: newEvidence.sha256,
      status: newEvidence.status,
      uploadedBy: newEvidence.uploadedBy,
      badgeNumber: newEvidence.badgeNumber,
      metadata: newEvidence.metadata,
      blockNumber: newEvidence.blockNumber,
      user_id: userId,
      uploadedAt: newEvidence.uploadedAt
    });
    console.log(`[ChainShield DB] Evidence ${newEvidence.id} (SHA-256: ${newEvidence.sha256}) saved to database.`);
  } catch (err) {
    console.warn(`[ChainShield DB] Notice saving Evidence ${newEvidence.id} to Supabase:`, err);
  }
}

/**
 * Save a Blockchain Block record to the database
 */
export async function saveBlockToDB(newBlock: Block, userId?: string) {
  const current = getLocalArray<Block>(STORAGE_KEYS.BLOCKS);
  saveLocalArray(STORAGE_KEYS.BLOCKS, [...current, newBlock]);

  if (!userId) return;

  try {
    await supabase.from('Block').upsert({
      blockNumber: newBlock.blockNumber,
      previousHash: newBlock.previousHash,
      currentHash: newBlock.currentHash,
      timestamp: newBlock.timestamp,
      caseId: newBlock.caseId,
      caseTitle: newBlock.caseTitle,
      evidenceId: newBlock.evidenceId,
      evidenceName: newBlock.evidenceName,
      officer: newBlock.officer,
      badgeNumber: newBlock.badgeNumber,
      fileHash: newBlock.fileHash,
      status: newBlock.status,
      nonce: newBlock.nonce,
      user_id: userId
    });
    console.log(`[ChainShield DB] Blockchain Block #${newBlock.blockNumber} saved to database.`);
  } catch (err) {
    console.warn(`[ChainShield DB] Notice saving Block #${newBlock.blockNumber} to Supabase:`, err);
  }
}

/**
 * Save a Chain of Custody Audit Log to the database
 */
export async function saveAuditLogToDB(newLog: AuditLog, userId?: string) {
  const current = getLocalArray<AuditLog>(STORAGE_KEYS.LOGS);
  saveLocalArray(STORAGE_KEYS.LOGS, [newLog, ...current]);

  if (!userId) return;

  try {
    await supabase.from('ChainOfCustodyLog').upsert({
      id: newLog.id,
      evidenceId: newLog.evidenceId,
      timestamp: newLog.timestamp,
      officer: newLog.officer,
      badgeNumber: newLog.badgeNumber,
      action: newLog.action,
      location: newLog.location,
      status: newLog.status,
      blockNumber: newLog.blockNumber,
      txHash: newLog.txHash,
      details: newLog.details,
      user_id: userId
    });
    console.log(`[ChainShield DB] Audit log ${newLog.id} (${newLog.action}) saved to database.`);
  } catch (err) {
    console.warn(`[ChainShield DB] Notice saving AuditLog ${newLog.id} to Supabase:`, err);
  }
}

/**
 * Save a System Notification to the database
 */
export async function saveNotificationToDB(notification: SystemNotification, userId?: string) {
  const current = getLocalArray<SystemNotification>(STORAGE_KEYS.NOTIFICATIONS);
  saveLocalArray(STORAGE_KEYS.NOTIFICATIONS, [notification, ...current]);

  if (!userId) return;

  try {
    await supabase.from('Notification').upsert({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      timestamp: notification.timestamp,
      read: notification.read,
      blockNumber: notification.blockNumber,
      user_id: userId
    });
  } catch (err) {
    console.warn(`[ChainShield DB] Notice saving Notification to Supabase:`, err);
  }
}

/**
 * Clear all local and database records for a clean workspace reset
 */
export async function clearAllDBData(userId?: string) {
  saveLocalArray(STORAGE_KEYS.CASES, []);
  saveLocalArray(STORAGE_KEYS.EVIDENCE, []);
  saveLocalArray(STORAGE_KEYS.BLOCKS, []);
  saveLocalArray(STORAGE_KEYS.LOGS, []);
  saveLocalArray(STORAGE_KEYS.NOTIFICATIONS, []);

  if (!userId) return;

  try {
    await Promise.all([
      supabase.from('Evidence').delete().eq('user_id', userId),
      supabase.from('Block').delete().eq('user_id', userId),
      supabase.from('ChainOfCustodyLog').delete().eq('user_id', userId),
      supabase.from('Case').delete().eq('user_id', userId),
      supabase.from('Notification').delete().eq('user_id', userId)
    ]);
    console.log('[ChainShield DB] All database records successfully purged for user ID:', userId);
  } catch (err) {
    console.warn('[ChainShield DB] Purge database records notice:', err);
  }
}
