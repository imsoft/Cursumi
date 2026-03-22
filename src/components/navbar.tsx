 "use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

const navLinks = [
  { label: "Cursos", href: "/courses" },
  { label: "Cómo funciona", href: "/how-it-works" },
  { label: "Para instructores", href: "/instructors" },
  { label: "Contacto", href: "/contact" },
];

export const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:py-4">
        <Link
          href="/"
          className="flex items-center"
        >
          <Image
            src="/logos/cursumi.svg"
            alt="Cursumi"
            width={120}
            height={40}
            className="h-8 w-auto"
            priority
          />
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-foreground transition hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <Link href="/login">
            <Button variant="ghost" className="px-4 py-2 text-xs" size="sm">
              Iniciar sesión
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Crear cuenta</Button>
          </Link>
        </div>
        <button
          type="button"
          aria-label="Abrir menú"
          className="inline-flex items-center justify-center rounded-full border border-border p-2 text-foreground transition hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:hidden"
          onClick={() => setOpen((state) => !state)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {open && (
        <div className="md:hidden">
          <div className="space-y-2 border-t border-border px-4 pb-4 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="block rounded-xl px-3 py-2 text-sm font-medium text-foreground transition hover:bg-primary/10 hover:text-primary"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center justify-between border-t border-border pt-3">
              <span className="text-sm text-muted-foreground">Tema</span>
              <ThemeToggle />
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <Link href="/login">
                <Button variant="outline" className="w-full" size="sm">
                  Iniciar sesión
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="w-full" size="sm">
                  Crear cuenta
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

