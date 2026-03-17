import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getInstructorCourses, createCourse } from "@/lib/course-service";
import { handleApiError, requireRole, requireSession } from "@/lib/api-helpers";

const quizQuestionSchema = z.object({
  id: z.string(),
  question: z.string().min(1),
  type: z.enum(["multiple-choice", "true-false", "short-answer"]),
  options: z.array(z.string()).optional(),
  correctAnswer: z.union([z.string(), z.number()]).optional(),
  points: z.number().nonnegative().optional(),
});

const lessonSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  type: z.enum(["video", "text", "quiz", "assignment"]),
  duration: z.string().optional(),
  order: z.number().int().nonnegative(),
  content: z.string().optional(),
  videoUrl: z.string().optional(),
  files: z.array(z.object({ id: z.string(), name: z.string(), type: z.enum(["pdf", "image", "document", "other"]), url: z.string(), size: z.number().optional() })).optional(),
  resources: z.array(z.object({ id: z.string(), title: z.string(), url: z.string(), type: z.enum(["link", "file"]) })).optional(),
  quizQuestions: z.array(quizQuestionSchema).optional(),
  evaluationCriteria: z.array(z.object({ id: z.string(), criterion: z.string(), points: z.number().optional(), description: z.string().optional() })).optional(),
});

const sectionSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  order: z.number().int().nonnegative(),
  lessons: z.array(lessonSchema).default([]),
  quiz: z.object({
    passingScore: z.number().min(0).max(100),
    questions: z.array(z.object({ question: z.string(), options: z.array(z.string()), correct: z.number().int().nonnegative() })),
  }).optional(),
  minigame: z.discriminatedUnion("type", [
    z.object({ type: z.literal("memory"), pairs: z.array(z.object({ term: z.string(), definition: z.string() })) }),
    z.object({ type: z.literal("hangman"), words: z.array(z.object({ word: z.string(), hint: z.string() })) }),
    z.object({ type: z.literal("sort"), instruction: z.string(), items: z.array(z.string()) }),
  ]).optional(),
});

const createCourseSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  category: z.string().min(1),
  level: z.string().min(1),
  modality: z.enum(["virtual", "presencial"]),
  city: z.string().max(100).optional(),
  location: z.string().max(200).optional(),
  courseType: z.string().min(1),
  startDate: z.string(),
  duration: z.string().min(1),
  price: z.number().int().nonnegative(),
  maxStudents: z.number().int().positive().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  sections: z.array(sectionSchema).default([]),
  finalExam: z.object({
    id: z.string(),
    title: z.string().min(1),
    description: z.string().optional(),
    instructions: z.string().optional(),
    passingScore: z.number().min(0).max(100),
    questions: z.array(quizQuestionSchema).min(1),
    timeLimit: z.number().positive().optional(),
    attemptsAllowed: z.number().int().positive().optional(),
  }).optional(),
  isDraft: z.boolean().default(true),
});

export async function GET() {
  try {
    const session = await requireSession();
    await requireRole(session.user.id, ["instructor", "admin"]);
    const courses = await getInstructorCourses(session.user.id);
    return NextResponse.json(courses);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    await requireRole(session.user.id, ["instructor", "admin"]);

    const raw = await req.json().catch(() => null);
    if (!raw) {
      return NextResponse.json({ error: "Cuerpo de la petición inválido" }, { status: 400 });
    }

    const parsed = createCourseSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const { isDraft, ...courseData } = parsed.data;
    const course = await createCourse(session.user.id, { ...courseData, status: isDraft ? "draft" : "published" });
    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
