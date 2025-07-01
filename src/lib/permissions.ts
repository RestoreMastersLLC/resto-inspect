import { UserRole, Permission } from "@/types";

// Define role permissions mapping
export const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.VIEWER]: [Permission.VIEW_INSPECTION, Permission.VIEW_REPORTS],

  [UserRole.INSPECTOR]: [
    Permission.CREATE_INSPECTION,
    Permission.VIEW_INSPECTION,
    Permission.EDIT_INSPECTION,
    Permission.SUBMIT_INSPECTION,
    Permission.VIEW_REPORTS,
    Permission.GENERATE_REPORTS,
    Permission.EXPORT_REPORTS,
  ],

  [UserRole.ADMIN]: [
    // All permissions
    ...Object.values(Permission),
  ],
};

// Helper functions for permission checking
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}

// Get all permissions for a role
export function getRolePermissions(role: UserRole): Permission[] {
  return rolePermissions[role] ?? [];
}

// Check if a role can access a specific route
export function canAccessRoute(role: UserRole, route: string): boolean {
  const routePermissions: Record<string, Permission[]> = {
    "/dashboard": [Permission.VIEW_INSPECTION],
    "/inspection": [Permission.CREATE_INSPECTION, Permission.EDIT_INSPECTION],
    "/submissions": [Permission.VIEW_INSPECTION],
    "/reports": [Permission.VIEW_REPORTS],
    "/admin": [Permission.MANAGE_SETTINGS],
    "/users": [Permission.VIEW_USERS],
  };
  const requiredPermissions = routePermissions[route];

  if (!requiredPermissions) return true; // Allow access to unprotected routes

  return hasAnyPermission(role, requiredPermissions);
}
