import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCachedSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { QueAprendisteForm } from "./que-aprendiste-form";

export const metadata = {
  title: "¿Qué aprendiste? | Cursumi",
};

export default async function QueAprendistePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const session = await getCachedSession();
  if (!session) redirect("/login");

  const enrollment = await prisma.enrollment.findUnique({
    where: { courseId_studentId: { courseId, studentId: session.user.id } },
    include: {
      course: { select: { title: true, slug: true } },
      learningReflection: { select: { content: true } },
    },
  });

  if (!enrollment) {
    redirect("/dashboard/my-courses");
  }

  const canSubmit =
    enrollment.status === "completed" || enrollment.learningReflectionEmailSentAt != null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Button variant="ghost" size="sm" className="-ml-2 h-8 px-2" asChild>
          <Link href={`/dashboard/my-courses/${courseId}`}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Volver al curso
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">¿Qué aprendiste?</h1>
        <p className="mt-1 text-muted-foreground">{enrollment.course.title}</p>
      </div>

      {!canSubmit && (
        <p className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-foreground">
          Cuando completes el curso en la plataforma o, si es presencial, después de la fecha de tu sesión,
          te enviaremos un correo para que puedas contar qué aprendiste. Tu respuesta podrá mostrarse en la
          página pública del curso (solo tu nombre de pila).
        </p>
      )}

      {canSubmit && (
        <QueAprendisteForm
          courseId={courseId}
          initialContent={enrollment.learningReflection?.content ?? ""}
          courseSlug={enrollment.course.slug}
        />
      )}
    </div>
  );
}
