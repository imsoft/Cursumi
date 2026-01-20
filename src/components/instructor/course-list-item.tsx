import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EllipsisVertical } from "lucide-react";
import { InstructorCourse } from "@/components/instructor/types";

interface CourseListItemProps {
  course: InstructorCourse;
}

const statusLabelMap: Record<InstructorCourse["status"], { label: string; variant: "default" | "outline" }> = {
  published: { label: "Publicado", variant: "default" },
  draft: { label: "Borrador", variant: "outline" },
  archived: { label: "Archivado", variant: "outline" },
};

export const CourseListItem = ({ course }: CourseListItemProps) => {
  const [archiving, setArchiving] = useState(false);
  const statusLabel = statusLabelMap[course.status];
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card/80 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-foreground">{course.title}</h3>
          <Badge variant="outline">{course.category}</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="outline">{course.modality}</Badge>
          <Badge variant={statusLabel.variant}>{statusLabel.label}</Badge>
          <span>
            {course.studentsCount} estudiantes
          </span>
          {course.nextSession && <span>Próxima: {course.nextSession}</span>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/instructor/courses/${course.id}`}>Ver</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/instructor/courses/${course.id}/edit`}>Editar</Link>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-full border border-border p-2">
            <EllipsisVertical className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/instructor/courses/${course.id}/students`}>Ver alumnos</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={async () => {
                if (archiving) return;
                try {
                  setArchiving(true);
                  await fetch(`/api/instructor/courses/${course.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: "archived" }),
                  });
                } finally {
                  setArchiving(false);
                }
              }}
            >
              {archiving ? "Archivando..." : "Archivar"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
