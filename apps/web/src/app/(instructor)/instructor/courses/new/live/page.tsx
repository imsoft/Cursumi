import { redirect } from "next/navigation";

// Las modalidades presencial y en vivo se fusionaron en "Curso por evento".
export default function CreateLiveCoursePage() {
  redirect("/instructor/courses/new/evento");
}
