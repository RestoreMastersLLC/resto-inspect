import { NextRequest } from "next/server";
import { ApiResponse, getRequestUser, withAuth } from "@/lib/api-auth";
import { Permission, UserRole } from "@/types";

// Mock data for demonstration
const mockInspections = [
  {
    id: "1",
    address: "123 Main St, City, State 12345",
    date: "2024-01-15",
    status: "completed",
    inspector: "John Doe",
    score: 95,
  },
  {
    id: "2",
    address: "456 Oak Ave, City, State 12345",
    date: "2024-01-20",
    status: "pending",
    inspector: "Jane Smith",
    score: null,
  },
];

// GET /api/inspections - Get all inspections
export const GET = withAuth(
  async (req: NextRequest) => {
    const user = getRequestUser(req);

    // Filter inspections based on user role
    let inspections = [...mockInspections];

    if (user?.role === UserRole.INSPECTOR) {
      // Inspectors only see their own inspections
      inspections = inspections.filter((i) => i.inspector === user.name);
    }

    return ApiResponse.success({
      inspections,
      total: inspections.length,
      user: {
        id: user?.id,
        role: user?.role,
      },
    });
  },
  {
    // Only inspectors and admins can view inspections
    roles: [UserRole.INSPECTOR, UserRole.ADMIN],
  }
);

// POST /api/inspections - Create a new inspection
export const POST = withAuth(
  async (req: NextRequest) => {
    try {
      const user = getRequestUser(req);
      const body = await req.json();

      // Validate required fields
      if (!body.address) {
        return ApiResponse.error("Address is required", 400);
      }

      // Create new inspection
      const newInspection = {
        id: String(mockInspections.length + 1),
        address: body.address,
        date: new Date().toISOString().split("T")[0],
        status: "pending",
        inspector: user?.name || "Unknown",
        score: null,
      };

      mockInspections.push(newInspection);

      return ApiResponse.success(newInspection, 201);
    } catch {
      return ApiResponse.error("Invalid request body", 400);
    }
  },
  {
    // Only inspectors and admins can create inspections
    permissions: [Permission.CREATE_INSPECTION],
  }
);
