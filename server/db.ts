import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
};

export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

// Ensure the database is connected
prisma.$connect()
  .then(() => {
    console.log("✅ Successfully connected to the database");
  })
  .catch((error) => {
    console.error("❌ Failed to connect to the database:", error);
    process.exit(1); // Exit if we can't connect to the database
  }); 