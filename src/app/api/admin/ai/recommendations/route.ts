import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, requireRole, requireSession } from "@/lib/api-helpers";
import { gemini, GEMINI_MODEL } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    await requireRole(session.user.id, ["admin"]);

    const { studentId } = await req.json();
    if (!studentId) {
      return NextResponse.json({ error: "studentId es requerido" }, { status: 400 });
    }

    const [student, availableCourses] = await Promise.all([
      prisma.user.findUnique({
        where: { id: studentId },
        include: {
          enrollments: {
            include: {
              course: {
                select: { id: true, title: true, category: true, level: true, description: true },
              },
            },
          },
        },
      }),
      prisma.course.findMany({
        where: { status: "published" },
        select: { id: true, title: true, category: true, level: true, description: true, price: true },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    ]);

    if (!student) {
      return NextResponse.json({ error: "Alumno no encontrado" }, { status: 404 });
    }

    const enrolledIds = new Set(student.enrollments.map((e) => e.course.id));
    const notEnrolled = availableCourses.filter((c) => !enrolledIds.has(c.id));

    const prompt = buildRecommendationPrompt(student, notEnrolled);

    const result = await gemini.models.generateContent({
      model: GEMINI_MODEL,
      config: {
        systemInstruction:
          "Eres un experto en aprendizaje y desarrollo de habilidades. " +
          "Analiza el perfil del alumno y genera recomendaciones de cursos personalizadas. " +
          "Responde SIEMPRE con JSON válido siguiendo exactamente el esquema solicitado.",
      },
      contents: prompt,
    });

    const raw = result.text?.trim() ?? "";
    const json = extractJson(raw);

    return NextResponse.json(json);
  } catch (error) {
    return handleApiError(error);
  }
}

function buildRecommendationPrompt(
  student: {
    name: string | null;
    enrollments: {
      course: { title: string; category: string; level?: string | null; description: string };
    }[];
  },
  availableCourses: {
    id: string;
    title: string;
    category: string;
    level?: string | null;
    description: string;
    price: number;
  }[]
): string {
  const enrolled = student.enrollments
    .map((e) => `- ${e.course.title} (${e.course.category}, nivel: ${e.course.level || "N/A"})`)
    .join("\n") || "Ninguno";

  const catalog = availableCourses
    .map((c) => `- ID:${c.id} | ${c.title} (${c.category}, nivel: ${c.level || "N/A"}) — ${c.description.slice(0, 100)}`)
    .join("\n") || "Sin cursos disponibles";

  return `Alumno: ${student.name || "Sin nombre"}

CURSOS EN LOS QUE ESTÁ INSCRITO:
${enrolled}

CATÁLOGO DISPONIBLE (no inscrito aún):
${catalog}

Basándote en los intereses y nivel del alumno, genera una respuesta JSON con EXACTAMENTE este esquema:
{
  "summary": "Resumen del perfil del alumno en 2-3 oraciones",
  "learningPath": [
    {
      "step": 1,
      "courseId": "id del curso del catálogo",
      "courseTitle": "título del curso",
      "reason": "por qué se recomienda este curso",
      "priority": "alta | media | baja"
    }
  ],
  "skills": ["habilidad 1", "habilidad 2"],
  "tips": ["consejo 1", "consejo 2"]
}

Recomienda entre 3 y 5 cursos del catálogo disponible. Responde SOLO con el JSON, sin texto adicional.`;
}

function extractJson(text: string): unknown {
  const match = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/(\{[\s\S]*\})/);
  try {
    return JSON.parse(match ? match[1] : text);
  } catch {
    return { error: "No se pudo procesar la respuesta de IA", raw: text };
  }
}
