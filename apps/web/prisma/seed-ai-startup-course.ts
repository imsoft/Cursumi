/**
 * Seed: Curso "Desarrollo Rápido de Startups con Inteligencia Artificial y Claude"
 *
 * Crea el curso completo con 5 secciones y 15 lecciones
 * para el instructor brangarciaramos@gmail.com.
 *
 * Uso:
 *   npx tsx prisma/seed-ai-startup-course.ts
 */

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { readFileSync } from "fs";

// ── Carga de variables de entorno ─────────────────────────────────────────────

if (!process.env.DATABASE_URL) {
  try {
    const env = readFileSync(".env", "utf-8");
    for (const line of env.split("\n")) {
      const eqIdx = line.indexOf("=");
      if (eqIdx === -1) continue;
      const key = line.slice(0, eqIdx).trim();
      const val = line.slice(eqIdx + 1).trim();
      // Strip surrounding quotes (single or double)
      const unquoted = val.replace(/^['"]|['"]$/g, "");
      if (key && !process.env[key]) process.env[key] = unquoted;
    }
  } catch {
    // .env not found — DATABASE_URL must be in environment
  }
}

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter } as any);

// ── Helpers ───────────────────────────────────────────────────────────────────

function toSlugPart(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

type LessonInput = {
  title: string;
  description: string;
  duration: string;
};

type SectionInput = {
  title: string;
  description: string;
  lessons: LessonInput[];
};

// ── Contenido del curso ───────────────────────────────────────────────────────

const INSTRUCTOR_EMAIL = "brangarciaramos@gmail.com";

const COURSE = {
  title: "Desarrollo Rápido de Startups con Inteligencia Artificial y Claude",
  description:
    "Aprende a fundar y validar tu startup tecnológica utilizando Inteligencia Artificial. " +
    "En este curso práctico verás cómo apoyarte en Claude, Cursor, v0 y Make para diseñar tu " +
    "modelo de negocio, prototipar la interfaz de usuario, programar el código inicial de tu software " +
    "y automatizar operaciones complejas. Ideal para emprendedores que desean construir y lanzar " +
    "tecnología en tiempo récord sin requerir de grandes equipos iniciales.",
  category: "Emprendimiento Tecnológico",
  level: "intermedio",
  duration: "6 horas",
};

const SECTIONS: SectionInput[] = [
  {
    title: "1. Validación y Modelado con Claude",
    description: "Utiliza Claude como tu cofundador estratégico para refinar y modelar tu idea de negocio.",
    lessons: [
      {
        title: "Introducción a la IA en el Emprendimiento Tecnológico",
        description: "Cómo la IA generativa y Claude están cambiando la velocidad con la que se lanzan nuevos productos y startups.",
        duration: "12 min",
      },
      {
        title: "Análisis de Competencia y Nichos de Mercado con Claude",
        description: "Técnicas de prompt engineering para descubrir debilidades de competidores y posicionar tu producto.",
        duration: "15 min",
      },
      {
        title: "Creación de Lean Canvas y Propuesta de Valor Interactiva",
        description: "Construcción paso a paso del Lean Canvas con Claude y validación del modelo de monetización inicial.",
        duration: "18 min",
      },
    ],
  },
  {
    title: "2. Diseño de Interfaz Ultrarrápido con v0",
    description: "Prototipa interfaces profesionales usando lenguaje natural con v0 de Vercel.",
    lessons: [
      {
        title: "Prototipado Rápido de UI usando v0 de Vercel",
        description: "Cómo generar interfaces completas escribiendo instrucciones visuales simples y pulir detalles con Claude.",
        duration: "15 min",
      },
      {
        title: "Exportar y Refinar Interfaces de React",
        description: "Paso de v0 al código local: cómo estructurar e integrar componentes de Tailwind CSS y Shadcn en tu entorno.",
        duration: "20 min",
      },
      {
        title: "Pruebas de Usabilidad con Usuarios Iniciales",
        description: "Estrategias de bajo presupuesto para testear tus prototipos interactivos con usuarios antes de escribir lógica compleja.",
        duration: "12 min",
      },
    ],
  },
  {
    title: "3. Programación y Código Asistido por Cursor",
    description: "Configura y saca el máximo provecho al editor Cursor junto a modelos avanzados de IA.",
    lessons: [
      {
        title: "Configuración de Cursor como IDE Inteligente",
        description: "Instalación de extensiones clave, indexado de tu codebase local y uso de la barra lateral de chat integrada.",
        duration: "15 min",
      },
      {
        title: "Generación del Backend Inicial y APIs Asistido por Claude",
        description: "Creación de modelos de datos, rutas API y endpoints funcionales utilizando instrucciones en Cursor.",
        duration: "25 min",
      },
      {
        title: "Depuración y Pruebas del Software con Copilotos",
        description: "Uso del Composer de Cursor para diagnosticar errores comunes, corregir excepciones y robustecer tu código.",
        duration: "20 min",
      },
    ],
  },
  {
    title: "4. Automatización de Operaciones con Make y LLMs",
    description: "Automatiza la lógica de tu negocio y la comunicación sin programar servidores.",
    lessons: [
      {
        title: "Introducción a Make para Flujos de Trabajo",
        description: "Qué son los webhooks y las llamadas HTTP. Creación del primer flujo de automatización entre formularios y notificaciones.",
        duration: "15 min",
      },
      {
        title: "Integración de la API de Claude y OpenAI en Make",
        description: "Cómo enriquecer datos, clasificar leads y redactar correos usando agentes de IA integrados dentro de Make.",
        duration: "22 min",
      },
      {
        title: "Automatización del Seguimiento de Clientes y CRM",
        description: "Creación de un embudo de ventas que captura leads, genera respuestas inteligentes personalizadas y actualiza tu CRM automáticamente.",
        duration: "18 min",
      },
    ],
  },
  {
    title: "5. Growth y Lanzamiento de tu MVP",
    description: "Saca tu producto al mercado y automatiza tus primeras estrategias de marketing.",
    lessons: [
      {
        title: "Estrategia de Growth Hacking y SEO Asistida por Claude",
        description: "Uso de Claude para generar un plan de contenido enfocado en palabras clave comerciales y optimización en motores de búsqueda.",
        duration: "18 min",
      },
      {
        title: "Conexión de Stripe y Cobros en el MVP",
        description: "Cómo implementar cobros por suscripción o únicos conectando tu MVP de software con Stripe Checkout de forma sencilla.",
        duration: "15 min",
      },
      {
        title: "Conclusiones y Próximos Pasos de tu Startup",
        description: "Recomendaciones finales para iterar basándote en la retroalimentación del cliente y escalar tu infraestructura inicial.",
        duration: "10 min",
      },
    ],
  },
];

async function main() {
  console.log("🔍 Buscando instructor por email:", INSTRUCTOR_EMAIL);

  const instructor = await prisma.user.findUnique({
    where: { email: INSTRUCTOR_EMAIL },
    select: { id: true, name: true, role: true },
  });

  if (!instructor) {
    console.error(`❌ No se encontró un usuario con email: ${INSTRUCTOR_EMAIL}`);
    console.error("   Asegúrate de que la cuenta existe en la base de datos.");
    process.exit(1);
  }

  if (instructor.role !== "instructor" && instructor.role !== "admin") {
    console.error(`❌ El usuario ${INSTRUCTOR_EMAIL} tiene rol "${instructor.role}". Necesita ser "instructor" o "admin".`);
    process.exit(1);
  }

  console.log(`✅ Instructor encontrado: ${instructor.name} (${instructor.id})`);

  // Crear o buscar categoría "Emprendimiento Tecnológico"
  let category = await prisma.category.findFirst({
    where: { slug: "emprendimiento-tecnologico" },
    select: { id: true, name: true },
  });

  if (!category) {
    console.log("📝 Categoría 'Emprendimiento Tecnológico' no encontrada. Creándola...");
    category = await prisma.category.create({
      data: {
        name: "Emprendimiento Tecnológico",
        slug: "emprendimiento-tecnologico",
        order: 10,
      },
      select: { id: true, name: true },
    });
    console.log(`✅ Categoría creada: ${category.name}`);
  } else {
    console.log(`✅ Categoría encontrada: ${category.name}`);
  }

  // Generar slug
  const slug = `${toSlugPart(COURSE.title)}-por-${toSlugPart(instructor.name || "instructor")}`;

  // Verificar si ya existe un curso con este slug
  const existing = await prisma.course.findFirst({
    where: { slug },
    select: { id: true },
  });

  if (existing) {
    console.error(`❌ Ya existe un curso con slug "${slug}" (id: ${existing.id})`);
    console.error("   Elimínalo primero o cambia el título del curso.");
    process.exit(1);
  }

  console.log(`📝 Creando curso: "${COURSE.title}"`);
  console.log(`   Slug: ${slug}`);
  console.log(`   Secciones: ${SECTIONS.length}`);
  console.log(`   Lecciones totales: ${SECTIONS.reduce((acc, s) => acc + s.lessons.length, 0)}`);

  const course = await prisma.course.create({
    data: {
      instructorId: instructor.id,
      slug,
      title: COURSE.title,
      description: COURSE.description,
      category: COURSE.category,
      categoryId: category.id,
      level: COURSE.level,
      modality: "virtual",
      courseType: "ondemand",
      duration: COURSE.duration,
      price: 0,
      isFree: true,
      status: "draft",
      sections: {
        create: SECTIONS.map((section, sectionIndex) => ({
          title: section.title,
          description: section.description,
          order: sectionIndex + 1,
          lessons: {
            create: section.lessons.map((lesson, lessonIndex) => ({
              title: lesson.title,
              description: lesson.description,
              type: "video" as const,
              duration: lesson.duration,
              order: lessonIndex + 1,
              videoUrl: null,
              content: null,
            })),
          },
        })),
      },
    },
    include: {
      sections: {
        include: { lessons: true },
        orderBy: { order: "asc" },
      },
    },
  });

  console.log("\n🎉 ¡Curso de IA y Startups creado exitosamente!\n");
  console.log(`   ID: ${course.id}`);
  console.log(`   Slug: ${course.slug}`);
  console.log(`   Estado: ${course.status}`);
  console.log(`   Precio: Gratuito`);
  console.log("");

  for (const section of course.sections) {
    console.log(`   📂 Sección ${section.order}: ${section.title} (${section.lessons.length} lecciones)`);
    for (const lesson of section.lessons) {
      const videoStatus = lesson.videoUrl ? "✅" : "⏳";
      console.log(`      ${videoStatus} ${lesson.order}. ${lesson.title} — ${lesson.duration}`);
    }
  }
}

main()
  .catch((e) => {
    console.error("Error al crear el curso:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
