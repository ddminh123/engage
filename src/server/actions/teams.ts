import { prisma } from '@/lib/prisma';

// =============================================================================
// DEV MOCK USER - Replace with NextAuth session when auth is implemented
// =============================================================================

export const DEV_USER = {
  id: 'dev-user-001',
  name: 'Dev User',
  email: 'dev@localhost',
};

// =============================================================================
// PERMISSION CHECK
// =============================================================================

export async function checkAccess(
  _userId: string,
  _permission: string
): Promise<boolean> {
  // TODO: Implement permission lookup from Role → Permission table
  // For now, allow all authenticated users
  return true;
}

// =============================================================================
// AUDIT LOGGING
// =============================================================================

export type AuditAction = 'create' | 'update' | 'delete' | 'reorder';

export interface AuditLogData {
  userId: string;
  userName: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  changes?: Record<string, { old: unknown; new: unknown }> | null;
}

export async function logAudit(data: AuditLogData): Promise<void> {
  await prisma.auditLog.create({
    data: {
      user_id: data.userId,
      user_name: data.userName,
      action: data.action,
      entity_type: data.entityType,
      entity_id: data.entityId,
      changes: data.changes ? JSON.parse(JSON.stringify(data.changes)) : undefined,
    },
  });
}
