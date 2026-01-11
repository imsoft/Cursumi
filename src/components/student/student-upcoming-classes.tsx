"use client";

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UpcomingClass } from "@/components/student/types";

interface StudentUpcomingClassesProps {
  classes: UpcomingClass[];
}

export const StudentUpcomingClasses = ({ classes }: StudentUpcomingClassesProps) => {
  return (
    <Card className="flex h-full flex-col border border-border bg-card/90">
      <CardHeader className="flex flex-col gap-2 px-4 pt-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Próximas sesiones</CardTitle>
          <Badge variant="outline">{classes.length} sesiones</Badge>
        </div>
        <p className="text-sm text-muted-foreground">Mantén el ritmo de tu aprendizaje.</p>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col space-y-3 px-4 pb-4 pt-0">
        {classes.map((item) => (
          <div key={item.id} className="group flex flex-1 flex-col overflow-hidden rounded-xl border border-border/80 bg-background/80 transition-shadow hover:shadow-md">
            {item.imageUrl && (
              <div className="relative h-32 w-full overflow-hidden">
                <Image
                  src={item.imageUrl}
                  alt={item.courseTitle}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
              </div>
            )}
            <div className="flex flex-1 flex-col p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">{item.courseTitle}</p>
                <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] border border-border bg-background text-muted-foreground ml-2">{item.modality}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{item.dateTime}</p>
              <p className="text-xs text-muted-foreground">
                Instructor: {item.instructorName}
                {item.city ? ` · ${item.city}` : ""}
              </p>
              <div className="mt-auto pt-2 flex justify-end">
                <Link href={`/dashboard/my-courses/${item.id}`}>
                  <Button variant="ghost" size="sm" className="px-4 py-2">
                    Ver curso
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

