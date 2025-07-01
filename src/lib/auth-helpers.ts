import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserRole } from "@/types";

export async function getRequiredSession() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  return session;
}

export async function requireRole(role: UserRole | UserRole[]) {
  const session = await getRequiredSession();
  const roles = Array.isArray(role) ? role : [role];

  if (!roles.includes(session.user.role)) {
    redirect("/unauthorized");
  }

  return session;
}

export async function requireAdmin() {
  return requireRole(UserRole.ADMIN);
}

export async function requireInspector() {
  return requireRole([UserRole.INSPECTOR, UserRole.ADMIN]);
}
