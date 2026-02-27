// Middleware for authentication and internationalization
import createMiddleware from "next-intl/middleware";
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import type { UserRole } from "./lib/auth";

// Role hierarchy for RBAC
const ROLE_HIERARCHY: Record<UserRole, number> = {
  SUPER_ADMIN: 100,
  ADMIN: 50,
  USER: 10,
};

// Route configuration for access control
const routeConfig: Record<string, UserRole> = {
  "/admin": "ADMIN",
  "/admin/users": "SUPER_ADMIN",
  "/admin/settings": "SUPER_ADMIN",
};

function hasRequiredRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

function getRequiredRole(pathname: string): UserRole | null {
  if (routeConfig[pathname]) return routeConfig[pathname];
  for (const route in routeConfig) {
    if (pathname.startsWith(route)) return routeConfig[route];
  }
  return null;
}

// Create next-intl middleware
const intlMiddleware = createMiddleware(routing);

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Check if this is an admin route (not localized)
    const isAdminRoute = pathname.startsWith("/admin");

    if (isAdminRoute) {
      // For admin routes, skip next-intl middleware
      if (token) {
        const userRole = token.role as UserRole;
        const requiredRole = getRequiredRole(pathname);

        if (requiredRole && !hasRequiredRole(userRole, requiredRole)) {
          const url = req.nextUrl.clone();
          url.pathname = "/fr/unauthorized";
          return NextResponse.redirect(url);
        }
      }
      // Continue to admin page
      return NextResponse.next();
    }

    // For non-admin routes, run the next-intl middleware
    return intlMiddleware(req);
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        // Admin routes require authentication
        if (pathname.startsWith("/admin")) {
          return !!token;
        }
        // All other routes are public
        return true;
      },
    },
    pages: {
      signIn: "/fr/login",
    },
  }
);

export const config = {
  matcher: [
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
