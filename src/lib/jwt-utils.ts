import { SignJWT, jwtVerify } from "jose";
import { UserRole, TokenPayload } from "@/types";

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "development-secret-key");

export async function signToken(payload: TokenPayload): Promise<string> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);

  return token;
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);

    return {
      id: payload.id as string,
      email: payload.email as string,
      role: payload.role as UserRole,
      exp: payload.exp as number | undefined,
    };
  } catch (error) {
    console.error("JWT verification failed:", error);

    return null;
  }
}

export function generateSessionToken(user: { id: string; email: string; role: UserRole }): Promise<string> {
  return signToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });
}
