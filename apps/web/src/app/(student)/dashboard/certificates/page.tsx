"use client";

import { useEffect, useMemo, useState } from "react";
import { CertificatesHeader } from "@/components/student/certificates-header";
import { CertificateCard } from "@/components/student/certificate-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";
import { Certificate } from "@/components/student/types";
import { Award } from "lucide-react";

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
  { value: "live", label: "En vivo" },
  { value: "presencial", label: "Presencial" },
];

export default function CertificatesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [modalityFilter, setModalityFilter] = useState("all");
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/me/certificates", { cache: "no-store" });
        if (!res.ok) {
          throw new Error("No pudimos cargar tus certificados");
        }
        const data = (await res.json()) as Certificate[];
        setCertificates(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar certificados");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredCertificates = useMemo(() => {
    return certificates
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
    <div className="space-y-6">
      <CertificatesHeader />
      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="rounded-2xl border border-border bg-card/90 p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex-1">
            <Input
              label="Buscar certificado"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <div className="grid w-full gap-4 md:w-auto md:grid-cols-2">
            <Combobox
              label="Categoría"
              options={categoryOptions}
              value={categoryFilter}
              onValueChange={setCategoryFilter}
            />
            <Combobox
              label="Modalidad"
              options={modalityOptions}
              value={modalityFilter}
              onValueChange={setModalityFilter}
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

      {loading ? (
        <div className="rounded-xl border border-border bg-card/90 p-6 text-center text-muted-foreground">
          Cargando certificados...
        </div>
      ) : filteredCertificates.length === 0 ? (
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
