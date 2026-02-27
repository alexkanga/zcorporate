import { getServerSession } from "next-auth/next";
import { authOptions, type UserRole, type ExtendedUser } from "./auth";

/**
 * Session type returned by getServerSession
 */
export interface Session {
  user: ExtendedUser;
  expires: string;
}

/**
 * Get the current server-side session
 * This is a wrapper around NextAuth's getServerSession with our auth options
 */
export async function getAuthSession(): Promise<Session | null> {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return null;
  }
  
  return session as Session;
}

/**
 * Get the current user from the session
 * Returns null if not authenticated
 */
export async function getCurrentUser(): Promise<ExtendedUser | null> {
  const session = await getAuthSession();
  
  if (!session?.user) {
    return null;
  }
  
  return session.user;
}

/**
 * Check if the current user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getAuthSession();
  return !!session?.user;
}

/**
 * Get the current user's role
 * Returns null if not authenticated
 */
export async function getCurrentUserRole(): Promise<UserRole | null> {
  const user = await getCurrentUser();
  return user?.role ?? null;
}

/**
 * Check if the current user has a specific role
 */
export async function hasRole(role: UserRole): Promise<boolean> {
  const user = await getCurrentUser();
  
  if (!user) {
    return false;
  }
  
  return user.role === role;
}

/**
 * Require authentication - throws error if not authenticated
 */
export async function requireAuth(): Promise<ExtendedUser> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error("Authentication required");
  }
  
  return user;
}

/**
 * Require a specific role - throws error if user doesn't have the role
 */
export async function requireRole(requiredRole: UserRole): Promise<ExtendedUser> {
  const user = await requireAuth();
  
  const roleHierarchy: Record<UserRole, number> = {
    SUPER_ADMIN: 100,
    ADMIN: 50,
    USER: 10,
  };
  
  if (roleHierarchy[user.role] < roleHierarchy[requiredRole]) {
    throw new Error(`Role ${requiredRole} required`);
  }
  
  return user;
}

// Re-export types
export type { UserRole, ExtendedUser };
