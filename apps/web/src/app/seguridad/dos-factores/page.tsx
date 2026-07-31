import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ShieldAlert } from "lucide-react";
import { getSessionSafe } from "@/lib/session";
import { getUserBasicInfo } from "@/lib/user-service";
import { TwoFactorSettings } from "@/components/settings/two-factor-settings";
import { Card, CardContent } from "@/components/ui/card";
import { debeConfigurar2FA, rolExige2FA } from "@/lib/two-factor-guard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Verificación en dos pasos",
  robots: { index: false, follow: false },
};

/**
 * Configuración obligatoria del segundo factor para admin e instructor.
 *
 * Vive fuera de `(student)`, `(instructor)` y `(admin)` a propósito: esos
 * layouts redirigen según el rol, así que una página de configuración dentro de
 * cualquiera de ellos entraría en un bucle de redirecciones con el propio
 * guardia que la manda aquí.
 */
export default async function ConfigurarDosFactoresPage() {
  const session = await getSessionSafe();
  if (!session?.user?.id) redirect("/login");

  const { role } = await getUserBasicInfo(session.user.id);

  // A quien no le toca, o ya lo tiene, se le devuelve a su lugar.
  if (!rolExige2FA(role)) redirect("/dashboard");
  if (!(await debeConfigurar2FA(session.user.id, role))) {
    redirect(role === "admin" ? "/admin" : "/instructor");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-6 px-4 py-12">
      <Card className="border-amber-500/40 bg-amber-50/60 dark:bg-amber-950/20">
        <CardContent className="flex items-start gap-3 p-5">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div className="space-y-1">
            <p className="font-medium text-foreground">
              Activa la verificación en dos pasos para continuar
            </p>
            <p className="text-sm text-muted-foreground">
              Tu cuenta de {role === "admin" ? "administración" : "instructor"} puede
              cambiar contenido y ver datos de otras personas, así que pedimos un
              segundo factor además de la contraseña. Es cosa de un minuto: escanea
              el código con tu app de autenticación y guarda los códigos de respaldo.
            </p>
          </div>
        </CardContent>
      </Card>

      <TwoFactorSettings />

      <p className="text-center text-xs text-muted-foreground">
        Al terminar, vuelve a cargar la página para entrar a tu panel.
      </p>
    </div>
  );
}
