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
          const MAX_RETRIES = 5;
          let lastError;

          for (let i = 0; i < MAX_RETRIES; i++) {
            try {
              return await query(args);
            } catch (error: any) {
              lastError = error;
              // P1001: Can't reach database server
              // P1017: Server closed the connection
              // P2024: Connection pool timeout
              const recoverableErrors = ['P1001', 'P1017', 'P2024', 'P2023'];

              // Check for Prisma codes OR low-level socket/connection reset errors (like 10054 on Windows)
              const errorMsg = error?.message?.toLowerCase() || "";
              const isSocketError = errorMsg.includes("connectionreset") ||
                errorMsg.includes("forcibly closed") ||
                errorMsg.includes("socket") ||
                errorMsg.includes("10054");

              if ((recoverableErrors.includes(error?.code) || isSocketError) && i < MAX_RETRIES - 1) {
                const delay = 300 * Math.pow(2, i);
                await new Promise(resolve => setTimeout(resolve, delay));
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



