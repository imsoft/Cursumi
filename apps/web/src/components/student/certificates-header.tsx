"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Award } from "lucide-react";

export const CertificatesHeader = () => {
  return (
    <PageHeader
      title="Mis certificados"
      description="Descarga y comparte los certificados de los cursos que hayas completado."
      action={{
        label: "Explorar cursos",
        href: "/dashboard/explore",
        variant: "default",
        icon: <Award className="mr-2 h-4 w-4" />,
      }}
    />
  );
};

