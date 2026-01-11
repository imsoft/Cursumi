"use client";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const InstructorProfileSummary = () => {
  return (
    <Card className="border border-border bg-card/90">
      <CardHeader className="flex flex-col gap-3 px-6 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 text-foreground">BG</Avatar>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-foreground">Brandon García</h2>
            <p className="text-sm text-muted-foreground">Instructor</p>
            <p className="text-xs text-muted-foreground">Ciudad de México</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">Programación</Badge>
          <Badge variant="outline">Marketing</Badge>
          <Badge variant="outline">Diseño</Badge>
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-0">
        <p className="text-sm text-muted-foreground">
          Instructor con experiencia en bootcamps presenciales y programas virtuales.
        </p>
      </CardContent>
    </Card>
  );
};

