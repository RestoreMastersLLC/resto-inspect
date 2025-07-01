import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

/**
 * Prisma Client Singleton
 *
 * This ensures we don't create multiple instances of Prisma Client,
 * especially important in development with hot reloading.
 *
 * In production, we create a single instance.
 * In development, we store it globally to persist across hot reloads.
 */
export const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

/**
 * Gracefully disconnect from the database
 */
export async function disconnect() {
  await prisma.$disconnect();
}
