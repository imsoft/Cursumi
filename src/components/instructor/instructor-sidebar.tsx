"use client";

import Link from "next/link";
import { X, LayoutDashboard, BookOpenCheck, PlusCircle, UserCircle, LogOut } from "lucide-react";

const links = [
  { label: "Dashboard", href: "/instructor" },
  { label: "Mis cursos", href: "/instructor/courses" },
  { label: "Crear curso", href: "/instructor/courses/new" },
  { label: "Perfil", href: "/instructor/profile" },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export const InstructorSidebar = ({ open, onClose }: SidebarProps) => {
  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity md:hidden ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-background/95 p-6 shadow-lg transition-transform md:relative md:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between pb-6">
          <span className="text-lg font-semibold tracking-[0.3em] text-primary">Cursumi</span>
          <button
            className="rounded-full border border-border p-1 text-muted-foreground transition hover:border-primary hover:text-primary md:hidden"
            onClick={onClose}
            aria-label="Cerrar menú"
          >
            <X size={18} />
          </button>
        </div>
        <nav className="space-y-3">
          {links.map((link) => {
            const Icon =
              link.label === "Dashboard"
                ? LayoutDashboard
                : link.label === "Mis cursos"
                ? BookOpenCheck
                : link.label === "Crear curso"
                ? PlusCircle
                : UserCircle;
            return (
              <Link
                key={link.label}
                href={link.href}
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-foreground transition hover:bg-primary/5 hover:text-primary"
                onClick={onClose}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto border-t border-border pt-4">
          <button
            className="flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-primary"
            type="button"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
};

