"use client";

import { useSyncExternalStore, ReactNode } from "react";

interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

// Empty subscribe function for useSyncExternalStore
const subscribe = () => () => {};

// Returns true only on client side
const getSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * Wrapper component that only renders its children on the client side.
 * Useful for components with hydration issues caused by dynamic IDs (like Radix UI).
 * Uses useSyncExternalStore to avoid useEffect setState warnings.
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const hasMounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!hasMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
