/**
 * Role management utilities
 * Handles role validation and mapping
 */

export interface Role {
  id: string;
  name: 'admin' | 'partner' | 'buyer';
}

/**
 * Role mapping for validation (numeric IDs)
 */
export const ROLE_MAPPING: { [key: string]: Role } = {
  '1': { id: '1', name: 'admin' },
  '2': { id: '2', name: 'partner' },
  '3': { id: '3', name: 'buyer' }
};

/**
 * Direct role name mapping
 */
export const ROLE_NAMES = ['admin', 'partner', 'buyer'] as const;
export type RoleName = typeof ROLE_NAMES[number];

/**
 * Check if a role ID or name corresponds to admin role
 * @param roleId - Role ID or name to check
 * @returns true if role is admin
 */
export function isAdminRole(roleId: string): boolean {
  // Check if it's a direct role name
  if (roleId === 'admin') return true;
  
  // Check if it's a numeric ID
  const role = ROLE_MAPPING[roleId];
  return role?.name === 'admin';
}

/**
 * Get role name from role ID or return the role name if already a string
 * @param roleId - Role ID or name to get name for
 * @returns Role name or undefined if not found
 */
export function getRoleName(roleId: string): string | undefined {
  // If it's already a role name, return it
  if (ROLE_NAMES.includes(roleId as RoleName)) {
    return roleId;
  }
  
  // Check if it's a numeric ID
  return ROLE_MAPPING[roleId]?.name;
}

/**
 * Get role object from role ID
 * @param roleId - Role ID to get role for
 * @returns Role object or undefined if not found
 */
export function getRole(roleId: string): Role | undefined {
  // If it's already a role name, create a role object
  if (ROLE_NAMES.includes(roleId as RoleName)) {
    return { id: roleId, name: roleId as RoleName };
  }
  
  // Check if it's a numeric ID
  return ROLE_MAPPING[roleId];
}

/**
 * Validate if user has access based on role
 * @param roleId - User's role ID or name
 * @param requiredRole - Required role name
 * @returns true if user has required role
 */
export function hasRole(roleId: string, requiredRole: 'admin' | 'partner' | 'buyer'): boolean {
  // If it's already a role name, direct comparison
  if (ROLE_NAMES.includes(roleId as RoleName)) {
    return roleId === requiredRole;
  }
  
  // Check if it's a numeric ID
  const role = ROLE_MAPPING[roleId];
  return role?.name === requiredRole;
}

/**
 * Check if user can access admin features
 * @param roleId - User's role ID or name
 * @returns true if user is admin
 */
export function canAccessAdmin(roleId: string): boolean {
  return isAdminRole(roleId);
} 