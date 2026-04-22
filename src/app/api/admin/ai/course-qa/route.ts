import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, requireRole, requireSession } from "@/lib/api-helpers";
import { getGemini, GEMINI_MODEL } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    await requireRole(session.user.id, ["admin"]);

    const { courseId, question, history } = await req.json();

    if (!courseId || !question) {
      return NextResponse.json({ error: "courseId y question son requeridos" }, { status: 400 });
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        instructor: { select: { name: true } },
        sections: {
          orderBy: { order: "asc" },
          include: {
            lessons: {
              orderBy: { order: "asc" },
              select: {
                title: true,
                description: true,
                type: true,
                content: true,
                duration: true,
              },
            },
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 });
    }

    const courseContext = buildCourseContext(course);

    const systemInstruction = `Eres un asistente educativo experto en el curso "${course.title}".
Tu función es responder preguntas sobre el contenido del curso de forma clara, precisa y pedagógica.
Responde siempre en español. Si la pregunta no tiene relación con el curso, indícalo amablemente.
Usa formato markdown cuando sea útil (listas, negritas, código, etc.).

CONTENIDO DEL CURSO:
${courseContext}`;

    const contents = buildContents(history, question);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const ai = getGemini();
          const result = await ai.models.generateContentStream({
            model: GEMINI_MODEL,
            config: { systemInstruction },
            contents,
          });
          for await (const chunk of result) {
            if (chunk.text) {
              controller.enqueue(encoder.encode(chunk.text));
            }
          }
        } catch (err) {
          console.error("[course-qa stream]", err);
          controller.enqueue(encoder.encode("Error al generar respuesta. Verifica la configuración de la API."));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

function buildCourseContext(course: {
  title: string;
  description: string;
  category: string;
  level?: string | null;
  instructor: { name: string | null };
  sections: {
    title: string;
    lessons: {
      title: string;
      description?: string | null;
      type: string;
      content?: string | null;
      duration?: string | null;
    }[];
  }[];
}): string {
  const lines: string[] = [
    `Título: ${course.title}`,
    `Descripción: ${course.description}`,
    `Categoría: ${course.category}`,
    `Nivel: ${course.level || "No especificado"}`,
    `Instructor: ${course.instructor?.name || "N/A"}`,
    "",
    "TEMARIO:",
  ];

  for (const section of course.sections) {
    lines.push(`\n## ${section.title}`);
    for (const lesson of section.lessons) {
      lines.push(`  - [${lesson.type.toUpperCase()}] ${lesson.title}${lesson.duration ? ` (${lesson.duration})` : ""}`);
      if (lesson.description) lines.push(`    ${lesson.description}`);
      if (lesson.content && lesson.content.length < 2000) {
        lines.push(`    Contenido: ${lesson.content.slice(0, 1500)}`);
      }
    }
  }

  return lines.join("\n");
}

type GeminiContent = {
  role: "user" | "model";
  parts: { text: string }[];
};

function buildContents(
  history: { role: "user" | "assistant"; content: string }[] | undefined,
  question: string
): GeminiContent[] {
  const contents: GeminiContent[] = [];

  if (history?.length) {
    for (const msg of history) {
      contents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      });
    }
  }

  contents.push({ role: "user", parts: [{ text: question }] });
  return contents;
}
