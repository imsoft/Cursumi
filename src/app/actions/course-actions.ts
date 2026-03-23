"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  getInstructorCourses,
  createCourse,
  updateCourse,
  getCourseDetail,
  type InstructorCourseListItem,
  listPublishedCourses,
  listStudentCourses,
  listRecommendations,
  listCourseStudents,
  getPublishedCourse,
  getStudentCourseDetail,
  createSection,
  deleteSection,
  updateSectionData,
  createLesson,
  deleteLessonById,
  getLessonById,
  updateLessonById,
  getCourseExam,
  saveCourseExam,
  updateCourseInfo,
} from "@/lib/course-service";
import type { CourseFormData, CourseLesson, CourseFinalExam, SectionQuiz, SectionMinigame } from "@/components/instructor/course-types";
import type { Course } from "@/components/courses/types";
import type { StudentCourse, Recommendation } from "@/components/student/types";
import type { CourseStudent, StudentCourseDetail } from "@/lib/course-service";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

async function requireSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("No autenticado");
  }

  return session;
}

export async function listInstructorCourses(): Promise<InstructorCourseListItem[]> {
  const session = await requireSession();
  return getInstructorCourses(session.user.id);
}

export async function listPublicCourses(): Promise<Course[]> {
  const { courses } = await listPublishedCourses();
  return courses;
}

export async function listMyCourses(): Promise<StudentCourse[]> {
  const session = await requireSession();
  return listStudentCourses(session.user.id);
}

export async function listRecommendationsForUser(): Promise<Recommendation[]> {
  const session = await requireSession();
  const myCourses = await listStudentCourses(session.user.id);
  const excludeIds = myCourses.map((c) => c.id);
  return listRecommendations(excludeIds);
}

export async function createCourseDraft(data: CourseFormData) {
  const session = await requireSession();
  if (data.id) {
    await updateCourse(data.id, session.user.id, { ...data, id: data.id, status: "draft" });
    return { id: data.id };
  }
  return createCourse(session.user.id, { ...data, status: "draft" });
}

export async function publishCourse(data: CourseFormData) {
  const session = await requireSession();

  // Validate before publishing
  const { validateCourseForPublish } = await import("@/lib/course-completion");
  const sectionsCount = data.sections?.length ?? 0;
  const validation = validateCourseForPublish({
    title: data.title ?? "",
    imageUrl: data.imageUrl,
    sectionsCount,
  });
  if (!validation.canPublish) {
    throw new Error(validation.errors.join(" · "));
  }

  if (data.id) {
    await updateCourse(data.id, session.user.id, { ...data, id: data.id, status: "published" });
    return { id: data.id };
  }
  return createCourse(session.user.id, { ...data, status: "published" });
}

export async function getCourseDetailForUser(courseId: string) {
  const session = await requireSession();
  const course = await getCourseDetail(courseId);
  if (!course) {
    throw new Error("Curso no encontrado");
  }
  if (course.instructorId !== session.user.id) {
    throw new Error("No autorizado para ver este curso");
  }
  return course;
}

export async function listStudentsForCourse(courseId: string): Promise<CourseStudent[]> {
  const session = await requireSession();
  const course = await getCourseDetail(courseId);
  if (!course || course.instructorId !== session.user.id) {
    throw new Error("No autorizado");
  }
  return listCourseStudents(courseId);
}

export async function getPublishedCourseDetail(courseId: string) {
  return getPublishedCourse(courseId);
}

export async function enrollInCourse(courseId: string) {
  const session = await requireSession();
  const course = await getPublishedCourse(courseId);
  if (!course) {
    throw new Error("Curso no encontrado o no publicado");
  }

  await prisma.enrollment.upsert({
    where: {
      courseId_studentId: {
        courseId,
        studentId: session.user.id,
      },
    },
    update: {
      status: "active",
    },
    create: {
      courseId,
      studentId: session.user.id,
      status: "active",
      progress: 0,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/my-courses");
  revalidatePath(`/dashboard/explore/${courseId}`);
  return { enrolled: true };
}

export async function getMyCourseDetail(courseId: string): Promise<StudentCourseDetail | null> {
  const session = await requireSession();
  const detail = await getStudentCourseDetail(courseId, session.user.id);
  if (!detail) {
    return null;
  }
  return detail;
}

// ─── Instructor course editor actions ────────────────────────────────────────

async function verifyCourseOwner(courseId: string, userId: string) {
  const course = await prisma.course.findFirst({
    where: { id: courseId, instructorId: userId },
    select: { id: true },
  });
  if (!course) throw new Error("No autorizado");
}

export async function addSection(courseId: string, title: string) {
  const session = await requireSession();
  await verifyCourseOwner(courseId, session.user.id);
  const count = await prisma.courseSection.count({ where: { courseId } });
  const section = await createSection(courseId, title, count + 1);
  revalidatePath(`/instructor/courses/${courseId}/edit`);
  return { id: section.id };
}

export async function removeSection(courseId: string, sectionId: string) {
  const session = await requireSession();
  await verifyCourseOwner(courseId, session.user.id);
  const section = await prisma.courseSection.findFirst({ where: { id: sectionId, courseId } });
  if (!section) throw new Error("Sección no encontrada");
  await deleteSection(sectionId);
  revalidatePath(`/instructor/courses/${courseId}/edit`);
}

export async function editSection(
  courseId: string,
  sectionId: string,
  data: { title?: string; description?: string; quiz?: SectionQuiz | null; minigame?: SectionMinigame | null }
) {
  const session = await requireSession();
  await verifyCourseOwner(courseId, session.user.id);
  await updateSectionData(sectionId, {
    title: data.title,
    description: data.description,
    quiz: data.quiz as object | null,
    minigame: data.minigame as object | null,
  });
  revalidatePath(`/instructor/courses/${courseId}/edit`);
}

export async function addLesson(courseId: string, sectionId: string, title: string, type: CourseLesson["type"]) {
  const session = await requireSession();
  await verifyCourseOwner(courseId, session.user.id);
  const section = await prisma.courseSection.findFirst({ where: { id: sectionId, courseId } });
  if (!section) throw new Error("Sección no encontrada");
  const count = await prisma.lesson.count({ where: { sectionId } });
  const lesson = await createLesson(sectionId, { title, type: type as any, order: count + 1 });
  revalidatePath(`/instructor/courses/${courseId}/edit`);
  return { id: lesson.id };
}

export async function removeLesson(courseId: string, lessonId: string) {
  const session = await requireSession();
  await verifyCourseOwner(courseId, session.user.id);
  const lesson = await getLessonById(lessonId);
  if (!lesson || lesson.section.courseId !== courseId) throw new Error("Lección no encontrada");
  await deleteLessonById(lessonId);
  revalidatePath(`/instructor/courses/${courseId}/edit`);
}

export async function getLessonForEdit(courseId: string, lessonId: string): Promise<CourseLesson | null> {
  const session = await requireSession();
  await verifyCourseOwner(courseId, session.user.id);
  const lesson = await getLessonById(lessonId);
  if (!lesson || lesson.section.courseId !== courseId) return null;

  let content = lesson.content || "";
  let quizQuestions: CourseLesson["quizQuestions"];
  let evaluationCriteria: CourseLesson["evaluationCriteria"];

  if (lesson.type === "quiz" && lesson.content) {
    try {
      const p = JSON.parse(lesson.content);
      content = p.instructions || "";
      quizQuestions = p.questions || [];
    } catch {}
  } else if (lesson.type === "assignment" && lesson.content) {
    try {
      const p = JSON.parse(lesson.content);
      content = p.instructions || "";
      evaluationCriteria = p.criteria || [];
    } catch {}
  }

  return {
    id: lesson.id,
    title: lesson.title,
    description: lesson.description || "",
    type: lesson.type as CourseLesson["type"],
    duration: lesson.duration || "",
    order: lesson.order,
    content,
    videoUrl: lesson.videoUrl || "",
    files: Array.isArray(lesson.attachments) ? (lesson.attachments as any[]) : [],
    resources: Array.isArray(lesson.resources) ? (lesson.resources as any[]) : [],
    quizQuestions,
    evaluationCriteria,
  };
}

export async function saveLessonContent(courseId: string, lessonId: string, data: Partial<CourseLesson>) {
  const session = await requireSession();
  await verifyCourseOwner(courseId, session.user.id);
  const lesson = await getLessonById(lessonId);
  if (!lesson || lesson.section.courseId !== courseId) throw new Error("No autorizado");

  let content: string | null = null;
  if (data.type === "quiz") {
    content = JSON.stringify({ instructions: data.content || "", questions: data.quizQuestions || [] });
  } else if (data.type === "assignment") {
    content = JSON.stringify({ instructions: data.content || "", criteria: data.evaluationCriteria || [] });
  } else {
    content = data.content || null;
  }

  await updateLessonById(lessonId, {
    title: data.title,
    description: data.description || null,
    type: data.type as any,
    duration: data.duration || null,
    videoUrl: data.videoUrl || null,
    content,
    attachments: (data.files?.length ? data.files : null) as object[] | null,
    resources: (data.resources?.length ? data.resources : null) as object[] | null,
  });
  revalidatePath(`/instructor/courses/${courseId}/edit`);
}

export async function getCourseExamForEdit(courseId: string): Promise<CourseFinalExam | null> {
  const session = await requireSession();
  await verifyCourseOwner(courseId, session.user.id);
  return getCourseExam(courseId) as Promise<CourseFinalExam | null>;
}

export async function saveCourseExamContent(courseId: string, exam: CourseFinalExam | null) {
  const session = await requireSession();
  await verifyCourseOwner(courseId, session.user.id);
  await saveCourseExam(courseId, exam as object | null);
  revalidatePath(`/instructor/courses/${courseId}/edit`);
}

export async function updateCourseBasicInfo(courseId: string, data: Parameters<typeof updateCourseInfo>[2]) {
  const session = await requireSession();
  await updateCourseInfo(courseId, session.user.id, data);
  revalidatePath(`/instructor/courses/${courseId}/edit`);
}

export async function deleteCourseById(courseId: string): Promise<{ success: boolean; error?: string }> {
  const session = await requireSession();
  await verifyCourseOwner(courseId, session.user.id);
  const course = await prisma.course.findFirst({
    where: { id: courseId },
    select: { _count: { select: { enrollments: true } } },
  });
  if (course && course._count.enrollments > 0) {
    return { success: false, error: "No puedes eliminar un curso con estudiantes inscritos" };
  }
  await prisma.course.delete({ where: { id: courseId } });
  revalidatePath("/instructor/courses");
  return { success: true };
}

export async function publishCourseById(courseId: string): Promise<{ success: boolean; error?: string }> {
  const session = await requireSession();
  await verifyCourseOwner(courseId, session.user.id);
  const course = await getCourseDetail(courseId);
  if (!course) return { success: false, error: "Curso no encontrado" };
  const { validateCourseForPublish } = await import("@/lib/course-completion");
  const validation = validateCourseForPublish({
    title: course.title ?? "",
    imageUrl: course.imageUrl,
    sectionsCount: course.sections?.length ?? 0,
  });
  if (!validation.canPublish) return { success: false, error: validation.errors.join(" · ") };
  await prisma.course.update({ where: { id: courseId }, data: { status: "published" } });
  revalidatePath(`/instructor/courses/${courseId}/edit`);
  return { success: true };
}
