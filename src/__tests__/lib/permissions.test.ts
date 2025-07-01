import { hasAllPermissions, hasAnyPermission, hasPermission, rolePermissions } from "@/lib/permissions";
import { Permission, UserRole } from "@/types";

describe("Permissions System", () => {
  describe("rolePermissions", () => {
    it("defines permissions for admin role", () => {
      expect(rolePermissions[UserRole.ADMIN]).toBeDefined();
      expect(rolePermissions[UserRole.ADMIN].length).toBeGreaterThan(0);
      // Admin should have all permissions
      expect(rolePermissions[UserRole.ADMIN]).toContain(Permission.CREATE_INSPECTION);
      expect(rolePermissions[UserRole.ADMIN]).toContain(Permission.DELETE_USER);
      expect(rolePermissions[UserRole.ADMIN]).toContain(Permission.MANAGE_SETTINGS);
    });

    it("defines permissions for inspector role", () => {
      expect(rolePermissions[UserRole.INSPECTOR]).toBeDefined();
      expect(rolePermissions[UserRole.INSPECTOR].length).toBeGreaterThan(0);
      // Inspector should have inspection permissions but not user management
      expect(rolePermissions[UserRole.INSPECTOR]).toContain(Permission.CREATE_INSPECTION);
      expect(rolePermissions[UserRole.INSPECTOR]).not.toContain(Permission.DELETE_USER);
      expect(rolePermissions[UserRole.INSPECTOR]).not.toContain(Permission.MANAGE_SETTINGS);
    });

    it("defines permissions for viewer role", () => {
      expect(rolePermissions[UserRole.VIEWER]).toBeDefined();
      // Viewer should have limited permissions
      expect(rolePermissions[UserRole.VIEWER]).toContain(Permission.VIEW_INSPECTION);
      expect(rolePermissions[UserRole.VIEWER]).toContain(Permission.VIEW_REPORTS);
      expect(rolePermissions[UserRole.VIEWER]).not.toContain(Permission.CREATE_INSPECTION);
      expect(rolePermissions[UserRole.VIEWER]).not.toContain(Permission.EDIT_INSPECTION);
    });
  });

  describe("hasPermission", () => {
    it("returns true when role has the permission", () => {
      expect(hasPermission(UserRole.ADMIN, Permission.CREATE_USER)).toBe(true);
      expect(hasPermission(UserRole.INSPECTOR, Permission.CREATE_INSPECTION)).toBe(true);
      expect(hasPermission(UserRole.VIEWER, Permission.VIEW_REPORTS)).toBe(true);
    });

    it("returns false when role lacks the permission", () => {
      expect(hasPermission(UserRole.VIEWER, Permission.CREATE_INSPECTION)).toBe(false);
      expect(hasPermission(UserRole.INSPECTOR, Permission.DELETE_USER)).toBe(false);
      expect(hasPermission(UserRole.VIEWER, Permission.MANAGE_SETTINGS)).toBe(false);
    });

    it("returns false for undefined role", () => {
      expect(hasPermission("invalid" as UserRole, Permission.VIEW_INSPECTION)).toBe(false);
    });
  });

  describe("hasAnyPermission", () => {
    it("returns true when role has at least one permission", () => {
      expect(
        hasAnyPermission(UserRole.INSPECTOR, [
          Permission.CREATE_INSPECTION,
          Permission.DELETE_USER, // Inspector doesn't have this
        ])
      ).toBe(true);
    });

    it("returns false when role has none of the permissions", () => {
      expect(
        hasAnyPermission(UserRole.VIEWER, [
          Permission.CREATE_INSPECTION,
          Permission.DELETE_INSPECTION,
          Permission.MANAGE_SETTINGS,
        ])
      ).toBe(false);
    });

    it("returns false for empty permissions array", () => {
      expect(hasAnyPermission(UserRole.ADMIN, [])).toBe(false);
    });
  });

  describe("hasAllPermissions", () => {
    it("returns true when role has all permissions", () => {
      expect(
        hasAllPermissions(UserRole.ADMIN, [Permission.CREATE_USER, Permission.DELETE_USER, Permission.MANAGE_SETTINGS])
      ).toBe(true);
    });

    it("returns false when role lacks any permission", () => {
      expect(
        hasAllPermissions(UserRole.INSPECTOR, [
          Permission.CREATE_INSPECTION,
          Permission.DELETE_USER, // Inspector doesn't have this
        ])
      ).toBe(false);
    });

    it("returns true for empty permissions array", () => {
      expect(hasAllPermissions(UserRole.VIEWER, [])).toBe(true);
    });
  });

  describe("Permission hierarchy", () => {
    it("admin has all permissions", () => {
      const allPermissions = Object.values(Permission);
      allPermissions.forEach((permission) => {
        expect(hasPermission(UserRole.ADMIN, permission)).toBe(true);
      });
    });

    it("inspector has more permissions than viewer", () => {
      const inspectorPermCount = rolePermissions[UserRole.INSPECTOR].length;
      const viewerPermCount = rolePermissions[UserRole.VIEWER].length;
      expect(inspectorPermCount).toBeGreaterThan(viewerPermCount);
    });

    it("viewer permissions are subset of inspector permissions", () => {
      const viewerPerms = rolePermissions[UserRole.VIEWER];
      const inspectorPerms = rolePermissions[UserRole.INSPECTOR];

      viewerPerms.forEach((permission) => {
        if (permission !== Permission.VIEW_ANALYTICS) {
          // Most viewer permissions should also be available to inspector
          expect(inspectorPerms).toContain(permission);
        }
      });
    });
  });
});
