import { describe, it, expect } from "vitest";
import {
  calculateStripeStandard,
  calculateStripeConnect,
  calculateReversePrice,
  STRIPE_RATES,
  MEXICAN_TAXES,
  REGIMENES_FISCALES,
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

describe("impuestos mexicanos", () => {
  it("la retención de IVA son dos tercios del IVA trasladado", () => {
    // LIVA art. 1-A. La constante decía 6.67% con la etiqueta "2/3" y la
    // fórmula acababa reteniendo el 41.7% del IVA en vez del 66.7%.
    const r = calculateStripeConnect(1000, 15, true);
    expect(r.ivaRetencion).toBeCloseTo(r.iva * (2 / 3), 6);
  });

  it("sobre la base imponible, esa retención equivale al 10.67%", () => {
    expect(MEXICAN_TAXES.iva_retencion).toBeCloseTo(10.67, 2);
  });

  it("sin IVA no hay retención de IVA", () => {
    const r = calculateStripeConnect(1000, 15, false);
    expect(r.ivaRetencion).toBe(0);
  });
});

describe("calculateStripeConnect modela lo que hace producción", () => {
  it("la comisión de plataforma se calcula sobre el bruto, como calculateSplit", () => {
    const r = calculateStripeConnect(1000, 15);
    expect(r.comisionPlataforma).toBeCloseTo(150, 6);
    expect(r.subtotal).toBeCloseTo(850, 6);
  });

  it("la comisión de Stripe no reduce lo que cobra el instructor", () => {
    // El cobro entra en la cuenta de Cursumi y Stripe descuenta de ahí, así que
    // sin comisión de plataforma al instructor le corresponde el bruto íntegro.
    const r = calculateStripeConnect(1000, 0, false);
    expect(r.subtotal).toBeCloseTo(1000, 6);
  });

  it("sigue informando la comisión de Stripe como coste de la plataforma", () => {
    const r = calculateStripeConnect(1000, 15);
    expect(r.comisionStripe).toBeGreaterThan(0);
    const labels = r.breakdown.map((b) => b.label);
    expect(labels.some((l) => l.includes("absorbe Cursumi"))).toBe(true);
  });
});

describe("régimen fiscal", () => {
  it("por defecto usa el régimen general, para no cambiar lo que ya se mostraba", () => {
    const porDefecto = calculateStripeConnect(1000, 15, true);
    const explicito = calculateStripeConnect(1000, 15, true, "actividad_empresarial");
    expect(porDefecto.totalRecibido).toBe(explicito.totalRecibido);
  });

  it("RESICO retiene 1.25% de ISR en vez del 10%", () => {
    const general = calculateStripeConnect(1000, 15, true, "actividad_empresarial");
    const resico = calculateStripeConnect(1000, 15, true, "resico");

    expect(resico.isrRetencion).toBeCloseTo(general.isrRetencion / 8, 6); // 1.25 es 10/8
    expect(resico.totalRecibido).toBeGreaterThan(general.totalRecibido);
  });

  it("RESICO no cambia la retención de IVA", () => {
    const general = calculateStripeConnect(1000, 15, true, "actividad_empresarial");
    const resico = calculateStripeConnect(1000, 15, true, "resico");
    expect(resico.ivaRetencion).toBeCloseTo(general.ivaRetencion, 6);
  });

  it("a una persona moral no se le retiene nada", () => {
    const r = calculateStripeConnect(1000, 15, true, "persona_moral");
    expect(r.isrRetencion).toBe(0);
    expect(r.ivaRetencion).toBe(0);
    // Cobra íntegro su parte del bruto: 1000 menos el 15% de comisión.
    expect(r.totalRecibido).toBeCloseTo(850, 6);
  });

  it("el desglose de una persona moral no lista retenciones", () => {
    const labels = calculateStripeConnect(1000, 15, true, "persona_moral").breakdown.map(
      (b) => b.label,
    );
    expect(labels.some((l) => l.includes("Retención"))).toBe(false);
  });

  it("el régimen también aplica en pagos directos", () => {
    const general = calculateStripeStandard(1000, true, "actividad_empresarial");
    const resico = calculateStripeStandard(1000, true, "resico");
    expect(resico.totalRecibido).toBeGreaterThan(general.totalRecibido);
  });

  it("el catálogo cubre los tres regímenes con sus tasas", () => {
    expect(REGIMENES_FISCALES.actividad_empresarial.isr).toBe(10);
    expect(REGIMENES_FISCALES.resico.isr).toBe(1.25);
    expect(REGIMENES_FISCALES.persona_moral.isr).toBe(0);
    expect(REGIMENES_FISCALES.persona_moral.retieneIva).toBe(false);
  });
});
