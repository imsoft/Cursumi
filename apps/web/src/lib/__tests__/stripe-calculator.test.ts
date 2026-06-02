import { describe, it, expect } from "vitest";
import {
  calculateStripeStandard,
  calculateStripeConnect,
  calculateReversePrice,
  STRIPE_RATES,
} from "../stripe-calculator";

describe("calculateStripeStandard", () => {
  it("el totalRecibido es menor que el precio original", () => {
    const result = calculateStripeStandard(1000);
    expect(result.totalRecibido).toBeLessThan(result.precioOriginal);
  });

  it("comisionPlataforma es 0 en pagos directos", () => {
    const result = calculateStripeStandard(1000);
    expect(result.comisionPlataforma).toBe(0);
  });

  it("incluye IVA por defecto", () => {
    const result = calculateStripeStandard(1000);
    expect(result.iva).toBeGreaterThan(0);
  });

  it("sin IVA el resultado es diferente", () => {
    const conIVA = calculateStripeStandard(1000, true);
    const sinIVA = calculateStripeStandard(1000, false);
    expect(conIVA.totalRecibido).not.toBe(sinIVA.totalRecibido);
    expect(sinIVA.iva).toBe(0);
  });

  it("comisión Stripe usa porcentaje + fijo", () => {
    const amount = 1000;
    const result = calculateStripeStandard(amount);
    const expectedBase =
      (amount * STRIPE_RATES.standard.percentageFee) / 100 +
      STRIPE_RATES.standard.fixedFee;
    expect(result.comisionStripe).toBeCloseTo(expectedBase, 5);
  });

  it("breakdown siempre incluye precio original y total a recibir", () => {
    const result = calculateStripeStandard(500);
    const labels = result.breakdown.map((b) => b.label);
    expect(labels).toContain("Precio del curso");
    expect(labels).toContain("Total a recibir");
  });
});

describe("calculateStripeConnect", () => {
  it("la comisión de plataforma reduce el total recibido", () => {
    const sin = calculateStripeConnect(1000, 0);
    const con = calculateStripeConnect(1000, 20);
    expect(con.totalRecibido).toBeLessThan(sin.totalRecibido);
  });

  it("comisionPlataforma es mayor a 0 cuando se especifica porcentaje", () => {
    const result = calculateStripeConnect(1000, 15);
    expect(result.comisionPlataforma).toBeGreaterThan(0);
  });

  it("con 0% de plataforma equivale casi a standard", () => {
    const standard = calculateStripeStandard(1000);
    const connect = calculateStripeConnect(1000, 0);
    // Los subtotales post-Stripe deben ser iguales
    expect(connect.comisionStripe).toBeCloseTo(standard.comisionStripe, 1);
  });

  it("breakdown incluye comisión de plataforma", () => {
    const result = calculateStripeConnect(1000, 20);
    const labels = result.breakdown.map((b) => b.label);
    expect(labels.some((l) => l.includes("plataforma"))).toBe(true);
  });
});

describe("calculateReversePrice", () => {
  it("el precio sugerido genera un neto cercano al deseado", () => {
    const desiredNet = 500;
    const price = calculateReversePrice(desiredNet, 20, true, true);
    const check = calculateStripeConnect(price, 20, true);
    // Toleramos diferencia de hasta $20 MXN por redondeo a decenas
    expect(Math.abs(check.totalRecibido - desiredNet)).toBeLessThan(20);
  });

  it("siempre retorna un múltiplo de 10", () => {
    const price = calculateReversePrice(300, 15, true, true);
    expect(price % 10).toBe(0);
  });

  it("el precio sugerido es mayor que el neto deseado", () => {
    const desiredNet = 800;
    const price = calculateReversePrice(desiredNet, 20);
    expect(price).toBeGreaterThan(desiredNet);
  });
});
