import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

function loadEnv(file: string) {
  const path = join(process.cwd(), file);
  if (!existsSync(path)) return;
  const env = readFileSync(path, "utf-8");
  for (const line of env.split("\n")) {
    const eqIdx = line.indexOf("=");
    if (eqIdx === -1) continue;
    const key = line.slice(0, eqIdx).trim();
    let val = line.slice(eqIdx + 1).trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
    if (key && !process.env[key]) process.env[key] = val;
  }
}

if (!process.env.DATABASE_URL) {
  loadEnv(".env.local");
  loadEnv(".env");
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL no está definida.");
  process.exit(1);
}

const adapter = new PrismaNeon({ connectionString });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter } as any);

const EMAIL = "cursumi.com@gmail.com";

async function main() {
  const user = await prisma.user.updateMany({
    where: { email: EMAIL },
    data: { role: "admin" },
  });
  if (user.count === 0) {
    console.log(`No se encontró ningún usuario con el correo "${EMAIL}".`);
    process.exit(1);
  }
  console.log(`Usuario ${EMAIL} actualizado a administrador correctamente.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
