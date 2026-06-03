import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BusinessCTA({ quoteHref = "/business/cotizacion" }: { quoteHref?: string }) {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-20">
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary via-violet-600 to-purple-700 px-8 py-16 text-center shadow-2xl shadow-primary/30">
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 left-1/4 h-56 w-56 rounded-full bg-white/6 blur-3xl"
        />
        <div className="relative flex flex-col items-center gap-6">
          <h2 className="text-3xl font-black text-white sm:text-4xl">
            Empieza a capacitar a tu equipo hoy
          </h2>
          <p className="mx-auto max-w-xl text-base text-white/75">
            Solicita una cotización a la medida y descubre cómo Cursumi Business
            puede transformar la capacitación de tu empresa.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href={quoteHref}>
              <Button
                size="lg"
                variant="secondary"
                className="gap-2 font-semibold shadow-lg"
              >
                Solicitar cotización
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
