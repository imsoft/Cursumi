/**
 * Normaliza el campo `Course.duration` de datos heredados al formato canónico
 * "N unidad" (p. ej. "3" -> "3 horas"), usando los mismos helpers que la UI.
 *
 * Es idempotente: los valores ya normalizados ("8 horas") no se tocan, y el
 * texto libre sin número (p. ej. "Curso intensivo") se deja intacto.
 *
 * Uso:
 *   source .env && DATABASE_URL="$DATABASE_URL" pnpm --filter @cursumi/web exec tsx scripts/normalize-course-durations.ts --dry-run
 *   source .env && DATABASE_URL="$DATABASE_URL" pnpm --filter @cursumi/web exec tsx scripts/normalize-course-durations.ts
 */
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { readFileSync } from "fs";
import { displayDuration } from "../src/lib/duration";

// Carga .env si DATABASE_URL no está en el entorno (mismo patrón que seed.ts)
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
    // .env no encontrado — DATABASE_URL debe venir del entorno
  }
}

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter } as any);

const dryRun = process.argv.includes("--dry-run");

async function main() {
  const courses = await prisma.course.findMany({
    where: { duration: { not: null } },
    select: { id: true, title: true, duration: true },
  });

  let changed = 0;
  let unchanged = 0;

  for (const course of courses) {
    const current = course.duration ?? "";
    const normalized = displayDuration(current);

    if (normalized === current) {
      unchanged++;
      continue;
    }

    changed++;
    console.log(
      `${dryRun ? "[dry-run] " : ""}${course.id}  "${current}" -> "${normalized}"  (${course.title})`,
    );

    if (!dryRun) {
      await prisma.course.update({
        where: { id: course.id },
        data: { duration: normalized },
      });
    }
  }

  console.log(
    `\n${dryRun ? "[dry-run] " : ""}Total: ${courses.length} cursos con duración | ${changed} ${dryRun ? "por cambiar" : "actualizados"} | ${unchanged} sin cambios`,
  );
}

main()
  .catch((err) => {
    console.error("Error al normalizar duraciones:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
