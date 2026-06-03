import type { Metadata } from "next";
import { QuoteRequestForm } from "@/components/business/quote-request-form";

export const metadata: Metadata = {
  title: "Solicita una cotización | Cursumi",
  robots: { index: false, follow: false },
};

export default function InstructorQuotePage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-black text-foreground">Cotización a tu medida</h1>
        <p className="text-muted-foreground">
          El precio depende de la cantidad de cursos, el tamaño de tu empresa y tus
          necesidades. Cuéntanos y te preparamos una propuesta.
        </p>
      </div>
      <QuoteRequestForm />
    </div>
  );
}
