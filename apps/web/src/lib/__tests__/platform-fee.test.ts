import { describe, it, expect, vi } from "vitest";

// platform-fee.ts imports prisma — mock it so tests run without DATABASE_URL
vi.mock("../prisma", () => ({ prisma: {} }));

import {
  clampPlatformFeePercent,
  DEFAULT_PLATFORM_FEE_PERCENT,
} from "../platform-fee";

describe("clampPlatformFeePercent", () => {
  it("retorna el valor por defecto para NaN", () => {
    expect(clampPlatformFeePercent(NaN)).toBe(DEFAULT_PLATFORM_FEE_PERCENT);
  });

  it("clampea a 0 para negativos", () => {
    expect(clampPlatformFeePercent(-5)).toBe(0);
  });

  it("clampea a 100 para valores mayores", () => {
    expect(clampPlatformFeePercent(150)).toBe(100);
  });

  it("redondea al entero más cercano", () => {
    expect(clampPlatformFeePercent(14.7)).toBe(15);
    expect(clampPlatformFeePercent(14.3)).toBe(14);
  });

  it("acepta 0 como válido", () => {
    expect(clampPlatformFeePercent(0)).toBe(0);
  });

  it("acepta 100 como válido", () => {
    expect(clampPlatformFeePercent(100)).toBe(100);
  });

  it("acepta valores normales en rango", () => {
    expect(clampPlatformFeePercent(20)).toBe(20);
    expect(clampPlatformFeePercent(15)).toBe(DEFAULT_PLATFORM_FEE_PERCENT);
  });
});
