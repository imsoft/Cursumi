"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { SocialIcon } from "@/components/social-icon";
import { SOCIAL_LINK_DEFAULTS, type SocialLink } from "@/lib/social-links-config";

const footerNav = [
  { label: "Cursos", href: "/courses" },
  { label: "Cómo funciona", href: "/how-it-works" },
  { label: "Para instructores", href: "/instructors" },
  { label: "Contacto", href: "/contact" },
];

const legalNav = [
  { label: "Privacidad", href: "/privacidad" },
  { label: "Términos de uso", href: "/terminos" },
];

export const Footer = () => {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  useEffect(() => {
    fetch("/api/social-links")
      .then((r) => r.json())
      .then((data: SocialLink[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setSocialLinks(data);
        } else {
          setSocialLinks(SOCIAL_LINK_DEFAULTS.filter((l) => l.visible));
        }
      })
      .catch(() => {
        setSocialLinks(SOCIAL_LINK_DEFAULTS.filter((l) => l.visible));
      });
  }, []);

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
          {/* Social icons row */}
          {socialLinks.length > 0 && (
            <div className="flex items-center gap-3 pt-1">
              {socialLinks.map((link) => (
                <a
                  key={link.key}
                  href={link.url}
                  target={link.key === "email" ? undefined : "_blank"}
                  rel={link.key === "email" ? undefined : "noopener noreferrer"}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={link.label}
                >
                  <SocialIcon platform={link.key} className="h-5 w-5" />
                </a>
              ))}
            </div>
          )}
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            &copy; {new Date().getFullYear()} Cursumi
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
              Legal
            </p>
            <ul className="mt-3 space-y-2">
              {legalNav.map((link) => (
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
              Redes
            </p>
            <ul className="mt-3 space-y-2">
              {socialLinks.map((link) => (
                <li key={link.key}>
                  <a
                    href={link.url}
                    target={link.key === "email" ? undefined : "_blank"}
                    rel={link.key === "email" ? undefined : "noopener noreferrer"}
                    className="flex items-center gap-2 transition hover:text-foreground"
                  >
                    <SocialIcon platform={link.key} className="h-3.5 w-3.5" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};
