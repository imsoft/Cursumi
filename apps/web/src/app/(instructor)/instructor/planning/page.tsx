import { redirect } from "next/navigation";

// La planeación didáctica ahora vive dentro de cada curso (workspace del curso).
// Esta ruta global quedó obsoleta; redirigimos a "Mis cursos" para no romper
// enlaces guardados.
export default function InstructorPlanningRedirect() {
  redirect("/instructor/courses");
}
