"use client";

import { SessionProvider } from "next-auth/react";
import { type ReactNode } from "react";

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication provider wrapper for NextAuth SessionProvider
 * This must be used at the root level to enable useSession hook throughout the app
 */
export function AuthProvider({ children }: AuthProviderProps) {
  return <SessionProvider>{children}</SessionProvider>;
}
