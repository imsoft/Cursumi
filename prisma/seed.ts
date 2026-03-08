import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { readFileSync } from "fs";

// Load .env.local variables if DATABASE_URL is not set
if (!process.env.DATABASE_URL) {
  try {
    const env = readFileSync(".env", "utf-8");
    for (const line of env.split("\n")) {
      const eqIdx = line.indexOf("=");
      if (eqIdx === -1) continue;
      const key = line.slice(0, eqIdx).trim();
      const val = line.slice(eqIdx + 1).trim();
      if (key && !process.env[key]) process.env[key] = val;
    }
  } catch {
    // .env.local not found — DATABASE_URL must be in environment
  }
}

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter } as any);

const categories = [
  { name: "Programación", slug: "programacion", order: 1 },
  { name: "Marketing", slug: "marketing", order: 2 },
  { name: "Diseño", slug: "diseno", order: 3 },
  { name: "Negocios", slug: "negocios", order: 4 },
  { name: "Habilidades blandas", slug: "habilidades-blandas", order: 5 },
  { name: "Idiomas", slug: "idiomas", order: 6 },
  { name: "Arte", slug: "arte", order: 7 },
  { name: "Fotografía", slug: "fotografia", order: 8 },
  { name: "Finanzas", slug: "finanzas", order: 9 },
  { name: "Salud y bienestar", slug: "salud-bienestar", order: 10 },
];

async function main() {
  console.log("Seeding categories...");
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, order: cat.order },
      create: cat,
    });
  }
  console.log(`Seeded ${categories.length} categories.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
