import { prisma } from "@/lib/prisma";

const siteUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://cursumi.com").replace(/\/$/, "");

export const revalidate = 3600; // regenerar cada hora

export async function GET() {
  let courseLines = "";

  try {
    const courses = await prisma.course.findMany({
      where: { status: "published" },
      select: {
        title: true,
        slug: true,
        id: true,
        description: true,
        category: true,
        modality: true,
        price: true,
        level: true,
        instructor: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    if (courses.length > 0) {
      courseLines =
        "\n## Cursos disponibles\n\n" +
        courses
          .map((c) => {
            const slug = c.slug || c.id;
            const instructor = c.instructor.name ? ` · Instructor: ${c.instructor.name}` : "";
            const modality =
              c.modality === "virtual" ? "Online" :
              c.modality === "presencial" ? "Presencial" : "En vivo";
            const price = c.price === 0 ? "Gratis" : `$${c.price} MXN`;
            const desc = c.description
              ? ` ${c.description.replace(/<[^>]+>/g, "").slice(0, 120).trim()}…`
              : "";
            return `- [${c.title}](${siteUrl}/courses/${slug}): ${modality}${instructor} · ${price}${desc}`;
          })
          .join("\n");
    }
  } catch {
    // BD no disponible, omitir cursos
  }

  const body = `# Cursumi

> Plataforma de cursos virtuales y presenciales con instructores expertos en México. Conecta estudiantes e instructores para experiencias de aprendizaje reales.

## Páginas principales

- [Inicio](${siteUrl}/): Página principal de Cursumi — cursos destacados y propuesta de valor
- [Catálogo de cursos](${siteUrl}/courses): Todos los cursos disponibles — filtrables por categoría, modalidad y precio
- [Instructores](${siteUrl}/instructors): Perfiles públicos de instructores
- [Cómo funciona](${siteUrl}/how-it-works): Explicación del modelo educativo de Cursumi
- [Precios](${siteUrl}/pricing): Planes y precios de acceso a cursos
- [Blog](${siteUrl}/blog): Artículos educativos y noticias de la plataforma
- [Para empresas](${siteUrl}/business): Solución de formación corporativa
- [Contacto](${siteUrl}/contact): Formulario de contacto y soporte
${courseLines}

## Sobre Cursumi

Cursumi es una plataforma educativa mexicana que ofrece cursos en tres modalidades: virtual (a tu ritmo), presencial (en sede) y en vivo (videollamada con instructor). Los cursos incluyen video, texto, quizzes, tareas y certificado de finalización.

## No indexar

Las rutas /dashboard, /instructor, /admin y /api son privadas y no deben indexarse.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
