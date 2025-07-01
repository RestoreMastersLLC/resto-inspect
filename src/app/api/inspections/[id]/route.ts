import { NextRequest } from "next/server";
import { ApiContext, ApiResponse, getRequestUser, withAuth } from "@/lib/api-auth";
import { Permission, UserRole } from "@/types";

// Mock data (in real app, this would come from database)
const mockInspections = [
  {
    id: "1",
    address: "123 Main St, City, State 12345",
    date: "2024-01-15",
    status: "completed",
    inspector: "John Doe",
    inspectorId: "2",
    score: 95,
    notes: "Kitchen area needs attention",
    images: ["image1.jpg", "image2.jpg"],
  },
  {
    id: "2",
    address: "456 Oak Ave, City, State 12345",
    date: "2024-01-20",
    status: "pending",
    inspector: "Jane Smith",
    inspectorId: "2",
    score: null,
    notes: "",
    images: [],
  },
];

// GET /api/inspections/[id] - Get a specific inspection
export const GET = withAuth(
  async (req: NextRequest, context?: ApiContext) => {
    const id = context?.params?.id;
    const user = getRequestUser(req);
    const inspection = mockInspections.find((i) => i.id === id);

    if (!inspection) {
      return ApiResponse.notFound("Inspection not found");
    }

    // Check if user has access to this inspection
    if (user?.role === UserRole.INSPECTOR && inspection.inspectorId !== user.id) {
      return ApiResponse.forbidden("You can only view your own inspections");
    }

    return ApiResponse.success(inspection);
  },
  {
    roles: [UserRole.INSPECTOR, UserRole.ADMIN],
  }
);

// PUT /api/inspections/[id] - Update an inspection
export const PUT = withAuth(
  async (req: NextRequest, context?: ApiContext) => {
    const id = context?.params?.id;
    const user = getRequestUser(req);

    try {
      const body = await req.json();
      const inspectionIndex = mockInspections.findIndex((i) => i.id === id);

      if (inspectionIndex === -1) {
        return ApiResponse.notFound("Inspection not found");
      }

      const inspection = mockInspections[inspectionIndex];

      // Check if user has permission to edit
      if (user?.role === UserRole.INSPECTOR && inspection.inspectorId !== user.id) {
        return ApiResponse.forbidden("You can only edit your own inspections");
      }

      // Update inspection
      mockInspections[inspectionIndex] = {
        ...inspection,
        ...body,
        id: inspection.id, // Prevent ID change
        inspectorId: inspection.inspectorId, // Prevent inspector change
      };

      return ApiResponse.success(mockInspections[inspectionIndex]);
    } catch {
      return ApiResponse.error("Invalid request body", 400);
    }
  },
  {
    permissions: [Permission.EDIT_INSPECTION],
  }
);

// DELETE /api/inspections/[id] - Delete an inspection
export const DELETE = withAuth(
  async (req: NextRequest, context?: ApiContext) => {
    const id = context?.params?.id;
    const user = getRequestUser(req);
    const inspectionIndex = mockInspections.findIndex((i) => i.id === id);

    if (inspectionIndex === -1) {
      return ApiResponse.notFound("Inspection not found");
    }

    const inspection = mockInspections[inspectionIndex];

    // Only admins can delete any inspection
    // Inspectors can only delete their own pending inspections
    if (user?.role === UserRole.INSPECTOR) {
      if (inspection.inspectorId !== user.id) {
        return ApiResponse.forbidden("You can only delete your own inspections");
      }

      if (inspection.status !== "pending") {
        return ApiResponse.forbidden("You can only delete pending inspections");
      }
    }

    // Remove inspection
    mockInspections.splice(inspectionIndex, 1);

    return ApiResponse.success({ message: "Inspection deleted successfully" });
  },
  {
    permissions: [Permission.DELETE_INSPECTION],
  }
);
