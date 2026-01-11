"use client";

import { PageHeader } from "@/components/shared/page-header";

export const MyCoursesHeader = () => {
  return (
    <PageHeader
      title="Mis cursos"
      description="Gestiona y continúa con tus cursos en Cursumi."
      action={{
        label: "Explorar más cursos",
        href: "/dashboard/explore",
        variant: "default",
      }}
    />
  );
};

