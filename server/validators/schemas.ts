import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  badgeNumber: z.string().min(3, 'Badge number must be at least 3 characters'),
  role: z.enum(['EVIDENCE_ADMIN', 'FORENSIC_ANALYST', 'INVESTIGATING_OFFICER', 'ADMIN']).default('INVESTIGATING_OFFICER'),
  department: z.string().min(2, 'Department must be at least 2 characters'),
  nodeCount: z.number().int().min(1).max(100).optional().default(8)
});

export const LoginSchema = z.object({
  badgeNumber: z.string().min(3, 'Badge number is required'),
  password: z.string().min(4, 'Password is required')
});

export const CreateCaseSchema = z.object({
  id: z.string().optional(), // Custom ID if provided (e.g. CASE-1042)
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  category: z.string().min(2, 'Category is required'),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).default('MEDIUM'),
  status: z.enum(['ACTIVE', 'UNDER_REVIEW', 'COURT_HEARING', 'CLOSED']).default('ACTIVE'),
  assignedOfficer: z.string().min(2, 'Assigned officer is required'),
  badgeNumber: z.string().min(3, 'Officer badge number is required'),
  department: z.string().min(2, 'Department is required')
});

export const UpdateCaseSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(5).optional(),
  status: z.enum(['ACTIVE', 'UNDER_REVIEW', 'COURT_HEARING', 'CLOSED']).optional(),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
  assignedOfficer: z.string().min(2).optional(),
  badgeNumber: z.string().min(3).optional()
});

export const IngestEvidenceSchema = z.object({
  id: z.string().optional(), // Custom ID if provided
  caseId: z.string().min(3, 'Case ID is required'),
  name: z.string().min(2, 'Evidence name is required'),
  type: z.enum(['VIDEO', 'IMAGE', 'AUDIO', 'DOCUMENT', 'CCTV', 'MOBILE', 'OTHER']).default('DOCUMENT'),
  size: z.number().int().positive('Size must be a positive integer'),
  sha256: z.string().length(64, 'SHA-256 hash must be exactly 64 characters'),
  status: z.enum(['SECURED', 'VERIFIED', 'TAMPERED']).default('SECURED'),
  metadata: z.record(z.string(), z.string()).optional().default({})
});

export const UpdateEvidenceSchema = z.object({
  name: z.string().min(2).optional(),
  status: z.enum(['SECURED', 'VERIFIED', 'TAMPERED']).optional(),
  metadata: z.record(z.string(), z.string()).optional()
});

export const AddCustodyLogSchema = z.object({
  id: z.string().optional(),
  action: z.enum(['INGESTION', 'ACCESS', 'DOWNLOAD', 'TRANSFER', 'COURT_VERIFICATION', 'ARCHIVE']),
  location: z.string().min(2, 'Location is required'),
  details: z.string().min(5, 'Details are required'),
  status: z.enum(['VERIFIED', 'COMPROMISED', 'PENDING']).default('VERIFIED')
});

export const CreateReportSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['EVIDENCE', 'CASE', 'BLOCKCHAIN', 'VERIFICATION']),
  title: z.string().min(3, 'Title is required'),
  content: z.string().min(1, 'Content is required') // Stringified JSON or long form text
});

export const SystemLogSchema = z.object({
  level: z.enum(['INFO', 'WARN', 'ERROR']),
  message: z.string().min(1),
  meta: z.string().optional()
});
