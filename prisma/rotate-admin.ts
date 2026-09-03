/**
 * One-off super-admin rotation. Does not touch other seed data.
 *
 *   npx tsx prisma/rotate-admin.ts
 *
 * Override via env (recommended for production):
 *   SEED_ADMIN_EMAIL=... SEED_ADMIN_PASSWORD=... npx tsx prisma/rotate-admin.ts
 */
import "dotenv/config";
import { PrismaClient, Role } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

const email = requireEnv("SEED_ADMIN_EMAIL");
const password = requireEnv("SEED_ADMIN_PASSWORD");
const connectionString = requireEnv("DATABASE_URL");
const legacyAdminEmail = process.env.LEGACY_ADMIN_EMAIL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash(password, 12);

  if (
    legacyAdminEmail &&
    process.env.DELETE_LEGACY_ADMIN === "true" &&
    email !== legacyAdminEmail
  ) {
    const removed = await prisma.user.deleteMany({
      where: { email: legacyAdminEmail },
    });
    if (removed.count > 0) {
      console.log(`→ removed legacy admin`);
    }
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: Role.SUPER_ADMIN, isActive: true },
    create: {
      email,
      name: "System Administrator",
      passwordHash,
      role: Role.SUPER_ADMIN,
      designation: "IT Administrator",
    },
  });

  console.log("✓ super admin ready");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
