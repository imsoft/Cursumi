"use client";

import { useState, useMemo } from "react";
import { CertificatesHeader } from "@/components/student/certificates-header";
import { CertificateCard } from "@/components/student/certificate-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Certificate } from "@/components/student/types";
import { Award } from "lucide-react";

const mockCertificates: Certificate[] = [
  {
    id: "cert-1",
    courseId: "4",
    courseTitle: "Marketing de contenidos",
    studentName: "Brandon García",
    instructorName: "Luis Herrera",
    issueDate: "30 de septiembre, 2024",
    certificateNumber: "CUR-2024-001234",
    category: "Marketing",
    modality: "virtual",
    hours: 40,
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "cert-2",
    courseId: "6",
    courseTitle: "Fotografía digital",
    studentName: "Brandon García",
    instructorName: "María González",
    issueDate: "15 de septiembre, 2024",
    certificateNumber: "CUR-2024-001189",
    category: "Diseño",
    modality: "presencial",
    hours: 32,
    imageUrl: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "cert-3",
    courseId: "8",
    courseTitle: "Copywriting persuasivo",
    studentName: "Brandon García",
    instructorName: "Laura Fernández",
    issueDate: "25 de agosto, 2024",
    certificateNumber: "CUR-2024-001045",
    category: "Marketing",
    modality: "virtual",
    hours: 24,
    imageUrl: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=800&q=80",
  },
];

const categoryOptions = [
  { value: "all", label: "Todas" },
  { value: "Programación", label: "Programación" },
  { value: "Marketing", label: "Marketing" },
  { value: "Diseño", label: "Diseño" },
  { value: "Negocios", label: "Negocios" },
];

const modalityOptions = [
  { value: "all", label: "Todas" },
  { value: "virtual", label: "Virtual" },
  { value: "presencial", label: "Presencial" },
];

export default function CertificatesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [modalityFilter, setModalityFilter] = useState("all");

  const filteredCertificates = useMemo(() => {
    return mockCertificates
      .filter((cert) => {
        const searchLower = searchTerm.trim().toLowerCase();
        return (
          cert.courseTitle.toLowerCase().includes(searchLower) ||
          cert.instructorName.toLowerCase().includes(searchLower) ||
          cert.category.toLowerCase().includes(searchLower)
        );
      })
      .filter((cert) => {
        if (categoryFilter === "all") return true;
        return cert.category === categoryFilter;
      })
      .filter((cert) => {
        if (modalityFilter === "all") return true;
        return cert.modality === modalityFilter;
      });
  }, [searchTerm, categoryFilter, modalityFilter]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setModalityFilter("all");
  };

  const hasActiveFilters = searchTerm.trim() !== "" || categoryFilter !== "all" || modalityFilter !== "all";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <CertificatesHeader />

      <div className="rounded-2xl border border-border bg-card/90 p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex-1">
            <Input
              label="Buscar certificado"
              placeholder="Buscar por curso o instructor..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <div className="grid w-full gap-4 md:w-auto md:grid-cols-2">
            <Select
              label="Categoría"
              options={categoryOptions}
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            />
            <Select
              label="Modalidad"
              options={modalityOptions}
              value={modalityFilter}
              onChange={(event) => setModalityFilter(event.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button
              variant="ghost"
              size="sm"
              className="w-full md:w-auto"
              disabled={!hasActiveFilters}
              onClick={handleClearFilters}
            >
              Limpiar filtros
            </Button>
          </div>
        </div>
      </div>

      {filteredCertificates.length === 0 ? (
        <EmptyState
          title="No encontramos certificados"
          description="Completa más cursos para obtener certificados."
          icon={Award}
          action={{
            label: "Explorar cursos",
            href: "/courses",
            variant: "default",
          }}
          secondaryAction={
            hasActiveFilters
              ? {
                  label: "Limpiar filtros",
                  onClick: handleClearFilters,
                  variant: "outline",
                }
              : undefined
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Mostrando {filteredCertificates.length} {filteredCertificates.length === 1 ? "certificado" : "certificados"}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 md:items-stretch">
            {filteredCertificates.map((certificate) => (
              <CertificateCard key={certificate.id} certificate={certificate} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

