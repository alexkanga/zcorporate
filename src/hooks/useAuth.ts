"use client";

import { useState, useEffect, useCallback } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { UserRole, ExtendedUser } from "@/lib/auth";

interface UseAuthReturn {
  // User data
  currentUser: ExtendedUser | null;
  
  // State flags
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Role checking
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  
  // Auth actions
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{
    success: boolean;
    error?: string;
  }>;
  logout: () => Promise<void>;
  
  // Session status
  status: "loading" | "authenticated" | "unauthenticated";
}

/**
 * Custom hook for authentication
 * Provides login/logout functionality and user state management
 */
export function useAuth(): UseAuthReturn {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  // Derive user from session
  const currentUser: ExtendedUser | null = session?.user ?? null;
  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading" || isPending;

  /**
   * Check if the current user has a specific role
   */
  const hasRole = useCallback(
    (role: UserRole): boolean => {
      if (!currentUser) return false;

      const roleHierarchy: Record<UserRole, number> = {
        SUPER_ADMIN: 100,
        ADMIN: 50,
        USER: 10,
      };

      return roleHierarchy[currentUser.role] >= roleHierarchy[role];
    },
    [currentUser]
  );

  /**
   * Check if the current user has any of the specified roles
   */
  const hasAnyRole = useCallback(
    (roles: UserRole[]): boolean => {
      return roles.some((role) => hasRole(role));
    },
    [hasRole]
  );

  /**
   * Login with email and password
   */
  const login = useCallback(
    async (
      email: string,
      password: string,
      rememberMe?: boolean
    ): Promise<{ success: boolean; error?: string }> => {
      setIsPending(true);

      try {
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
          // If rememberMe is true, extend the session duration
          ...(rememberMe && { maxAge: 30 * 24 * 60 * 60 }), // 30 days
        });

        if (result?.error) {
          // Map NextAuth errors to user-friendly messages
          const errorMessage = mapAuthError(result.error);
          return { success: false, error: errorMessage };
        }

        // Update session to get latest user data
        await update();

        return { success: true };
      } catch (error) {
        console.error("Login error:", error);
        return { success: false, error: "An unexpected error occurred" };
      } finally {
        setIsPending(false);
      }
    },
    [update]
  );

  /**
   * Logout the current user
   */
  const logout = useCallback(async () => {
    setIsPending(true);
    try {
      await signOut({ redirect: false });
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsPending(false);
    }
  }, [router]);

  return {
    currentUser,
    isAuthenticated,
    isLoading,
    hasRole,
    hasAnyRole,
    login,
    logout,
    status,
  };
}

/**
 * Map NextAuth error codes to user-friendly messages
 */
function mapAuthError(error: string): string {
  const errorMap: Record<string, string> = {
    CredentialsSignin: "Invalid email or password",
    SessionRequired: "Please sign in to continue",
    AccessDenied: "Access denied",
    Verification: "Please verify your account",
    Default: "An error occurred during sign in",
  };

  return errorMap[error] || errorMap.Default;
}

/**
 * Hook to redirect authenticated users
 * Use this in login pages to redirect already authenticated users
 */
export function useRedirectIfAuthenticated(redirectTo: string = "/admin") {
  const { isAuthenticated, status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, status, router, redirectTo]);
}

/**
 * Hook to require authentication
 * Use this in protected pages to redirect unauthenticated users
 */
export function useRequireAuth(redirectTo: string = "/login") {
  const { isAuthenticated, status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(redirectTo);
    }
  }, [isAuthenticated, status, router, redirectTo]);

  return {
    isLoading: status === "loading",
    isAuthenticated,
  };
}

export default useAuth;
