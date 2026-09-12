/**
 * Utilidades para calcular comisiones de Stripe, Stripe Connect e impuestos mexicanos
 */

// Tarifas de Stripe México
export const STRIPE_RATES = {
  // Stripe estándar (pagos directos)
  standard: {
    percentageFee: 3.6, // 3.6% + IVA
    fixedFee: 3.00, // $3 MXN + IVA por transacción
    ivaOnFees: 16, // 16% IVA sobre las comisiones
  },
  // Stripe Connect (marketplace)
  connect: {
    percentageFee: 3.6, // 3.6% + IVA de Stripe
    fixedFee: 3.00, // $3 MXN + IVA por transacción
    platformFee: 0, // Comisión de la plataforma (configurable)
    ivaOnFees: 16, // 16% IVA sobre las comisiones
  },
};

// Impuestos mexicanos
export const MEXICAN_TAXES = {
  iva: 16, // IVA 16%
  isr: 10, // ISR retención 10% (para servicios digitales)
  /**
   * Retención de IVA: la persona moral retiene DOS TERCIOS del IVA trasladado
   * (LIVA art. 1-A). La constante anterior decía 6.67 con la etiqueta "2/3",
   * pero dos tercios de 16% son 10.67%, no 6.67%, y la fórmula terminaba
   * reteniendo el 41.7% del IVA en lugar del 66.7%.
   */
  ivaRetencionFraccion: 2 / 3,
  /** El mismo dato visto sobre la base imponible: 2/3 × 16% = 10.67%. */
  iva_retencion: (2 / 3) * 16,
};

/**
 * Régimen fiscal de quien cobra. Determina las retenciones que le aplica una
 * persona moral al pagarle.
 *
 * Los porcentajes son los del caso general; un contador puede tener matices
 * según la actividad concreta. Por eso el simulador deja elegirlo en vez de
 * asumir uno, que es lo que hacía antes.
 */
export type RegimenFiscal = "actividad_empresarial" | "resico" | "persona_moral";

export const REGIMENES_FISCALES: Record<
  RegimenFiscal,
  { label: string; corto: string; isr: number; retieneIva: boolean; nota: string }
> = {
  actividad_empresarial: {
    label: "Persona física · Actividad empresarial y profesional",
    corto: "Régimen general",
    isr: 10,
    retieneIva: true,
    nota: "Retención de ISR del 10% y de dos tercios del IVA trasladado.",
  },
  resico: {
    label: "Persona física · RESICO",
    corto: "RESICO",
    isr: 1.25,
    retieneIva: true,
    nota: "El Régimen Simplificado de Confianza retiene 1.25% de ISR en vez del 10%. La retención de IVA no cambia.",
  },
  persona_moral: {
    label: "Persona moral",
    corto: "Persona moral",
    isr: 0,
    retieneIva: false,
    nota: "Entre personas morales no hay retención de ISR ni de IVA por servicios.",
  },
};

export interface StripeCalculationResult {
  precioOriginal: number;
  comisionStripe: number;
  ivaComisionStripe: number;
  comisionPlataforma: number;
  subtotal: number;
  iva: number;
  isrRetencion: number;
  ivaRetencion: number;
  totalRecibido: number;
  totalCobradoCliente: number;
  breakdown: {
    label: string;
    amount: number;
    isNegative?: boolean;
    description?: string;
  }[];
}

/**
 * Calcula las comisiones y netos para pagos directos con Stripe
 */
export function calculateStripeStandard(
  amount: number,
  includeIVA: boolean = true,
  regimen: RegimenFiscal = "actividad_empresarial",
): StripeCalculationResult {
  const precioOriginal = amount;

  // Calcular comisión de Stripe
  const comisionStripeBase = (amount * STRIPE_RATES.standard.percentageFee) / 100 + STRIPE_RATES.standard.fixedFee;
  const ivaComisionStripe = (comisionStripeBase * STRIPE_RATES.standard.ivaOnFees) / 100;
  const comisionStripe = comisionStripeBase + ivaComisionStripe;

  // Restar comisión de Stripe
  const subtotal = amount - comisionStripe;

  // Calcular IVA e impuestos
  const iva = includeIVA ? (subtotal * MEXICAN_TAXES.iva) / (100 + MEXICAN_TAXES.iva) : 0;
  const baseImponible = includeIVA ? subtotal - iva : subtotal;

  // Retenciones
  const reglas = REGIMENES_FISCALES[regimen];
  const isrRetencion = (baseImponible * reglas.isr) / 100;
  const ivaRetencion =
    includeIVA && reglas.retieneIva ? iva * MEXICAN_TAXES.ivaRetencionFraccion : 0;

  const totalRecibido = subtotal - isrRetencion - ivaRetencion;

  const breakdown = [
    { label: 'Precio del curso', amount: precioOriginal },
    { label: 'Comisión Stripe (3.6%)', amount: comisionStripeBase, isNegative: true },
    { label: 'IVA sobre comisión Stripe', amount: ivaComisionStripe, isNegative: true },
    { label: 'Subtotal después de Stripe', amount: subtotal },
  ];

  if (includeIVA) {
    breakdown.push({ label: 'IVA incluido (16%)', amount: iva });
    breakdown.push({ label: 'Base imponible', amount: baseImponible });
  }

  // Sin retención no hay línea: a una persona moral le salía un
  // "Retención ISR (0%)" que solo era ruido.
  if (reglas.isr > 0) {
    breakdown.push({
      label: `Retención ISR (${reglas.isr}%)`,
      amount: isrRetencion,
      isNegative: true,
    });
  }

  if (includeIVA && reglas.retieneIva) {
    breakdown.push({
      label: `Retención IVA (${MEXICAN_TAXES.iva_retencion.toFixed(2)}%)`,
      amount: ivaRetencion,
      isNegative: true,
    });
  }

  breakdown.push({ label: 'Total a recibir', amount: totalRecibido });

  return {
    precioOriginal,
    comisionStripe: comisionStripeBase,
    ivaComisionStripe,
    comisionPlataforma: 0,
    subtotal,
    iva,
    isrRetencion,
    ivaRetencion,
    totalRecibido,
    totalCobradoCliente: precioOriginal,
    breakdown,
  };
}

/**
 * Calcula las comisiones y netos para Stripe Connect (marketplace)
 */
export function calculateStripeConnect(
  amount: number,
  platformFeePercentage: number = 20,
  includeIVA: boolean = true,
  regimen: RegimenFiscal = "actividad_empresarial",
): StripeCalculationResult {
  const precioOriginal = amount;

  // Comisión de Stripe. La paga la plataforma, no el instructor: el cobro
  // entra en la cuenta de Cursumi, Stripe descuenta de ahí, y a la persona
  // instructora se le liquida su parte del BRUTO. Se sigue calculando para
  // mostrarla como coste de la plataforma.
  const comisionStripeBase = (amount * STRIPE_RATES.connect.percentageFee) / 100 + STRIPE_RATES.connect.fixedFee;
  const ivaComisionStripe = (comisionStripeBase * STRIPE_RATES.connect.ivaOnFees) / 100;

  // Comisión de la plataforma sobre el BRUTO, igual que calculateSplit() en
  // producción. Antes se aplicaba sobre el subtotal ya descontado de Stripe,
  // así que el simulador prometía menos de lo que el instructor cobra.
  const comisionPlataforma = (amount * platformFeePercentage) / 100;
  const subtotal = amount - comisionPlataforma;

  // Calcular IVA e impuestos
  const iva = includeIVA ? (subtotal * MEXICAN_TAXES.iva) / (100 + MEXICAN_TAXES.iva) : 0;
  const baseImponible = includeIVA ? subtotal - iva : subtotal;

  // Retenciones
  const reglas = REGIMENES_FISCALES[regimen];
  const isrRetencion = (baseImponible * reglas.isr) / 100;
  const ivaRetencion =
    includeIVA && reglas.retieneIva ? iva * MEXICAN_TAXES.ivaRetencionFraccion : 0;

  const totalRecibido = subtotal - isrRetencion - ivaRetencion;

  const breakdown = [
    { label: 'Precio del curso', amount: precioOriginal },
    { label: `Comisión plataforma (${platformFeePercentage}%)`, amount: comisionPlataforma, isNegative: true },
    { label: 'Subtotal para instructor', amount: subtotal },
    { label: 'Comisión Stripe (3.6%) — la absorbe Cursumi', amount: comisionStripeBase },
    { label: 'IVA sobre comisión Stripe — lo absorbe Cursumi', amount: ivaComisionStripe },
  ];

  if (includeIVA) {
    breakdown.push({ label: 'IVA incluido (16%)', amount: iva });
    breakdown.push({ label: 'Base imponible', amount: baseImponible });
  }

  // Sin retención no hay línea: a una persona moral le salía un
  // "Retención ISR (0%)" que solo era ruido.
  if (reglas.isr > 0) {
    breakdown.push({
      label: `Retención ISR (${reglas.isr}%)`,
      amount: isrRetencion,
      isNegative: true,
    });
  }

  if (includeIVA && reglas.retieneIva) {
    breakdown.push({
      label: `Retención IVA (${MEXICAN_TAXES.iva_retencion.toFixed(2)}%)`,
      amount: ivaRetencion,
      isNegative: true,
    });
  }

  breakdown.push({ label: 'Total a recibir', amount: totalRecibido });

  return {
    precioOriginal,
    comisionStripe: comisionStripeBase,
    ivaComisionStripe,
    comisionPlataforma,
    subtotal,
    iva,
    isrRetencion,
    ivaRetencion,
    totalRecibido,
    totalCobradoCliente: precioOriginal,
    breakdown,
  };
}

/**
 * Calcula el precio sugerido para obtener un ingreso neto deseado
 */
export function calculateReversePrice(
  desiredNet: number,
  platformFeePercentage: number = 20,
  includeIVA: boolean = true,
  useConnect: boolean = true,
  regimen: RegimenFiscal = "actividad_empresarial",
): number {
  // Iteración para encontrar el precio que resulte en el ingreso neto deseado
  let estimatedPrice = desiredNet;
  let iterations = 0;
  const maxIterations = 20;

  while (iterations < maxIterations) {
    const result = useConnect
      ? calculateStripeConnect(estimatedPrice, platformFeePercentage, includeIVA, regimen)
      : calculateStripeStandard(estimatedPrice, includeIVA, regimen);

    const difference = desiredNet - result.totalRecibido;

    if (Math.abs(difference) < 1) {
      break;
    }

    estimatedPrice += difference;
    iterations++;
  }

  return Math.ceil(estimatedPrice / 10) * 10; // Redondear a decenas
}
