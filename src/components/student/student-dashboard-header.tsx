"use client";

import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  name: string;
}

import Link from "next/link";

export const StudentDashboardHeader = ({ name }: DashboardHeaderProps) => {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card/90 p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Dashboard
        </p>
        <h1 className="text-3xl font-bold text-foreground">Hola, {name}</h1>
        <p className="text-sm text-muted-foreground">
          Resumen de tu actividad y próximos pasos.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link href="/dashboard/explore">
          <Button size="default" className="px-6 py-2.5">Explorar cursos</Button>
        </Link>
        <Link href="/dashboard/my-courses">
          <Button variant="outline" size="default" className="px-6 py-2.5">
            Ver mis cursos
          </Button>
        </Link>
      </div>
    </div>
  );
};

