import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

/** Bump after `prisma generate` adds models so a running Next process drops stale clients. */
const CLIENT_GENERATION = 4;

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  pgPool?: Pool;
  prismaGeneration?: number;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const pool =
    globalForPrisma.pgPool ??
    new Pool({
      connectionString,
      max: process.env.NODE_ENV === "production" ? 1 : 10,
    });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.pgPool = pool;
  }

  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

/** True when the cached client predates current schema fields (e.g. Page.summary). */
function isStaleClient(client: PrismaClient): boolean {
  const page = (client as unknown as { page?: { findFirst?: unknown } }).page;
  if (!page || typeof page.findFirst !== "function") {
    return true;
  }
  // Force recreate via CLIENT_GENERATION when fields are added.
  return false;
}

function getPrismaClient(): PrismaClient {
  const generationOk = globalForPrisma.prismaGeneration === CLIENT_GENERATION;
  const existing = globalForPrisma.prisma;

  if (existing && generationOk && !isStaleClient(existing)) {
    return existing;
  }

  if (existing) {
    void existing.$disconnect().catch(() => undefined);
  }

  const client = createPrismaClient();
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
    globalForPrisma.prismaGeneration = CLIENT_GENERATION;
  }
  return client;
}

export const prisma = getPrismaClient();
