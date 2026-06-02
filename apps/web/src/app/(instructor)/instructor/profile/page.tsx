"use client";

import { useEffect, useState } from "react";
import { InstructorProfileForm } from "@/components/instructor/instructor-profile-form";
import { InstructorProfileSummary } from "@/components/instructor/instructor-profile-summary";
import { SignatureUpload } from "@/components/profile/signature-upload";
import { DeleteAccountSection } from "@/components/settings/delete-account-section";

interface ProfileData {
  fullName: string;
  email: string;
  avatar: string | null;
  signatureUrl: string | null;
  state: string;
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
      <InstructorProfileSummary
        fullName={profile?.fullName || ""}
        avatarUrl={profile?.avatar ?? null}
        state={profile?.state || ""}
        city={profile?.city || ""}
        bio={profile?.bio || ""}
        specialties={profile?.specialties || ""}
        editableAvatar={!!profile}
        onAvatarUploaded={() => void loadProfile()}
      />
      <InstructorProfileForm onSaved={loadProfile} />
      <SignatureUpload
        signatureUrl={profile?.signatureUrl ?? null}
        onUploaded={() => void loadProfile()}
      />
      <DeleteAccountSection userName={profile?.fullName || "Instructor"} />
    </div>
  );
}
