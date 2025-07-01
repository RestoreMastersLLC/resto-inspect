/**
 * @jest-environment node
 */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ApiResponse, getRequestUser, withAuth } from "@/lib/api-auth";
import { Permission, UserRole } from "@/types";

// Mock dependencies
jest.mock("next-auth");

describe("API Authentication", () => {
  const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("withAuth", () => {
    const mockHandler = jest.fn();
    const mockRequest = new NextRequest("http://localhost:3000/api/test");

    it("returns 401 when no session exists", async () => {
      mockGetServerSession.mockResolvedValueOnce(null);

      const protectedHandler = withAuth(mockHandler);
      const response = await protectedHandler(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized - Please sign in");
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it("allows access for authenticated user without role restrictions", async () => {
      const mockSession = {
        user: {
          id: "1",
          email: "test@example.com",
          name: "Test User",
          role: UserRole.VIEWER,
        },
        expires: "2024-12-31",
      };
      mockGetServerSession.mockResolvedValueOnce(mockSession);
      mockHandler.mockResolvedValueOnce(NextResponse.json({ success: true }));

      const protectedHandler = withAuth(mockHandler);
      await protectedHandler(mockRequest);

      expect(mockHandler).toHaveBeenCalledWith(mockRequest, undefined);
    });

    it("returns 403 when user lacks required role", async () => {
      const mockSession = {
        user: {
          id: "1",
          email: "test@example.com",
          name: "Test User",
          role: UserRole.VIEWER,
        },
        expires: "2024-12-31",
      };
      mockGetServerSession.mockResolvedValueOnce(mockSession);

      const protectedHandler = withAuth(mockHandler, {
        roles: [UserRole.ADMIN, UserRole.INSPECTOR],
      });
      const response = await protectedHandler(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe("Forbidden - Insufficient role privileges");
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it("allows access when user has required role", async () => {
      const mockSession = {
        user: {
          id: "1",
          email: "test@example.com",
          name: "Test User",
          role: UserRole.ADMIN,
        },
        expires: "2024-12-31",
      };
      mockGetServerSession.mockResolvedValueOnce(mockSession);
      mockHandler.mockResolvedValueOnce(NextResponse.json({ success: true }));

      const protectedHandler = withAuth(mockHandler, {
        roles: [UserRole.ADMIN],
      });
      await protectedHandler(mockRequest);

      expect(mockHandler).toHaveBeenCalled();
    });

    it("checks permissions when specified", async () => {
      const mockSession = {
        user: {
          id: "1",
          email: "test@example.com",
          name: "Test User",
          role: UserRole.INSPECTOR,
        },
        expires: "2024-12-31",
      };
      mockGetServerSession.mockResolvedValueOnce(mockSession);
      mockHandler.mockResolvedValueOnce(NextResponse.json({ success: true }));

      const protectedHandler = withAuth(mockHandler, {
        permissions: [Permission.CREATE_INSPECTION],
      });
      await protectedHandler(mockRequest);

      expect(mockHandler).toHaveBeenCalled();
    });

    it("returns 500 on unexpected errors", async () => {
      mockGetServerSession.mockRejectedValueOnce(new Error("Database error"));

      const protectedHandler = withAuth(mockHandler);
      const response = await protectedHandler(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal Server Error");
    });
  });

  describe("getRequestUser", () => {
    it("returns user from authenticated request", () => {
      const mockRequest = new NextRequest("http://localhost:3000/api/test");
      const mockUser = {
        id: "1",
        email: "test@example.com",
        name: "Test User",
        role: UserRole.ADMIN,
      };
      // @ts-expect-error - Adding user property for testing
      mockRequest.user = mockUser;

      const user = getRequestUser(mockRequest);
      expect(user).toEqual(mockUser);
    });

    it("returns null for unauthenticated request", () => {
      const mockRequest = new NextRequest("http://localhost:3000/api/test");
      const user = getRequestUser(mockRequest);
      expect(user).toBeNull();
    });
  });

  describe("ApiResponse helpers", () => {
    it("creates success response", () => {
      const data = { message: "Success" };
      const response = ApiResponse.success(data);

      expect(response.status).toBe(200);
    });

    it("creates success response with custom status", () => {
      const data = { id: "123" };
      const response = ApiResponse.success(data, 201);

      expect(response.status).toBe(201);
    });

    it("creates error response", () => {
      const response = ApiResponse.error("Bad Request");
      expect(response.status).toBe(400);
    });

    it("creates error response with custom status and details", () => {
      const response = ApiResponse.error("Validation Error", 422, { field: "email" });
      expect(response.status).toBe(422);
    });

    it("creates unauthorized response", () => {
      const response = ApiResponse.unauthorized();
      expect(response.status).toBe(401);
    });

    it("creates forbidden response", () => {
      const response = ApiResponse.forbidden("Access denied");
      expect(response.status).toBe(403);
    });

    it("creates not found response", () => {
      const response = ApiResponse.notFound("Resource not found");
      expect(response.status).toBe(404);
    });
  });
});
