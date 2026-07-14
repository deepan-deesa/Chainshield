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
import { supabase } from '../../database/supabase';
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
    createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString(),
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
    uploadedAt: (e.uploadDate || e.createdAt) ? new Date(e.uploadDate || e.createdAt).toISOString() : new Date().toISOString(),
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
    timestamp: l.timestamp ? new Date(l.timestamp).toISOString() : new Date().toISOString(),
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

// 1. Supabase Officer Repository
export class SupabaseOfficerRepository implements IOfficerRepository {
  async findById(id: string): Promise<OfficerDTO | null> {
    const { data, error } = await supabase
      .from('Officer')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      badgeNumber: data.badgeNumber,
      name: data.name,
      email: data.email,
      role: data.role as any,
      nodeCount: data.nodeCount,
      createdAt: new Date(data.createdAt).toISOString()
    };
  }

  async findByBadgeNumber(badgeNumber: string): Promise<OfficerDTO | null> {
    const { data, error } = await supabase
      .from('Officer')
      .select('*')
      .eq('badgeNumber', badgeNumber)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      badgeNumber: data.badgeNumber,
      name: data.name,
      email: data.email,
      role: data.role as any,
      nodeCount: data.nodeCount,
      createdAt: new Date(data.createdAt).toISOString()
    };
  }

  async findByEmail(email: string): Promise<OfficerDTO | null> {
    const { data, error } = await supabase
      .from('Officer')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      badgeNumber: data.badgeNumber,
      name: data.name,
      email: data.email,
      role: data.role as any,
      nodeCount: data.nodeCount,
      createdAt: new Date(data.createdAt).toISOString()
    };
  }

  async getPasswordHashByBadge(badgeNumber: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('Officer')
      .select('passwordHash')
      .eq('badgeNumber', badgeNumber)
      .maybeSingle();

    if (error) throw error;
    return data ? data.passwordHash : null;
  }

  async create(data: any): Promise<OfficerDTO> {
    const id = data.id || generateId('USR');
    const { data: inserted, error } = await supabase
      .from('Officer')
      .insert({
        id,
        badgeNumber: data.badgeNumber,
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
        role: data.role || 'INVESTIGATOR',
        nodeCount: data.nodeCount || 8
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: inserted.id,
      badgeNumber: inserted.badgeNumber,
      name: inserted.name,
      email: inserted.email,
      role: inserted.role as any,
      nodeCount: inserted.nodeCount,
      createdAt: new Date(inserted.createdAt).toISOString()
    };
  }

  async update(id: string, data: any): Promise<OfficerDTO> {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.passwordHash !== undefined) updateData.passwordHash = data.passwordHash;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.nodeCount !== undefined) updateData.nodeCount = data.nodeCount;

    const { data: updated, error } = await supabase
      .from('Officer')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: updated.id,
      badgeNumber: updated.badgeNumber,
      name: updated.name,
      email: updated.email,
      role: updated.role as any,
      nodeCount: updated.nodeCount,
      createdAt: new Date(updated.createdAt).toISOString()
    };
  }
}

// 2. Supabase Case Repository
export class SupabaseCaseRepository implements ICaseRepository {
  async findById(id: string): Promise<CaseDTO | null> {
    const { data, error } = await supabase
      .from('Case')
      .select('*, officer:Officer(*), evidence:Evidence(id)')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return mapCaseToDTO(data);
  }

  async findAll(options?: { search?: string; status?: string; priority?: string; limit?: number; offset?: number }): Promise<CaseDTO[]> {
    let query = supabase
      .from('Case')
      .select('*, officer:Officer(*), evidence:Evidence(id)');

    if (options?.status) {
      query = query.eq('status', options.status);
    }
    if (options?.priority) {
      query = query.eq('priority', options.priority);
    }
    if (options?.search) {
      query = query.or(`id.ilike.%${options.search}%,title.ilike.%${options.search}%,description.ilike.%${options.search}%`);
    }

    query = query.order('createdAt', { ascending: false });

    const limit = options?.limit || 10;
    const offset = options?.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map(mapCaseToDTO);
  }

  async create(data: any): Promise<CaseDTO> {
    const id = data.id || generateId('CASE');
    
    // Look up assigned officer by badge number if any
    let officerId = null;
    if (data.badgeNumber) {
      const { data: o } = await supabase
        .from('Officer')
        .select('id')
        .eq('badgeNumber', data.badgeNumber)
        .maybeSingle();
      if (o) officerId = o.id;
    }

    const { data: inserted, error } = await supabase
      .from('Case')
      .insert({
        id,
        title: data.title,
        description: data.description,
        category: data.category || 'General',
        status: data.status || 'ACTIVE',
        priority: data.priority || 'MEDIUM',
        officerName: data.assignedOfficer || 'Unassigned',
        badgeNumber: data.badgeNumber || '',
        officerId
      })
      .select('*, officer:Officer(*), evidence:Evidence(id)')
      .single();

    if (error) throw error;

    return mapCaseToDTO(inserted);
  }

  async update(id: string, data: any): Promise<CaseDTO> {
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.assignedOfficer !== undefined) updateData.officerName = data.assignedOfficer;
    if (data.badgeNumber !== undefined) updateData.badgeNumber = data.badgeNumber;

    if (data.badgeNumber) {
      const { data: o } = await supabase
        .from('Officer')
        .select('id')
        .eq('badgeNumber', data.badgeNumber)
        .maybeSingle();
      if (o) updateData.officerId = o.id;
    }

    const { data: updated, error } = await supabase
      .from('Case')
      .update(updateData)
      .eq('id', id)
      .select('*, officer:Officer(*), evidence:Evidence(id)')
      .single();

    if (error) throw error;

    return mapCaseToDTO(updated);
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('Case')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  async count(options?: { search?: string; status?: string; priority?: string }): Promise<number> {
    let query = supabase
      .from('Case')
      .select('*', { count: 'exact', head: true });

    if (options?.status) {
      query = query.eq('status', options.status);
    }
    if (options?.priority) {
      query = query.eq('priority', options.priority);
    }
    if (options?.search) {
      query = query.or(`id.ilike.%${options.search}%,title.ilike.%${options.search}%,description.ilike.%${options.search}%`);
    }

    const { count, error } = await query;
    if (error) throw error;

    return count || 0;
  }
}

// 3. Supabase Evidence Repository
export class SupabaseEvidenceRepository implements IEvidenceRepository {
  async findById(id: string): Promise<EvidenceDTO | null> {
    const { data, error } = await supabase
      .from('Evidence')
      .select('*, metadata:EvidenceMetadata(*)')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return mapEvidenceToDTO(data);
  }

  async findBySha256(sha256: string): Promise<EvidenceDTO | null> {
    const { data, error } = await supabase
      .from('Evidence')
      .select('*, metadata:EvidenceMetadata(*)')
      .eq('sha256', sha256)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return mapEvidenceToDTO(data);
  }

  async findAll(options?: { caseId?: string; search?: string; type?: string; status?: string; limit?: number; offset?: number }): Promise<EvidenceDTO[]> {
    let query = supabase
      .from('Evidence')
      .select('*, metadata:EvidenceMetadata(*)');

    if (options?.caseId) {
      query = query.eq('caseId', options.caseId);
    }
    if (options?.status) {
      query = query.eq('status', options.status);
    }
    if (options?.type) {
      query = query.eq('type', options.type);
    }
    if (options?.search) {
      query = query.or(`id.ilike.%${options.search}%,name.ilike.%${options.search}%`);
    }

    query = query.order('createdAt', { ascending: false });

    const limit = options?.limit || 10;
    const offset = options?.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map(mapEvidenceToDTO);
  }

  async create(data: any, metadata?: Record<string, string>): Promise<EvidenceDTO> {
    const id = data.id || generateId('EVI');
    
    // Look up officer
    let officerId = null;
    if (data.badgeNumber) {
      const { data: o } = await supabase
        .from('Officer')
        .select('id')
        .eq('badgeNumber', data.badgeNumber)
        .maybeSingle();
      if (o) officerId = o.id;
    }

    const { data: inserted, error } = await supabase
      .from('Evidence')
      .insert({
        id,
        name: data.name,
        type: data.type,
        size: data.size,
        sha256: data.sha256,
        fileUrl: data.fileUrl || null,
        status: data.status || 'SECURE',
        blockNumber: data.blockNumber || null,
        txHash: data.txHash || null,
        officerId,
        officerName: data.uploadedBy || data.officerName || 'Unknown Officer',
        badgeNumber: data.badgeNumber || '',
        caseId: data.caseId
      })
      .select()
      .single();

    if (error) throw error;

    const insertedMetadata: any[] = [];
    if (metadata && Object.keys(metadata).length > 0) {
      const rows = Object.entries(metadata).map(([key, value]) => ({
        id: generateId('META'),
        evidenceId: id,
        key,
        value
      }));

      const { data: metaData, error: metaError } = await supabase
        .from('EvidenceMetadata')
        .insert(rows)
        .select();

      if (metaError) throw metaError;
      if (metaData) insertedMetadata.push(...metaData);
    }

    return mapEvidenceToDTO({ ...inserted, metadata: insertedMetadata });
  }

  async update(id: string, data: any, metadata?: Record<string, string>): Promise<EvidenceDTO> {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.size !== undefined) updateData.size = data.size;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.blockNumber !== undefined) updateData.blockNumber = data.blockNumber;
    if (data.txHash !== undefined) updateData.txHash = data.txHash;
    if (data.fileUrl !== undefined) updateData.fileUrl = data.fileUrl;

    const { data: updated, error } = await supabase
      .from('Evidence')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (metadata && Object.keys(metadata).length > 0) {
      // Clear existing metadata first
      const { error: deleteErr } = await supabase
        .from('EvidenceMetadata')
        .delete()
        .eq('evidenceId', id);

      if (deleteErr) throw deleteErr;

      // Insert new metadata
      const rows = Object.entries(metadata).map(([key, value]) => ({
        id: generateId('META'),
        evidenceId: id,
        key,
        value
      }));

      const { error: insertErr } = await supabase
        .from('EvidenceMetadata')
        .insert(rows);

      if (insertErr) throw insertErr;
    }

    // Retrieve updated metadata
    const { data: newMeta } = await supabase
      .from('EvidenceMetadata')
      .select('*')
      .eq('evidenceId', id);

    return mapEvidenceToDTO({ ...updated, metadata: newMeta || [] });
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('Evidence')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  async count(options?: { caseId?: string; search?: string; type?: string; status?: string }): Promise<number> {
    let query = supabase
      .from('Evidence')
      .select('*', { count: 'exact', head: true });

    if (options?.caseId) {
      query = query.eq('caseId', options.caseId);
    }
    if (options?.status) {
      query = query.eq('status', options.status);
    }
    if (options?.type) {
      query = query.eq('type', options.type);
    }
    if (options?.search) {
      query = query.or(`id.ilike.%${options.search}%,name.ilike.%${options.search}%`);
    }

    const { count, error } = await query;
    if (error) throw error;

    return count || 0;
  }
}

// 4. Supabase Custody Log Repository
export class SupabaseCustodyLogRepository implements ICustodyLogRepository {
  async create(data: any): Promise<CustodyLogDTO> {
    const id = data.id || generateId('LOG');
    
    let officerId = null;
    if (data.badgeNumber) {
      const { data: o } = await supabase
        .from('Officer')
        .select('id')
        .eq('badgeNumber', data.badgeNumber)
        .maybeSingle();
      if (o) officerId = o.id;
    }

    const { data: inserted, error } = await supabase
      .from('ChainOfCustodyLog')
      .insert({
        id,
        evidenceId: data.evidenceId,
        action: data.action,
        officer: data.officer,
        badgeNumber: data.badgeNumber || '',
        location: data.location || 'SECURE LOCKER',
        details: data.details || '',
        status: data.status || 'SECURE',
        blockNumber: data.blockNumber || null,
        txHash: data.txHash || null,
        officerId
      })
      .select()
      .single();

    if (error) throw error;

    return mapCustodyLogToDTO(inserted);
  }

  async findByEvidenceId(evidenceId: string): Promise<CustodyLogDTO[]> {
    const { data, error } = await supabase
      .from('ChainOfCustodyLog')
      .select('*')
      .eq('evidenceId', evidenceId)
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapCustodyLogToDTO);
  }

  async findByOfficerBadge(badgeNumber: string): Promise<CustodyLogDTO[]> {
    const { data, error } = await supabase
      .from('ChainOfCustodyLog')
      .select('*')
      .eq('badgeNumber', badgeNumber)
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapCustodyLogToDTO);
  }

  async findAll(options?: { limit?: number; offset?: number }): Promise<CustodyLogDTO[]> {
    let query = supabase
      .from('ChainOfCustodyLog')
      .select('*')
      .order('timestamp', { ascending: false });

    const limit = options?.limit || 20;
    const offset = options?.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map(mapCustodyLogToDTO);
  }
}

// 5. Supabase Notification Repository
export class SupabaseNotificationRepository implements INotificationRepository {
  async findAll(options?: { limit?: number; offset?: number }): Promise<SystemNotificationDTO[]> {
    let query = supabase
      .from('Notification')
      .select('*')
      .order('timestamp', { ascending: false });

    const limit = options?.limit || 20;
    const offset = options?.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map((n: any) => ({
      id: n.id,
      type: n.type as any,
      title: n.title,
      message: n.message,
      timestamp: new Date(n.timestamp).toISOString(),
      read: n.read,
      blockNumber: n.blockNumber
    }));
  }

  async create(data: any): Promise<SystemNotificationDTO> {
    const id = data.id || generateId('NOTIF');
    const { data: inserted, error } = await supabase
      .from('Notification')
      .insert({
        id,
        type: data.type || 'INFO',
        title: data.title,
        message: data.message,
        read: false,
        blockNumber: data.blockNumber || null
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: inserted.id,
      type: inserted.type as any,
      title: inserted.title,
      message: inserted.message,
      timestamp: new Date(inserted.timestamp).toISOString(),
      read: inserted.read,
      blockNumber: inserted.blockNumber
    };
  }

  async markAsRead(id: string): Promise<SystemNotificationDTO | null> {
    const { data, error } = await supabase
      .from('Notification')
      .update({ read: true })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      type: data.type as any,
      title: data.title,
      message: data.message,
      timestamp: new Date(data.timestamp).toISOString(),
      read: data.read,
      blockNumber: data.blockNumber
    };
  }

  async markAllAsRead(): Promise<boolean> {
    const { error } = await supabase
      .from('Notification')
      .update({ read: true })
      .eq('read', false);

    if (error) throw error;
    return true;
  }

  async clearAll(): Promise<boolean> {
    const { error } = await supabase
      .from('Notification')
      .delete()
      .neq('id', ''); // delete all matching non-empty ID

    if (error) throw error;
    return true;
  }
}

// 6. Supabase Report Repository
export class SupabaseReportRepository implements IReportRepository {
  async create(data: any): Promise<ReportDTO> {
    const id = data.id || generateId('RPT');
    
    let officerId = null;
    if (data.badgeNumber) {
      const { data: o } = await supabase
        .from('Officer')
        .select('id')
        .eq('badgeNumber', data.badgeNumber)
        .maybeSingle();
      if (o) officerId = o.id;
    }

    const { data: inserted, error } = await supabase
      .from('Report')
      .insert({
        id,
        type: data.type,
        title: data.title,
        content: data.content,
        author: data.author,
        badgeNumber: data.badgeNumber || '',
        officerId
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: inserted.id,
      type: inserted.type as any,
      title: inserted.title,
      content: inserted.content,
      author: inserted.author,
      badgeNumber: inserted.badgeNumber,
      createdAt: new Date(inserted.createdAt).toISOString()
    };
  }

  async findAll(options?: { limit?: number; offset?: number }): Promise<ReportDTO[]> {
    let query = supabase
      .from('Report')
      .select('*')
      .order('createdAt', { ascending: false });

    const limit = options?.limit || 20;
    const offset = options?.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map((r: any) => ({
      id: r.id,
      type: r.type as any,
      title: r.title,
      content: r.content,
      author: r.author,
      badgeNumber: r.badgeNumber,
      createdAt: new Date(r.createdAt).toISOString()
    }));
  }

  async findById(id: string): Promise<ReportDTO | null> {
    const { data, error } = await supabase
      .from('Report')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      type: data.type as any,
      title: data.title,
      content: data.content,
      author: data.author,
      badgeNumber: data.badgeNumber,
      createdAt: new Date(data.createdAt).toISOString()
    };
  }
}

// 7. Supabase System Log Repository
export class SupabaseSystemLogRepository implements ISystemLogRepository {
  async create(data: any): Promise<SystemLogDTO> {
    const { data: inserted, error } = await supabase
      .from('SystemLog')
      .insert({
        id: generateId('SYSLOG'),
        level: data.level || 'INFO',
        message: data.message,
        meta: data.meta ? JSON.stringify(data.meta) : null
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: inserted.id,
      level: inserted.level as any,
      message: inserted.message,
      timestamp: new Date(inserted.timestamp).toISOString(),
      meta: inserted.meta
    };
  }

  async findAll(options?: { limit?: number; offset?: number }): Promise<SystemLogDTO[]> {
    let query = supabase
      .from('SystemLog')
      .select('*')
      .order('timestamp', { ascending: false });

    const limit = options?.limit || 20;
    const offset = options?.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map((l: any) => ({
      id: l.id,
      level: l.level as any,
      message: l.message,
      timestamp: new Date(l.timestamp).toISOString(),
      meta: l.meta
    }));
  }
}

// 8. Supabase Block Repository
export class SupabaseBlockRepository implements IBlockRepository {
  async create(block: BlockDTO): Promise<BlockDTO> {
    try {
      const { error } = await supabase
        .from('Block')
        .insert({
          blockNumber: block.blockNumber,
          previousHash: block.previousHash,
          currentHash: block.currentHash,
          fileHash: block.fileHash,
          caseId: block.caseId,
          evidenceId: block.evidenceId,
          officerId: block.officerId,
          timestamp: new Date(block.timestamp).toISOString(),
          nonce: block.nonce,
          status: block.status
        });
      if (error) {
        console.warn('⚠️ Supabase error creating Block:', error.message);
      }
    } catch (e) {
      console.warn('⚠️ Exception in Supabase Block create:', e);
    }
    return block;
  }

  async findAll(options?: { limit?: number; offset?: number; search?: string }): Promise<BlockDTO[]> {
    try {
      let query = supabase
        .from('Block')
        .select('*')
        .order('blockNumber', { ascending: false });

      if (options?.search) {
        query = query.or(`fileHash.ilike.%${options.search}%,caseId.ilike.%${options.search}%,evidenceId.ilike.%${options.search}%`);
      }

      const limit = options?.limit || 100;
      const offset = options?.offset || 0;
      query = query.range(offset, offset + limit - 1);

      const { data, error } = await query;
      if (error) {
        console.warn('⚠️ Supabase error finding Blocks:', error.message);
        return [];
      }

      return (data || []).map((item: any) => ({
        blockNumber: item.blockNumber,
        previousHash: item.previousHash,
        currentHash: item.currentHash,
        fileHash: item.fileHash,
        caseId: item.caseId,
        evidenceId: item.evidenceId,
        officerId: item.officerId,
        timestamp: new Date(item.timestamp).toISOString(),
        nonce: item.nonce,
        status: item.status
      }));
    } catch (e) {
      return [];
    }
  }

  async findLatest(): Promise<BlockDTO | null> {
    try {
      const { data, error } = await supabase
        .from('Block')
        .select('*')
        .order('blockNumber', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.warn('⚠️ Supabase error finding latest Block:', error.message);
        return null;
      }
      if (!data) return null;

      return {
        blockNumber: data.blockNumber,
        previousHash: data.previousHash,
        currentHash: data.currentHash,
        fileHash: data.fileHash,
        caseId: data.caseId,
        evidenceId: data.evidenceId,
        officerId: data.officerId,
        timestamp: new Date(data.timestamp).toISOString(),
        nonce: data.nonce,
        status: data.status
      };
    } catch (e) {
      return null;
    }
  }

  async count(options?: { search?: string }): Promise<number> {
    try {
      let query = supabase
        .from('Block')
        .select('blockNumber', { count: 'exact', head: true });

      if (options?.search) {
        query = query.or(`fileHash.ilike.%${options.search}%,caseId.ilike.%${options.search}%,evidenceId.ilike.%${options.search}%`);
      }

      const { count, error } = await query;
      if (error) {
        console.warn('⚠️ Supabase error counting Blocks:', error.message);
        return 0;
      }
      return count || 0;
    } catch (e) {
      return 0;
    }
  }

  async clearAll(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('Block')
        .delete()
        .neq('blockNumber', -1);
      return !error;
    } catch (e) {
      return false;
    }
  }
}
