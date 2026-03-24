import Link from "next/link";
import { Mail, MapPin, Clock } from "lucide-react";

export const ContactInfo = () => {
  return (
    <div className="flex flex-col gap-4">
      {/* Response time highlight */}
      <div className="rounded-2xl border border-primary/15 bg-primary/6 p-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" aria-hidden />
          <span className="text-sm font-semibold text-foreground">
            Tiempo de respuesta
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Menos de 24 h hábiles. Lunes a viernes, 9 am – 6 pm.
        </p>
      </div>

      {/* Email */}
      <div className="rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:shadow-md">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Mail className="h-4 w-4 text-primary" aria-hidden />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Escríbenos
            </p>
            <Link
              href="mailto:cursumi.com@gmail.com"
              className="mt-0.5 text-sm text-primary transition-colors hover:underline"
            >
              Enviar correo electrónico
            </Link>
          </div>
        </div>
      </div>

      {/* Ciudades */}
      <div className="rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:shadow-md">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <MapPin className="h-4 w-4 text-primary" aria-hidden />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Ciudades
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              CDMX · Guadalajara · Monterrey
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
