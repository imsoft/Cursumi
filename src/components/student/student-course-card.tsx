"use client";

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StudentCourse } from "@/components/student/types";
import { CheckCircle2, Clock, PlayCircle, Calendar } from "lucide-react";

interface StudentCourseCardProps {
  course: StudentCourse;
}

const getStatusBadge = (status?: string) => {
  switch (status) {
    case "completed":
      return (
        <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] bg-green-600 hover:bg-green-700 text-white">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Completado
        </span>
      );
    case "in-progress":
      return (
        <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] bg-orange-600 hover:bg-orange-700 text-white">
          <Clock className="mr-1 h-3 w-3" />
          En progreso
        </span>
      );
    default:
      return (
        <Badge variant="outline">
          <PlayCircle className="mr-1 h-3 w-3" />
          No iniciado
        </Badge>
      );
  }
};

export const StudentCourseCard = ({ course }: StudentCourseCardProps) => {
  return (
    <Card className="group flex h-full flex-col border border-border bg-card/90 transition-shadow hover:shadow-md">
      {course.imageUrl && (
        <div className="relative h-40 w-full overflow-hidden rounded-t-2xl">
          <Image
            src={course.imageUrl}
            alt={course.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        </div>
      )}
      <CardHeader className="flex flex-col gap-3 px-4 pt-4">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg font-semibold text-foreground">
            {course.title}
          </CardTitle>
          {getStatusBadge(course.status)}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] border border-border bg-background text-muted-foreground">
            {course.modality}
          </span>
          <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] border border-border bg-background text-muted-foreground">
            {course.category}
          </span>
          <span className="text-xs">Por {course.instructorName}</span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col space-y-4 px-4 pb-4 pt-0">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">Progreso</span>
            <span className="font-semibold text-foreground">{course.progress}%</span>
          </div>
          <Progress value={course.progress} className="h-2.5 rounded-full" />
          {course.completedSessions && course.totalSessions && (
            <p className="text-xs text-muted-foreground">
              {course.completedSessions} de {course.totalSessions} sesiones completadas
            </p>
          )}
        </div>

        <div className="flex min-h-[80px] flex-1 flex-col justify-start space-y-2 border-t border-border pt-3">
          {course.status === "completed" && course.endDate && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3 w-3 text-green-600" />
              <span>Completado el {course.endDate}</span>
            </div>
          )}
          {course.status === "in-progress" && course.nextSession && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 text-orange-600" />
              <span>Próxima sesión: {course.nextSession}</span>
            </div>
          )}
          {course.startDate && course.status !== "completed" && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>Iniciado: {course.startDate}</span>
            </div>
          )}
          {course.purchaseDate && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Comprado: {course.purchaseDate}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Link href={`/dashboard/my-courses/${course.id}`} className="flex-1">
            <Button
              variant={course.status === "completed" ? "outline" : "default"}
              size="sm"
              className="w-full px-4 py-2"
            >
              {course.status === "completed" ? "Ver curso" : "Continuar curso"}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

