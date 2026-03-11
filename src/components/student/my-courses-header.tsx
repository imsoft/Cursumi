"use client";

import { PageHeader } from "@/components/shared/page-header";

export const MyCoursesHeader = () => {
  return (
    <PageHeader
      title="Mis cursos"
      description="Tus cursos inscritos. Continúa donde lo dejaste."
      action={{
        label: "Explorar más cursos",
        href: "/dashboard/explore",
        variant: "default",
      }}
    />
  );
};

