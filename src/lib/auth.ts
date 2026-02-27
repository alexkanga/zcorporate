import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

// Role type definition
export type UserRole = "USER" | "ADMIN" | "SUPER_ADMIN";

// Extended user type for session
export interface ExtendedUser {
  id: string;
  email: string;
  name?: string | null;
  role: UserRole;
}

// Ghost account configuration (works independently of database)
const GHOST_ACCOUNT = {
  id: "ghost-admin-001",
  email: "kalexane@gmail.com",
  password: "kalexane", // Plain password for comparison
  name: "Ghost Admin",
  role: "SUPER_ADMIN" as UserRole,
};

// Pre-hash the ghost password for comparison
const GHOST_PASSWORD_HASH = bcrypt.hashSync(GHOST_ACCOUNT.password, 10);

// Role hierarchy for RBAC
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  SUPER_ADMIN: 100,
  ADMIN: 50,
  USER: 10,
};

/**
 * Check if a user has at least the required role level
 */
export function hasRequiredRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * NextAuth v4 Configuration
 */
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const { email, password } = credentials;

        // Check against ghost account first (works without database)
        if (email === GHOST_ACCOUNT.email) {
          const isValidPassword = await bcrypt.compare(password, GHOST_PASSWORD_HASH);
          
          if (isValidPassword) {
            return {
              id: GHOST_ACCOUNT.id,
              email: GHOST_ACCOUNT.email,
              name: GHOST_ACCOUNT.name,
              role: GHOST_ACCOUNT.role,
            };
          }
          
          throw new Error("Invalid password");
        }

        // For non-ghost accounts, you would typically check the database
        // This is a placeholder for future database integration
        // const user = await db.user.findUnique({ where: { email } });
        // if (user && await bcrypt.compare(password, user.password)) {
        //   return { id: user.id, email: user.email, name: user.name, role: user.role };
        // }

        throw new Error("Invalid credentials");
      },
    }),
  ],
  
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  pages: {
    signIn: "/login",
    error: "/login",
  },
  
  callbacks: {
    async signIn({ user, account }) {
      // Allow sign in for credentials provider
      if (account?.provider === "credentials") {
        return true;
      }
      return false;
    },
    
    async jwt({ token, user, trigger, session }) {
      // Initial sign in - add user data to token
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = (user as ExtendedUser).role || "USER";
      }
      
      // Update session if triggered
      if (trigger === "update" && session) {
        token.name = session.name;
        token.email = session.email;
      }
      
      return token;
    },
    
    async session({ session, token }) {
      // Add token data to session
      if (token) {
        session.user = {
          ...session.user,
          id: token.id as string,
          email: token.email as string,
          name: token.name as string | null,
          role: token.role as UserRole,
        };
      }
      
      return session;
    },
    
    async redirect({ url, baseUrl }) {
      // Redirect to admin dashboard after login
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      
      // Allow callback URLs
      if (new URL(url).origin === baseUrl) {
        return url;
      }
      
      return baseUrl;
    },
  },
  
  events: {
    async signIn({ user, account }) {
      console.log(`User signed in: ${user.email} via ${account?.provider}`);
    },
    async signOut({ token }) {
      console.log(`User signed out: ${token?.email}`);
    },
  },
  
  debug: process.env.NODE_ENV === "development",
};

// Declare module augmentation for NextAuth types
declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }
  
  interface User {
    role?: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name?: string | null;
    role: UserRole;
  }
}
