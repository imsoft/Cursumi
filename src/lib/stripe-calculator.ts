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
  iva_retencion: 6.67, // Retención de IVA 2/3 (6.67%)
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
  includeIVA: boolean = true
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
  const isrRetencion = (baseImponible * MEXICAN_TAXES.isr) / 100;
  const ivaRetencion = includeIVA ? (iva * MEXICAN_TAXES.iva_retencion * 100) / MEXICAN_TAXES.iva / 100 : 0;

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

  breakdown.push(
    { label: 'Retención ISR (10%)', amount: isrRetencion, isNegative: true },
  );

  if (includeIVA) {
    breakdown.push({ label: 'Retención IVA (6.67%)', amount: ivaRetencion, isNegative: true });
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
  includeIVA: boolean = true
): StripeCalculationResult {
  const precioOriginal = amount;

  // Calcular comisión de Stripe
  const comisionStripeBase = (amount * STRIPE_RATES.connect.percentageFee) / 100 + STRIPE_RATES.connect.fixedFee;
  const ivaComisionStripe = (comisionStripeBase * STRIPE_RATES.connect.ivaOnFees) / 100;
  const comisionStripe = comisionStripeBase + ivaComisionStripe;

  // Restar comisión de Stripe
  let subtotal = amount - comisionStripe;

  // Calcular comisión de la plataforma (Cursumi)
  const comisionPlataforma = (subtotal * platformFeePercentage) / 100;
  subtotal = subtotal - comisionPlataforma;

  // Calcular IVA e impuestos
  const iva = includeIVA ? (subtotal * MEXICAN_TAXES.iva) / (100 + MEXICAN_TAXES.iva) : 0;
  const baseImponible = includeIVA ? subtotal - iva : subtotal;

  // Retenciones
  const isrRetencion = (baseImponible * MEXICAN_TAXES.isr) / 100;
  const ivaRetencion = includeIVA ? (iva * MEXICAN_TAXES.iva_retencion * 100) / MEXICAN_TAXES.iva / 100 : 0;

  const totalRecibido = subtotal - isrRetencion - ivaRetencion;

  const breakdown = [
    { label: 'Precio del curso', amount: precioOriginal },
    { label: 'Comisión Stripe (3.6%)', amount: comisionStripeBase, isNegative: true },
    { label: 'IVA sobre comisión Stripe', amount: ivaComisionStripe, isNegative: true },
    { label: `Comisión plataforma (${platformFeePercentage}%)`, amount: comisionPlataforma, isNegative: true },
    { label: 'Subtotal para instructor', amount: subtotal },
  ];

  if (includeIVA) {
    breakdown.push({ label: 'IVA incluido (16%)', amount: iva });
    breakdown.push({ label: 'Base imponible', amount: baseImponible });
  }

  breakdown.push(
    { label: 'Retención ISR (10%)', amount: isrRetencion, isNegative: true },
  );

  if (includeIVA) {
    breakdown.push({ label: 'Retención IVA (6.67%)', amount: ivaRetencion, isNegative: true });
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
  useConnect: boolean = true
): number {
  // Iteración para encontrar el precio que resulte en el ingreso neto deseado
  let estimatedPrice = desiredNet;
  let iterations = 0;
  const maxIterations = 20;

  while (iterations < maxIterations) {
    const result = useConnect
      ? calculateStripeConnect(estimatedPrice, platformFeePercentage, includeIVA)
      : calculateStripeStandard(estimatedPrice, includeIVA);

    const difference = desiredNet - result.totalRecibido;

    if (Math.abs(difference) < 1) {
      break;
    }

    estimatedPrice += difference;
    iterations++;
  }

  return Math.ceil(estimatedPrice / 10) * 10; // Redondear a decenas
}
