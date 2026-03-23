"use client";

import { useEffect, useState } from "react";
import { InstructorProfileForm } from "@/components/instructor/instructor-profile-form";
import { InstructorProfileSummary } from "@/components/instructor/instructor-profile-summary";
import { UserAvatarUpload } from "@/components/profile/user-avatar-upload";

interface ProfileData {
  fullName: string;
  email: string;
  avatar: string | null;
  city: string;
  headline: string;
  bio: string;
  specialties: string;
}

export default function InstructorProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = async () => {
    try {
      const res = await fetch("/api/instructor/profile", { cache: "no-store" });
      if (!res.ok) throw new Error("No pudimos cargar tu perfil");
      const data = await res.json();
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar perfil");
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Perfil de instructor</h1>
        <p className="text-sm text-muted-foreground">
          Cómo te ven los estudiantes en la plataforma
        </p>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {profile && (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card/50 p-4 sm:flex-row sm:items-center sm:gap-6">
          <UserAvatarUpload
            name={profile.fullName}
            avatarUrl={profile.avatar}
            onUploaded={() => void loadProfile()}
            sizeClass="h-20 w-20"
            showHint={false}
          />
          <p className="text-center text-sm text-muted-foreground sm:text-left">
            Esta foto se muestra en tus cursos y al hablar con estudiantes.
          </p>
        </div>
      )}
      <InstructorProfileSummary
        fullName={profile?.fullName || ""}
        avatarUrl={profile?.avatar ?? null}
        city={profile?.city || ""}
        bio={profile?.bio || ""}
        specialties={profile?.specialties || ""}
      />
      <InstructorProfileForm onSaved={loadProfile} />
    </div>
  );
}
