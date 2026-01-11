import Link from "next/link";
import { Button } from "@/components/ui/button";

export const InstructorDashboardHeader = () => {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-muted-foreground">Hola, Brandon</p>
        <h1 className="text-2xl font-bold text-foreground">Este es el resumen de tus cursos y actividades en Cursumi.</h1>
      </div>
      <Link href="/instructor/courses/new">
        <Button size="lg">Crear nuevo curso</Button>
      </Link>
    </div>
  );
};

