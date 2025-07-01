// Environment variable validation
const requiredEnvVars = {
  DATABASE_URL: process.env.DATABASE_URL,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
} as const;

// Validate required environment variables
for (const [key, value] of Object.entries(requiredEnvVars)) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

// Export validated environment variables
export const env = {
  databaseUrl: requiredEnvVars.DATABASE_URL as string,
  nextAuth: {
    url: requiredEnvVars.NEXTAUTH_URL as string,
    secret: requiredEnvVars.NEXTAUTH_SECRET as string,
  },
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
} as const;
