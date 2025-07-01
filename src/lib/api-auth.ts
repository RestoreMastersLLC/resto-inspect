import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { Permission, UserRole } from "@/types";

export type ApiContext = {
  params?: Record<string, string>;
};

export type ApiHandler = (req: NextRequest, context?: ApiContext) => Promise<NextResponse>;

export type SimpleApiHandler = (req: NextRequest) => Promise<NextResponse>;

interface AuthOptions {
  roles?: UserRole[];
  permissions?: Permission[];
  requireAll?: boolean;
}

interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  };
}

/**
 * Creates an authenticated API route handler
 */
export function withAuth(handler: SimpleApiHandler, options?: AuthOptions): SimpleApiHandler;
export function withAuth(handler: ApiHandler, options?: AuthOptions): ApiHandler;
export function withAuth(handler: ApiHandler | SimpleApiHandler, options: AuthOptions = {}) {
  return async (req: NextRequest, context?: ApiContext) => {
    try {
      // Get the session
      const session = await getServerSession(authOptions);

      // Check if user is authenticated
      if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized - Please sign in" }, { status: 401 });
      }

      // Check role-based access
      if (options.roles && options.roles.length > 0) {
        if (!options.roles.includes(session.user.role)) {
          return NextResponse.json({ error: "Forbidden - Insufficient role privileges" }, { status: 403 });
        }
      }

      // Check permission-based access
      if (options.permissions && options.permissions.length > 0) {
        const hasRequiredPermissions = options.requireAll
          ? options.permissions.every((permission) => hasPermission(session.user.role, permission))
          : options.permissions.some((permission) => hasPermission(session.user.role, permission));

        if (!hasRequiredPermissions) {
          return NextResponse.json({ error: "Forbidden - Insufficient permissions" }, { status: 403 });
        }
      }

      // Add user to request for handler use
      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.user = session.user;

      // Call the actual handler
      return handler(authenticatedReq, context);
    } catch (error) {
      console.error("API Auth Error:", error);

      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  };
}

/**
 * Helper to get the current user from an authenticated request
 */
export function getRequestUser(req: NextRequest) {
  const authenticatedReq = req as AuthenticatedRequest;

  return authenticatedReq.user || null;
}

/**
 * Standard API response helpers
 */
export const ApiResponse = {
  success: <T = unknown>(data: T, status = 200) => {
    return NextResponse.json({ success: true, data }, { status });
  },

  error: (message: string, status = 400, details?: unknown) => {
    const response: { success: false; error: string; details?: unknown } = {
      success: false,
      error: message,
    };

    if (details !== undefined) {
      response.details = details;
    }

    return NextResponse.json(response, { status });
  },

  unauthorized: (message = "Unauthorized") => {
    return NextResponse.json({ success: false, error: message }, { status: 401 });
  },

  forbidden: (message = "Forbidden") => {
    return NextResponse.json({ success: false, error: message }, { status: 403 });
  },

  notFound: (message = "Not found") => {
    return NextResponse.json({ success: false, error: message }, { status: 404 });
  },
};
