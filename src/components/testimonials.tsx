import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import type { PublicTestimonial } from "@/lib/public-stats";

interface TestimonialsProps {
  items: PublicTestimonial[];
}

export const Testimonials = ({ items }: TestimonialsProps) => {
  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <div className="mb-6 flex flex-col gap-2 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Testimonios
        </p>
        <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
          Historias reales de crecimiento
        </h2>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item, index) => (
          <Card key={`${item.name}-${index}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{item.name}</CardTitle>
              <CardDescription className="text-sm">{item.role}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm leading-relaxed text-muted-foreground">
                &quot;{item.quote}&quot;
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
