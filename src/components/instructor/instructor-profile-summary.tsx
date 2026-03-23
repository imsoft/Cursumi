"use client";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface InstructorProfileSummaryProps {
  fullName: string;
  city: string;
  bio: string;
  specialties: string;
}

export const InstructorProfileSummary = ({
  fullName,
  city,
  bio,
  specialties,
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
          <Avatar className="h-16 w-16 text-foreground">{initials}</Avatar>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-foreground">{fullName || "Instructor"}</h2>
            <p className="text-sm text-muted-foreground">Instructor</p>
            {city && <p className="text-xs text-muted-foreground">{city}</p>}
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
          <p className="text-sm text-muted-foreground">{bio}</p>
        </CardContent>
      )}
    </Card>
  );
};
