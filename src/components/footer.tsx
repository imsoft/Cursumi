import Link from "next/link";
import Image from "next/image";

const footerNav = [
  { label: "Cursos", href: "/courses" },
  { label: "Cómo funciona", href: "/how-it-works" },
  { label: "Para instructores", href: "/instructors" },
  { label: "Contacto", href: "/contact" },
];

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-background/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <Link href="/" className="inline-block">
            <Image
              src="/logos/cursumi.svg"
              alt="Cursumi"
              width={120}
              height={40}
              className="h-8 w-auto"
            />
          </Link>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            Cursos presenciales y virtuales con instructores validados y soporte
            completo para conectar talento con oportunidades reales.
          </p>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            © {new Date().getFullYear()} Cursumi
          </p>
        </div>
        <div className="grid grid-cols-2 gap-6 text-sm text-muted-foreground sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Navegación
            </p>
            <ul className="mt-3 space-y-2">
              {footerNav.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="transition hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Apoyo
            </p>
            <ul className="mt-3 space-y-2">
              <li>soporte@cursumi.com</li>
              <li>+52 55 1234 5678</li>
              <li>Horario: lun-vie 9:00-19:00</li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Redes
            </p>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="#" className="transition hover:text-foreground">
                  LinkedIn
                </Link>
              </li>
              <li>
                <Link href="#" className="transition hover:text-foreground">
                  Instagram
                </Link>
              </li>
              <li>
                <Link href="#" className="transition hover:text-foreground">
                  YouTube
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

