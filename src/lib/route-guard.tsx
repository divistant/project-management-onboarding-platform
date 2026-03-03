"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import type { UserRole } from "@/types/onboarding";

const ROUTE_ROLES: { pattern: RegExp; roles: UserRole[] }[] = [
  { pattern: /^\/admin/, roles: ["admin"] },
];

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.currentUser);

  useEffect(() => {
    const pathname = window.location.pathname;
    for (const rule of ROUTE_ROLES) {
      if (rule.pattern.test(pathname) && !rule.roles.includes(currentUser.role)) {
        router.replace("/dashboard");
        return;
      }
    }
  }, [currentUser.role, router]);

  return <>{children}</>;
}
