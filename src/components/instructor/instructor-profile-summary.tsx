"use client";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { UserAvatarUpload } from "@/components/profile/user-avatar-upload";
import { RichTextRenderer } from "@/components/ui/rich-text-renderer";
import { formatMexicoLocation } from "@/lib/mexico-location-helpers";

interface InstructorProfileSummaryProps {
  fullName: string;
  avatarUrl?: string | null;
  state?: string;
  city: string;
  bio: string;
  specialties: string;
  /** Si true, un solo avatar con opción de subir foto (evita duplicar la imagen arriba) */
  editableAvatar?: boolean;
  onAvatarUploaded?: () => void;
}

export const InstructorProfileSummary = ({
  fullName,
  avatarUrl,
  state,
  city,
  bio,
  specialties,
  editableAvatar = false,
  onAvatarUploaded,
}: InstructorProfileSummaryProps) => {
  const initials =
    fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "IN";

  const specialtiesList = specialties
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <Card className="border border-border bg-card/90">
      <CardHeader className="flex flex-col gap-3 px-6 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {editableAvatar ? (
            <UserAvatarUpload
              name={fullName || "Instructor"}
              avatarUrl={avatarUrl ?? null}
              onUploaded={onAvatarUploaded}
              sizeClass="h-16 w-16"
              showHint={false}
              layout="row"
            />
          ) : (
            <Avatar className="h-16 w-16 shrink-0 text-foreground">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
              ) : (
                initials
              )}
            </Avatar>
          )}
          <div className="min-w-0 space-y-1">
            <h2 className="text-xl font-bold text-foreground">{fullName || "Instructor"}</h2>
            <p className="text-sm text-muted-foreground">Instructor</p>
            {(city || state) && (
              <p className="text-xs text-muted-foreground">{formatMexicoLocation(city, state)}</p>
            )}
            {editableAvatar && (
              <p className="text-xs text-muted-foreground pt-1">
                Esta foto se muestra en tus cursos y al hablar con estudiantes. Pasa el ratón sobre la
                imagen para cambiarla.
              </p>
            )}
          </div>
        </div>
        {specialtiesList.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {specialtiesList.map((s) => (
              <Badge key={s} variant="outline">
                {s}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      {bio && (
        <CardContent className="px-6 pb-6 pt-0">
          <RichTextRenderer content={bio} className="text-sm text-muted-foreground" />
        </CardContent>
      )}
    </Card>
  );
};
