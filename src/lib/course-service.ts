/**
 * Barrel de course-service.
 *
 * Re-exporta todo desde los sub-módulos para mantener compatibilidad con
 * los 19 archivos que importan desde aquí. Para nuevo código, importar
 * directamente desde el sub-módulo correspondiente:
 *
 *   import { listPublishedCourses } from "@/lib/course-service-public";
 *   import { createCourse } from "@/lib/course-service-instructor";
 *   import { getLessonForStudent } from "@/lib/course-service-student";
 */
export * from "./course-service-instructor";
export * from "./course-service-public";
export * from "./course-service-student";
