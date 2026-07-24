import { ReactNode } from "react";
import { BookOpen, Award, Users } from "lucide-react";

const highlights = [
  { icon: BookOpen, text: "Cursos en video y eventos en vivo" },
  { icon: Award, text: "Certificados digitales al completar" },
  { icon: Users, text: "Instructores validados y comunidad activa" },
];

export function AuthPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="flex min-h-[calc(100svh-4rem)]">
        {/* Panel izquierdo — solo desktop */}
        <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] flex-col justify-between bg-linear-to-br from-primary/90 to-primary p-12 text-primary-foreground">
          <div className="space-y-8">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-widest opacity-75">
                Cursumi
              </p>
              <h2 className="text-3xl font-bold leading-tight">
                El conocimiento que<br />
                <span className="opacity-90">cambia carreras.</span>
              </h2>
              <p className="text-base opacity-80 leading-relaxed max-w-sm">
                Aprende con instructores expertos, obtén certificados y avanza en tu carrera profesional.
              </p>
            </div>
            <ul className="space-y-4">
              {highlights.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-foreground/15">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm opacity-90">{text}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-xs opacity-50">© {new Date().getFullYear()} Cursumi</p>
        </div>

        {/* Panel derecho — formulario */}
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
