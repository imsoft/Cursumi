import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, Users, MapPin, Phone } from "lucide-react";

const contactItems = [
  {
    title: "Correo general",
    description: "contacto@cursumi.com",
    href: "mailto:contacto@cursumi.com",
    icon: Mail,
  },
  {
    title: "Soporte",
    description: "soporte@cursumi.com",
    href: "mailto:soporte@cursumi.com",
    icon: Phone,
  },
  {
    title: "Para instructores",
    description: "instructores@cursumi.com",
    href: "mailto:instructores@cursumi.com",
    icon: Users,
  },
  {
    title: "Ubicación",
    description: "CDMX · Guadalajara · Monterrey",
    href: "https://maps.google.com",
    icon: MapPin,
  },
];

export const ContactInfo = () => {
  return (
    <section className="mx-auto max-w-5xl px-4 py-10 text-left">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Contáctanos
        </p>
        <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
          Estamos listos para escucharte
        </h2>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {contactItems.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="text-left">
              <CardHeader className="flex items-start gap-3">
                <Icon className="h-6 w-6 text-primary" />
                <CardTitle className="text-lg">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-left">
                <p className="text-sm text-muted-foreground">{item.description}</p>
                <Link
                  href={item.href}
                  className="mt-3 inline-flex text-sm font-semibold text-primary underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  {item.href.replace("mailto:", "").replace("https://", "")}
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
};

