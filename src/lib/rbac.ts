// src/lib/rbac.ts
import { AppRole } from '@/types/database.types';

export interface UserPermissionContext {
  role?: AppRole | string;
  isSuperAdmin?: boolean;
  permissions: string[]; // Dynamically loaded from database (e.g. ['finance:expense:create', 'logistics:*'])
  assignedWarehouseId?: string | null;
}

/**
 * Checks if a user has permission to execute a specific action.
 * Retains wildcard support (e.g., 'finance:*' grants access to 'finance:expense:create').
 */
export function hasPermission(
  userContext: UserPermissionContext,
  requiredPermission: string
): boolean {
  // 1. Super Admin (You) or ROLE_ADMIN has access to everything
  if (userContext.isSuperAdmin || userContext.role === 'ROLE_ADMIN') {
    return true;
  }

  // 2. Check if the user's active permissions match the required action
  return userContext.permissions.some((perm) => {
    // Exact match (e.g., 'finance:expense:create')
    if (perm === requiredPermission || perm === '*') return true;

    // Wildcard match (e.g., 'finance:*' matching 'finance:expense:create')
    if (perm.endsWith(':*')) {
      const scope = perm.split(':')[0];
      return requiredPermission.startsWith(`${scope}:`);
    }

    return false;
  });
}

/**
 * Checks if a user has authority over a specific warehouse/facility
 */
export function canAccessWarehouse(
  userContext: UserPermissionContext,
  targetWarehouseId: string
): boolean {
  if (userContext.isSuperAdmin || userContext.role === 'ROLE_ADMIN') return true;

  // Check general warehouse permission first
  if (!hasPermission(userContext, 'warehouse:stock:manage')) return false;

  // If user is scoped to a single warehouse, ensure IDs match
  if (userContext.assignedWarehouseId) {
    return userContext.assignedWarehouseId === targetWarehouseId;
  }

  return true;
}