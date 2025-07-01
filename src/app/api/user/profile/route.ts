import { NextRequest } from "next/server";
import { withAuth, ApiResponse, getRequestUser } from "@/lib/api-auth";

// GET /api/user/profile - Get current user profile
export const GET = withAuth(async (req: NextRequest) => {
  const user = getRequestUser(req);

  if (!user) {
    return ApiResponse.unauthorized();
  }

  // In a real app, fetch additional user data from database
  const profile = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: "2024-01-01",
    lastLogin: new Date().toISOString(),
    preferences: {
      notifications: true,
      theme: "dark",
    },
    stats: {
      totalInspections: user.role === "admin" ? 150 : 45,
      completedInspections: user.role === "admin" ? 140 : 42,
      pendingInspections: user.role === "admin" ? 10 : 3,
    },
  };

  return ApiResponse.success(profile);
});

// PUT /api/user/profile - Update user profile
export const PUT = withAuth(async (req: NextRequest) => {
  const user = getRequestUser(req);

  if (!user) {
    return ApiResponse.unauthorized();
  }

  try {
    const body = await req.json();

    // Validate allowed fields (users can't change their role or ID)
    const allowedFields = ["name", "preferences"];
    const updates: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field];
      }
    }

    // In a real app, update user in database
    const updatedProfile = {
      id: user.id,
      email: user.email,
      name: updates.name || user.name,
      role: user.role,
      preferences: updates.preferences || {},
      updatedAt: new Date().toISOString(),
    };

    return ApiResponse.success(updatedProfile);
  } catch {
    return ApiResponse.error("Invalid request body", 400);
  }
});
