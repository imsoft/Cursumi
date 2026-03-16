import Link from "next/link";
import { Mail, Users, MapPin, Clock, MessageCircle } from "lucide-react";

const contactItems = [
  {
    title: "Correo general",
    value: "contacto@cursumi.com",
    href: "mailto:contacto@cursumi.com",
    icon: Mail,
  },
  {
    title: "Soporte técnico",
    value: "soporte@cursumi.com",
    href: "mailto:soporte@cursumi.com",
    icon: MessageCircle,
  },
  {
    title: "Para instructores",
    value: "instructores@cursumi.com",
    href: "mailto:instructores@cursumi.com",
    icon: Users,
  },
  {
    title: "Ciudades",
    value: "CDMX · Guadalajara · Monterrey",
    href: null,
    icon: MapPin,
  },
];

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

      {/* Contact items */}
      {contactItems.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.title}
            className="rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:shadow-md"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Icon className="h-4 w-4 text-primary" aria-hidden />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {item.title}
                </p>
                {item.href ? (
                  <Link
                    href={item.href}
                    className="mt-0.5 text-sm text-primary transition-colors hover:underline"
                  >
                    {item.value}
                  </Link>
                ) : (
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {item.value}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
