import { PrismaClient } from "@prisma/client";

// Singleton Prisma client for the Next.js app (avoids hot-reload duplicates)
const globalForPrisma = globalThis as unknown as {
  prisma?: any;
};

const createPrismaClient = () => {
  if (process.env.NODE_ENV === "development") {
    console.log("🛠️  Creating new Prisma client instance");
  }

  const basePrisma = new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  return basePrisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ operation, model, args, query }) {
          const MAX_RETRIES = 3;
          let lastError;

          for (let i = 0; i < MAX_RETRIES; i++) {
            try {
              return await query(args);
            } catch (error: any) {
              lastError = error;
              if (error?.code === 'P2024' && i < MAX_RETRIES - 1) {
                await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, i)));
                continue;
              }
              throw error;
            }
          }
          throw lastError;
        },
      },
    },
  });
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}



