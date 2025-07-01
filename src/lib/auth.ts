import { compare } from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { UserRole } from "@/types";

// Extend the built-in session types
declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  }

  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        // TODO: Replace with actual database query
        // For now, using mock data for development
        const mockUsers = [
          {
            id: "1",
            email: "admin@restoinspect.com",
            name: "Admin User",
            password: "$2b$10$nPZ.FRiKYA6sbFDRPYj8De8g/vbqhW85k7I6NanJYRTr5klzW7GLO", // password123
            role: UserRole.ADMIN,
          },
          {
            id: "2",
            email: "inspector@restoinspect.com",
            name: "Inspector User",
            password: "$2b$10$nPZ.FRiKYA6sbFDRPYj8De8g/vbqhW85k7I6NanJYRTr5klzW7GLO", // password123
            role: UserRole.INSPECTOR,
          },
          {
            id: "3",
            email: "viewer@restoinspect.com",
            name: "Viewer User",
            password: "$2b$10$nPZ.FRiKYA6sbFDRPYj8De8g/vbqhW85k7I6NanJYRTr5klzW7GLO", // password123
            role: UserRole.VIEWER,
          },
        ];
        const user = mockUsers.find((u) => u.email === credentials.email);

        if (!user || !(await compare(credentials.password, user.password))) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }

      return session;
    },
  },
  debug: process.env.NODE_ENV === "development",
};
