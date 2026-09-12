import { NextRequest, NextResponse } from "next/server";
import { checkCronAuth } from "@/lib/cron-auth";
import { recordatoriosDeReintentoDeExamen } from "@/lib/cron-jobs";

// Avisa a quien reprobó un examen y ya cumplió la espera.
// La lógica vive en lib/cron-jobs.ts, porque el cron diario también la invoca.
// Esta ruta se conserva para poder dispararlo a mano.
// Protegido con CRON_SECRET (Vercel envía `Authorization: Bearer <CRON_SECRET>`).
export async function GET(req: NextRequest) {
  const noAutorizado = checkCronAuth(req);
  if (noAutorizado) return noAutorizado;
  return NextResponse.json(await recordatoriosDeReintentoDeExamen());
}
