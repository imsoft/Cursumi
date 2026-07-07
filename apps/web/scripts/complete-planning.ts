import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { readFileSync } from "fs";

// Carga .env si DATABASE_URL no está en el entorno (mismo patrón que seed.ts)
if (!process.env.DATABASE_URL) {
  try {
    const env = readFileSync(".env", "utf-8");
    for (const line of env.split("\n")) {
      const eqIdx = line.indexOf("=");
      if (eqIdx === -1) continue;
      const key = line.slice(0, eqIdx).trim();
      let val = line.slice(eqIdx + 1).trim();
      if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) {
        val = val.slice(1, -1);
      }
      if (key && !process.env[key]) process.env[key] = val;
    }
  } catch {
    // .env no encontrado — DATABASE_URL debe venir del entorno
  }
}

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter } as any);

const email = "brangarciaramos@gmail.com";

const EVENTO_DOC_TYPES = [
  "carta-descriptiva",
  "lista-verificacion",
  "lista-asistencia",
  "contrato-aprendizaje",
  "evaluacion-diagnostica",
  "evaluacion-formativa",
  "evaluacion-sumativa",
  "evaluacion-calidad",
  "hoja-respuestas",
  "guia-actividades",
  "manual-instructor",
  "manual-participante",
  "constancia",
  "informe-final",
  "presentation",
];

const VIRTUAL_DOC_TYPES = [
  "cronograma-actividades",
  "course-info-document",
  "virtual-activities-guide",
  "activity-calendar",
  "virtual-participant-manual",
  "multimedia-material",
  "virtual-evaluation",
  "course-review-report",
  "presentation",
];

async function main() {
  console.log(`Buscando usuario con email: ${email}`);
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true },
  });

  if (!user) {
    console.error(`Error: Usuario con email ${email} no encontrado.`);
    return;
  }

  console.log(`Usuario encontrado: ${user.name} (ID: ${user.id})`);

  const courses = await prisma.course.findMany({
    where: { instructorId: user.id },
    select: { id: true, title: true, modality: true },
  });

  console.log(`Encontrados ${courses.length} cursos para este instructor.`);

  for (const course of courses) {
    console.log(`\nProcesando curso: "${course.title}" (ID: ${course.id}, Modalidad: ${course.modality})`);
    
    let requiredTypes: string[] = [];
    if (course.modality === "evento") {
      requiredTypes = EVENTO_DOC_TYPES;
    } else if (course.modality === "virtual") {
      requiredTypes = VIRTUAL_DOC_TYPES;
    } else {
      console.log(`La modalidad "${course.modality}" no requiere planeación didáctica.`);
      continue;
    }

    console.log(`Documentos a crear/completar: ${requiredTypes.length}`);

    for (const docType of requiredTypes) {
      // Usar upsert para crear o actualizar el documento a status = "completed"
      await prisma.coursePlanningDocument.upsert({
        where: {
          courseId_type: {
            courseId: course.id,
            type: docType,
          },
        },
        update: {
          status: "completed",
        },
        create: {
          courseId: course.id,
          type: docType,
          data: {},
          status: "completed",
        },
      });
      console.log(` - Documento "${docType}" completado.`);
    }

    console.log(`¡Planeación didáctica del curso "${course.title}" completada al 100%!`);
  }
}

main()
  .catch((err) => {
    console.error("Error al completar la planeación didáctica:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
