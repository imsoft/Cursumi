import type { Metadata } from "next";
import { QuoteRequestForm } from "@/components/business/quote-request-form";

export const metadata: Metadata = {
  title: "Solicita una cotización | Cursumi Business",
  description:
    "Cuéntanos sobre tu empresa y te enviaremos una cotización a la medida para capacitar a tu equipo con Cursumi.",
};

export default function BusinessQuotePage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-16">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-foreground">Cotización a tu medida</h1>
        <p className="text-muted-foreground">
          El precio depende de la cantidad de cursos, el tamaño de tu empresa y tus
          necesidades. Cuéntanos y te preparamos una propuesta.
        </p>
      </div>
      <QuoteRequestForm />
    </div>
  );
}
