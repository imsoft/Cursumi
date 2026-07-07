import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { readFileSync } from "fs";

// Load .env
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
    // .env not found
  }
}

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter } as any);

const email = "brangarciaramos@gmail.com";

function replaceVSCode(text: string | null | undefined): string | null | undefined {
  if (!text) return text;
  // Reemplaza de forma insensible a mayúsculas "Visual Studio Code", "VS Code" o "VSCode"
  return text
    .replace(/Visual Studio Code/gi, "Cursor")
    .replace(/VS Code/gi, "Cursor")
    .replace(/VSCode/gi, "Cursor");
}

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

  const courses = await prisma.course.findMany({
    where: { instructorId: user.id },
    include: {
      sections: {
        include: {
          lessons: true,
        },
      },
    },
  });

  console.log(`Encontrados ${courses.length} cursos para este instructor.`);

  for (const course of courses) {
    console.log(`\n--- Procesando curso: "${course.title}" (ID: ${course.id}) ---`);
    
    // 1. Actualizar descripción del curso
    const newCourseDesc = replaceVSCode(course.description);
    if (newCourseDesc !== course.description) {
      console.log(`Modificando descripción del curso.`);
      await prisma.course.update({
        where: { id: course.id },
        data: { description: newCourseDesc! },
      });
    }

    // 2. Actualizar Secciones
    for (const section of course.sections) {
      const newSecTitle = replaceVSCode(section.title);
      const newSecDesc = replaceVSCode(section.description);
      
      if (newSecTitle !== section.title || newSecDesc !== section.description) {
        console.log(`Modificando sección: "${section.title}"`);
        await prisma.courseSection.update({
          where: { id: section.id },
          data: {
            title: newSecTitle!,
            description: newSecDesc,
          },
        });
      }

      // 3. Actualizar Lecciones
      for (const lesson of section.lessons) {
        const newLessonTitle = replaceVSCode(lesson.title);
        const newLessonDesc = replaceVSCode(lesson.description);
        const newLessonContent = replaceVSCode(lesson.content);

        if (
          newLessonTitle !== lesson.title ||
          newLessonDesc !== lesson.description ||
          newLessonContent !== lesson.content
        ) {
          console.log(`Modificando lección: "${lesson.title}"`);
          await prisma.lesson.update({
            where: { id: lesson.id },
            data: {
              title: newLessonTitle!,
              description: newLessonDesc,
              content: newLessonContent,
            },
          });
        }
      }
    }
  }

  console.log("\n¡Reemplazo de VS Code por Cursor completado con éxito!");
}

main()
  .catch((err) => {
    console.error("Error en la ejecución:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
