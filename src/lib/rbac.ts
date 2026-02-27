import { getServerSession } from "next-auth/next";
import { authOptions, type UserRole, type ExtendedUser } from "./auth";

/**
 * Role hierarchy definition
 * Higher number = more permissions
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  SUPER_ADMIN: 100,
  ADMIN: 50,
  USER: 10,
};

/**
 * Role display names for UI
 */
export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  USER: "User",
};

/**
 * Role descriptions
 */
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  SUPER_ADMIN: "Full system access with all administrative privileges",
  ADMIN: "Administrative access with limited system controls",
  USER: "Basic user access with standard features",
};

/**
 * Permission definitions by role
 */
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  SUPER_ADMIN: [
    // All permissions
    "system:manage",
    "users:create",
    "users:read",
    "users:update",
    "users:delete",
    "content:create",
    "content:read",
    "content:update",
    "content:delete",
    "settings:read",
    "settings:update",
    "analytics:read",
    "admin:access",
  ],
  ADMIN: [
    // Admin permissions (no user management or system settings)
    "users:read",
    "content:create",
    "content:read",
    "content:update",
    "content:delete",
    "analytics:read",
    "admin:access",
  ],
  USER: [
    // Basic user permissions
    "content:read",
  ],
};

/**
 * Check if a user has at least the required role level
 */
export function checkPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Check if a user has a specific permission
 */
export function hasPermission(userRole: UserRole, permission: string): boolean {
  return ROLE_PERMISSIONS[userRole].includes(permission);
}

/**
 * Check if user has all specified permissions
 */
export function hasAllPermissions(userRole: UserRole, permissions: string[]): boolean {
  const userPermissions = ROLE_PERMISSIONS[userRole];
  return permissions.every((permission) => userPermissions.includes(permission));
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(userRole: UserRole, permissions: string[]): boolean {
  const userPermissions = ROLE_PERMISSIONS[userRole];
  return permissions.some((permission) => userPermissions.includes(permission));
}

/**
 * Require authentication - returns user or throws error
 */
export async function requireAuth(): Promise<ExtendedUser> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    throw new Error("Authentication required");
  }
  
  return session.user as ExtendedUser;
}

/**
 * Require a specific role - returns user or throws error
 */
export async function requireRole(requiredRole: UserRole): Promise<ExtendedUser> {
  const user = await requireAuth();
  
  if (!checkPermission(user.role, requiredRole)) {
    throw new Error(`Role '${requiredRole}' or higher required`);
  }
  
  return user;
}

/**
 * Require specific permissions - returns user or throws error
 */
export async function requirePermissions(permissions: string[]): Promise<ExtendedUser> {
  const user = await requireAuth();
  
  if (!hasAllPermissions(user.role, permissions)) {
    throw new Error(`Permissions required: ${permissions.join(", ")}`);
  }
  
  return user;
}

/**
 * Get current user safely (returns null if not authenticated)
 */
export async function getCurrentUser(): Promise<ExtendedUser | null> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return null;
  }
  
  return session.user as ExtendedUser;
}

/**
 * Get current user's role safely (returns null if not authenticated)
 */
export async function getCurrentUserRole(): Promise<UserRole | null> {
  const user = await getCurrentUser();
  return user?.role ?? null;
}

/**
 * Check if current user has a specific role
 */
export async function checkCurrentUserRole(requiredRole: UserRole): Promise<boolean> {
  const userRole = await getCurrentUserRole();
  
  if (!userRole) {
    return false;
  }
  
  return checkPermission(userRole, requiredRole);
}

/**
 * Check if current user has a specific permission
 */
export async function checkCurrentUserPermission(permission: string): Promise<boolean> {
  const userRole = await getCurrentUserRole();
  
  if (!userRole) {
    return false;
  }
  
  return hasPermission(userRole, permission);
}

/**
 * Get all roles sorted by hierarchy (highest first)
 */
export function getRolesSorted(): UserRole[] {
  return (Object.keys(ROLE_HIERARCHY) as UserRole[]).sort(
    (a, b) => ROLE_HIERARCHY[b] - ROLE_HIERARCHY[a]
  );
}

/**
 * Get roles that a user can assign to others
 * (e.g., SUPER_ADMIN can assign ADMIN and USER, but not SUPER_ADMIN)
 */
export function getAssignableRoles(userRole: UserRole): UserRole[] {
  const roles = getRolesSorted();
  return roles.filter((role) => ROLE_HIERARCHY[role] < ROLE_HIERARCHY[userRole]);
}

// Re-export types
export type { UserRole, ExtendedUser };
