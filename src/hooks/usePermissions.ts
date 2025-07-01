"use client";

import { useSession } from "next-auth/react";
import { hasAllPermissions, hasAnyPermission, hasPermission } from "@/lib/permissions";
import { Permission, UserRole } from "@/types";

export function usePermissions() {
  const { data: session } = useSession();
  const userRole = session?.user?.role ?? null;

  return {
    userRole,
    hasPermission: (permission: Permission) => (userRole ? hasPermission(userRole, permission) : false),
    hasAnyPermission: (permissions: Permission[]) => (userRole ? hasAnyPermission(userRole, permissions) : false),
    hasAllPermissions: (permissions: Permission[]) => (userRole ? hasAllPermissions(userRole, permissions) : false),
    isAdmin: userRole === UserRole.ADMIN,
    isInspector: userRole === UserRole.INSPECTOR || userRole === UserRole.ADMIN,
    isViewer: userRole === UserRole.VIEWER,
    isAuthenticated: !!session,
  };
}
