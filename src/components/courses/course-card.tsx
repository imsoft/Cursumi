import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Course } from "./types";

interface CourseCardProps {
  course: Course;
}

export const CourseCard = ({ course }: CourseCardProps) => {
  return (
    <Card className="flex h-full flex-col">
      <div className="relative h-48 w-full overflow-hidden rounded-t-2xl">
        <Image
          src={course.imageUrl}
          alt={course.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <span className="absolute top-3 left-3 rounded-full border border-white/80 bg-black/50 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-white">
          {course.modality === "virtual" ? "Virtual" : "Presencial"}
        </span>
      </div>
      <CardHeader className="flex flex-col gap-2 pb-0">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-muted/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            {course.city === "Online" ? "Online" : course.city}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-foreground">{course.title}</h3>
        <p className="text-sm text-muted-foreground">{course.description}</p>
      </CardHeader>
      <CardContent className="mt-3 flex flex-col gap-3 pt-0">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          <span className="rounded-full bg-muted/20 px-3 py-1 text-muted-foreground">
            {course.category}
          </span>
          <span className="rounded-full bg-muted/20 px-3 py-1 text-muted-foreground">
            {course.duration}
          </span>
        </div>
      </CardContent>
      <CardFooter className="mt-auto border-t border-border/70 px-6 py-4">
        <Button variant="outline" size="sm" className="w-full justify-between" asChild>
          <Link href={`/dashboard/explore/${course.id}`}>
            Ver detalles
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
