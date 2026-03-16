import { Quote } from "lucide-react";
import type { PublicTestimonial } from "@/lib/public-stats";

interface TestimonialsProps {
  items: PublicTestimonial[];
}

export const Testimonials = ({ items }: TestimonialsProps) => {
  if (items.length === 0) return null;

  return (
    <section className="bg-muted/30 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-2 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
            Testimonios
          </p>
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl">
            Historias reales de crecimiento
          </h2>
        </div>

        {/* Grid */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item, index) => (
            <blockquote
              key={`${item.name}-${index}`}
              className="group flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/8"
            >
              <Quote
                className="h-6 w-6 text-primary/30 transition-colors duration-200 group-hover:text-primary/50"
                aria-hidden
              />
              <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                &ldquo;{item.quote}&rdquo;
              </p>
              <footer className="flex items-center gap-3 border-t border-border pt-4">
                {/* Avatar initial */}
                <div
                  aria-hidden
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-black text-primary"
                >
                  {item.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <cite className="text-sm font-bold not-italic text-foreground">
                    {item.name}
                  </cite>
                  <p className="text-xs text-muted-foreground">{item.role}</p>
                </div>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
};
