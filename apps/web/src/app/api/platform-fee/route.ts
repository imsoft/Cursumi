import { NextResponse } from "next/server";
import { getPlatformFeePercent } from "@/lib/platform-fee";

/** Porcentaje actual de comisión (público, solo lectura — para vistas de precios del instructor). */
export async function GET() {
  const platformFeePercent = await getPlatformFeePercent();
  return NextResponse.json({ platformFeePercent });
}
