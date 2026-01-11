"use client";

import { InstructorProfileForm } from "@/components/instructor/instructor-profile-form";
import { InstructorProfileSummary } from "@/components/instructor/instructor-profile-summary";

export default function InstructorProfilePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Perfil de instructor</h1>
        <p className="text-sm text-muted-foreground">
          Actualiza tu información para que tus estudiantes te conozcan mejor.
        </p>
      </div>
      <InstructorProfileSummary />
      <InstructorProfileForm />
    </div>
  );
}

