"use client";

import { InstructorProfileForm } from "@/components/instructor/instructor-profile-form";
import { InstructorProfileSummary } from "@/components/instructor/instructor-profile-summary";

export default function InstructorProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Perfil de instructor</h1>
        <p className="text-sm text-muted-foreground">
          Cómo te ven los estudiantes en la plataforma
        </p>
      </div>
      <InstructorProfileSummary />
      <InstructorProfileForm />
    </div>
  );
}

