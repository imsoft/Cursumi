import { prisma } from "@/lib/prisma";

export const SITE_SETTING_KEY_PLATFORM_FEE = "platform_fee_percent";
/** Valor por defecto si aún no hay registro en SiteSetting */
export const DEFAULT_PLATFORM_FEE_PERCENT = 15;

export function clampPlatformFeePercent(n: number): number {
  if (Number.isNaN(n)) return DEFAULT_PLATFORM_FEE_PERCENT;
  return Math.min(100, Math.max(0, Math.round(n)));
}

export async function getPlatformFeePercent(): Promise<number> {
  const row = await prisma.siteSetting.findUnique({
    where: { key: SITE_SETTING_KEY_PLATFORM_FEE },
  });
  if (row?.value == null) return DEFAULT_PLATFORM_FEE_PERCENT;
  const raw = row.value as unknown;
  if (typeof raw === "number") return clampPlatformFeePercent(raw);
  if (raw && typeof raw === "object" && "percent" in raw) {
    return clampPlatformFeePercent(Number((raw as { percent: unknown }).percent));
  }
  return DEFAULT_PLATFORM_FEE_PERCENT;
}

export async function setPlatformFeePercent(percent: number): Promise<number> {
  const p = clampPlatformFeePercent(percent);
  await prisma.siteSetting.upsert({
    where: { key: SITE_SETTING_KEY_PLATFORM_FEE },
    create: { key: SITE_SETTING_KEY_PLATFORM_FEE, value: p },
    update: { value: p },
  });
  return p;
}
