import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
};

const client = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = client;
}

// Export a single client that works with both adapter and queries
export const db = client;

// Connect to the database
client.$connect()
  .then(() => {
    console.log("✅ Successfully connected to the database");
  })
  .catch((error) => {
    console.error("❌ Failed to connect to the database:", error);
    process.exit(1);
  }); 