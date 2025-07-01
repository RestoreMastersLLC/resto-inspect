import { NextRequest } from "next/server";
import { ApiResponse, withAuth } from "@/lib/api-auth";
import { Permission, UserRole } from "@/types";

// Mock users data
const mockUsers: Array<{
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: string;
  createdAt: string;
  lastLogin: string | null;
}> = [
  {
    id: "1",
    email: "admin@restoinspect.com",
    name: "Admin User",
    role: UserRole.ADMIN,
    status: "active",
    createdAt: "2024-01-01",
    lastLogin: "2024-01-30",
  },
  {
    id: "2",
    email: "inspector@restoinspect.com",
    name: "Inspector User",
    role: UserRole.INSPECTOR,
    status: "active",
    createdAt: "2024-01-05",
    lastLogin: "2024-01-29",
  },
  {
    id: "3",
    email: "viewer@restoinspect.com",
    name: "Viewer User",
    role: UserRole.VIEWER,
    status: "active",
    createdAt: "2024-01-10",
    lastLogin: "2024-01-28",
  },
];

// GET /api/admin/users - Get all users (admin only)
export const GET = withAuth(
  async () => {
    // Return users without passwords
    const users = mockUsers.map(({ ...user }) => user);

    return ApiResponse.success({
      users,
      total: users.length,
      stats: {
        admins: users.filter((u) => u.role === UserRole.ADMIN).length,
        inspectors: users.filter((u) => u.role === UserRole.INSPECTOR).length,
        viewers: users.filter((u) => u.role === UserRole.VIEWER).length,
      },
    });
  },
  {
    // Only admins can access this endpoint
    roles: [UserRole.ADMIN],
  }
);

// POST /api/admin/users - Create a new user (admin only)
export const POST = withAuth(
  async (req: NextRequest) => {
    try {
      const body = await req.json();

      // Validate required fields
      if (!body.email || !body.name || !body.role) {
        return ApiResponse.error("Email, name, and role are required", 400);
      }

      // Check if user already exists
      if (mockUsers.find((u) => u.email === body.email)) {
        return ApiResponse.error("User with this email already exists", 409);
      }

      // Validate role
      if (!Object.values(UserRole).includes(body.role)) {
        return ApiResponse.error("Invalid role", 400);
      }

      // Create new user
      const newUser = {
        id: String(mockUsers.length + 1),
        email: body.email,
        name: body.name,
        role: body.role,
        status: "active",
        createdAt: new Date().toISOString().split("T")[0],
        lastLogin: null,
      };

      mockUsers.push(newUser);

      return ApiResponse.success(newUser, 201);
    } catch {
      return ApiResponse.error("Invalid request body", 400);
    }
  },
  {
    permissions: [Permission.CREATE_USER],
  }
);
