"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";

import { LoginForm } from "@/components/auth/LoginForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth, useRedirectIfAuthenticated } from "@/hooks/useAuth";

export default function LoginPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const { isAuthenticated, status } = useAuth();

  // Redirect authenticated users to admin
  useRedirectIfAuthenticated("/admin");

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-muted-foreground/20" />
          <div className="h-4 w-32 bg-muted-foreground/20 rounded" />
        </div>
      </div>
    );
  }

  // Don't render login form if already authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and branding */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-primary)]/10 mb-2">
            <Shield className="w-8 h-8 text-[var(--color-primary)]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{t("login.title")}</h1>
          <p className="text-muted-foreground text-sm">{t("login.subtitle")}</p>
        </div>

        {/* Login card */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl text-center">{t("login.title")}</CardTitle>
            <CardDescription className="text-center">
              {t("login.subtitle")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm redirectTo="/admin" />
          </CardContent>
        </Card>

        {/* Footer links */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            {t("login.noAccount")}{" "}
            <button
              onClick={() => router.push("/register")}
              className="text-[var(--color-primary)] hover:underline font-medium"
            >
              {t("login.register")}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
