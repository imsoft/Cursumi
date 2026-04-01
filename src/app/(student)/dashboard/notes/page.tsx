import { redirect } from "next/navigation";
import { getCachedSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { NotesClient } from "./notes-client";

export const metadata = {
  title: "Mis Notas | Cursumi",
  description: "Consulta y filtra las anotaciones de tus cursos por instructor y lección.",
};

export default async function NotesPage() {
  const session = await getCachedSession();
  if (!session) redirect("/login");

  // Fetch all notes for this student with relations
  const initialNotes = await prisma.courseNote.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          instructorId: true,
          instructor: {
            select: { name: true }
          }
        }
      },
      lesson: {
        select: { title: true }
      }
    }
  });

  // Prisma returns Dates natively, we must stringify them for Client Component props
  const serializedNotes = initialNotes.map(n => ({
    ...n,
    createdAt: n.createdAt.toISOString(),
    updatedAt: n.updatedAt.toISOString(),
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <NotesClient initialNotes={serializedNotes} />
    </div>
  );
}
