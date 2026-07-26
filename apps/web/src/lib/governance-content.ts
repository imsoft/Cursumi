import type { GovernanceContent } from "@/lib/governance";

export const GOVERNANCE_DOC_TITLE = "Cursumi · Alineación de socios";

/**
 * Contenido inicial del documento de acuerdos. Las `note` reflejan cómo estaba
 * montada la plataforma al redactarlo (julio 2026) para que las decisiones
 * partan de datos reales, no de suposiciones.
 *
 * Solo es la SEMILLA: una vez creado el documento, la fuente de verdad es lo
 * que esté guardado en la base de datos.
 */
export const GOVERNANCE_SEED_CONTENT: GovernanceContent = {
  intro:
    "Este documento recoge los acuerdos entre los socios de Cursumi sobre el modelo de negocio, el dinero, los referidos y los mínimos y máximos del proyecto. Una vez publicado y aceptado por el CEO y el CFO, rige las decisiones de la empresa: lo aquí escrito es la referencia ante cualquier duda o discrepancia futura.",
  sections: [
    {
      id: "sociedad",
      tag: "Sociedad",
      title: "Sociedad (lo primero entre socios)",
      questions: [
        { id: "soc-1", q: "¿Cómo se reparte el equity (porcentajes) y con qué justificación?", answer: "" },
        { id: "soc-2", q: "¿Qué aporta cada uno —capital, tiempo, código, ventas, operación— y se valúa distinto?", answer: "" },
        { id: "soc-3", q: "¿El equity es fijo desde el día 1 o se gana con el tiempo (vesting)?", answer: "" },
        { id: "soc-4", q: "¿Quién decide si hay empate? ¿Hay temas con derecho a veto?", answer: "" },
        { id: "soc-5", q: "¿Cómo se reparten las utilidades y cuánto se reinvierte?", answer: "" },
        { id: "soc-6", q: "¿Alguno cobra sueldo o retiro mensual? ¿Desde cuándo y cuánto?", answer: "" },
        { id: "soc-7", q: "¿Qué pasa si uno se quiere salir o deja de trabajar? (cláusula de salida / recompra)", answer: "" },
        { id: "soc-8", q: "¿Se constituye empresa formal? ¿A nombre de quién están hoy Stripe, dominios, Vercel y el repositorio?", answer: "" },
      ],
    },
    {
      id: "modelo",
      tag: "Modelo",
      title: "Modelo de negocio",
      questions: [
        { id: "mod-1", q: "¿Cuál es el modelo principal: marketplace por comisión, venta de cursos propios, suscripción o B2B?", answer: "" },
        { id: "mod-2", q: "¿Cuál será la fuente #1 de ingresos a 12 meses?", answer: "" },
        { id: "mod-3", q: "¿Somos marketplace abierto (cualquiera publica) o catálogo curado?", answer: "" },
        { id: "mod-4", q: "¿Qué nos diferencia de Udemy / Hotmart / Coursera en LatAm?", answer: "" },
      ],
    },
    {
      id: "comisiones",
      tag: "Comisiones",
      title: "Comisiones e ingresos",
      questions: [
        { id: "com-1", q: "¿La comisión de plataforma se queda en 15%, sube, o varía por instructor o volumen?", note: "Hoy: 15% configurable", answer: "" },
        { id: "com-2", q: "¿La comisión es igual para cursos on-demand y para eventos/virtuales en vivo?", answer: "" },
        { id: "com-3", q: "¿Cobramos algo por listar un curso o solo comisión por venta?", answer: "" },
        { id: "com-4", q: "¿Habrá planes de instructor (gratis vs. pro con menor comisión)?", answer: "" },
      ],
    },
    {
      id: "precios",
      tag: "Precios",
      title: "Precios: mínimos y máximos",
      questions: [
        { id: "pre-1", q: "¿Precio mínimo y máximo por curso?", note: "Hoy: sin tope definido", answer: "" },
        { id: "pre-2", q: "¿Se permiten cursos gratis? ¿Con qué límites para evitar abuso?", answer: "" },
        { id: "pre-3", q: "¿El instructor pone el precio libremente o dentro de rangos?", answer: "" },
        { id: "pre-4", q: "¿Mostramos el precio con IVA incluido? ¿Emitimos factura al alumno?", answer: "" },
        { id: "pre-5", q: "¿Solo MXN o multi-moneda para el resto de LatAm?", note: "Hoy: solo MXN", answer: "" },
      ],
    },
    {
      id: "payout",
      tag: "Payout",
      title: "Pago a instructores",
      questions: [
        { id: "pay-1", q: "¿Cómo y cuándo se le paga al instructor su parte?", note: "Hoy: no construido", answer: "" },
        { id: "pay-2", q: "¿Umbral mínimo para poder retirar? (p. ej. $500 MXN)", answer: "" },
        { id: "pay-3", q: "¿Cada cuánto se paga: semanal, quincenal o mensual?", answer: "" },
        { id: "pay-4", q: "¿Retenemos un periodo de garantía por posibles reembolsos? (p. ej. 14 días)", answer: "" },
        { id: "pay-5", q: "¿Quién absorbe la comisión de Stripe: instructor, plataforma o alumno?", note: "Stripe 3.6% + IVA", answer: "" },
        { id: "pay-6", q: "¿Cómo manejamos las retenciones fiscales de instructores persona física?", note: "ISR 10% · IVA 6.67%", answer: "" },
      ],
    },
    {
      id: "referidos",
      tag: "Referidos",
      title: "Referidos",
      questions: [
        { id: "ref-1", q: "¿La comisión de referido se queda en 10% del neto?", note: "Hoy: 10% del neto", answer: "" },
        { id: "ref-2", q: "¿Es una sola vez o en cada compra futura del referido?", answer: "" },
        { id: "ref-3", q: "¿Hay tope máximo de ganancia por referido o por usuario?", answer: "" },
        { id: "ref-4", q: "¿Cómo se le paga al que refiere y con qué mínimo de retiro?", answer: "" },
        { id: "ref-5", q: "¿El referido también recibe un beneficio (descuento) o solo quien refiere?", answer: "" },
        { id: "ref-6", q: "¿Cómo evitamos fraude (autorreferidos, cuentas falsas)?", answer: "" },
        { id: "ref-7", q: "¿Los referidos aplican a compras de empresas o solo a alumnos individuales?", answer: "" },
      ],
    },
    {
      id: "cupones",
      tag: "Cupones",
      title: "Cupones y descuentos",
      questions: [
        { id: "cup-1", q: "¿Quién puede crear cupones: solo admin o también instructores sobre sus cursos?", answer: "" },
        { id: "cup-2", q: "¿Descuento máximo permitido? ¿Hay un piso de margen?", note: "Hoy: 1–100%", answer: "" },
        { id: "cup-3", q: "¿El costo del descuento lo absorbe la plataforma o el instructor?", answer: "" },
        { id: "cup-4", q: "¿Se pueden acumular cupón + referido? ¿Con qué reglas?", answer: "" },
      ],
    },
    {
      id: "b2b",
      tag: "B2B",
      title: "Empresas (B2B)",
      questions: [
        { id: "b2b-1", q: "¿Dejamos la cotización a medida o creamos planes fijos por asiento?", note: "Hoy: cotización a medida", answer: "" },
        { id: "b2b-2", q: "¿Mínimo y máximo de asientos por contrato?", answer: "" },
        { id: "b2b-3", q: "¿Precio por asiento o por paquete? ¿Suscripción anual o pago único?", answer: "" },
        { id: "b2b-4", q: "¿Las empresas acceden a todo el catálogo o solo a cursos seleccionados?", answer: "" },
        { id: "b2b-5", q: "¿Ofrecemos contenido a medida? ¿Eso cambia el reparto con instructores?", answer: "" },
      ],
    },
    {
      id: "fiscal",
      tag: "Fiscal",
      title: "Impuestos, legal y facturación",
      questions: [
        { id: "fis-1", q: "¿Estamos dados de alta correctamente para facturar en México?", answer: "" },
        { id: "fis-2", q: "¿Emitimos CFDI a alumnos y a empresas?", answer: "" },
        { id: "fis-3", q: "¿Cómo entregamos las constancias de retención a instructores?", answer: "" },
        { id: "fis-4", q: "¿Términos, privacidad y política de reembolsos están alineados con lo que cobramos?", answer: "" },
        { id: "fis-5", q: "¿Cómo tratamos a alumnos e instructores de otros países (impuestos y moneda)?", answer: "" },
      ],
    },
    {
      id: "numeros",
      tag: "Números",
      title: "Costos y unit economics",
      questions: [
        { id: "num-1", q: "¿Cuáles son los costos fijos mensuales? (Vercel, Neon, Stripe, Resend, Cloudinary, Mux, dominios)", answer: "" },
        { id: "num-2", q: "¿Cuánto cuesta servir un curso con video por alumno (Mux / Cloudinary)?", answer: "" },
        { id: "num-3", q: "¿Cuál es el margen real por venta tras Stripe, impuestos y comisión?", answer: "" },
        { id: "num-4", q: "¿A cuántas ventas al mes llegamos al punto de equilibrio?", answer: "" },
        { id: "num-5", q: "¿Cuánto cuesta adquirir un cliente vs. cuánto deja?", answer: "" },
      ],
    },
    {
      id: "riesgos",
      tag: "Riesgos",
      title: "Reembolsos y riesgos",
      questions: [
        { id: "rie-1", q: "¿Política de reembolso: ventana de días, condiciones y quién lo paga?", answer: "" },
        { id: "rie-2", q: "¿Qué hacemos con los contracargos de Stripe?", answer: "" },
        { id: "rie-3", q: "¿Qué pasa si un instructor incumple (curso malo, no entrega)?", answer: "" },
        { id: "rie-4", q: "¿Cómo manejamos contenido pirateado o quejas de copyright?", answer: "" },
      ],
    },
    {
      id: "metas",
      tag: "Metas",
      title: "Metas, mínimos y máximos del proyecto",
      questions: [
        { id: "met-1", q: "¿Meta de ingresos a 3, 6 y 12 meses? ¿Mínimo aceptable para seguir?", answer: "" },
        { id: "met-2", q: "¿Cuánto capital estamos dispuestos a poner de nuestra bolsa y hasta cuándo?", answer: "" },
        { id: "met-3", q: "¿Número mínimo de instructores, cursos y alumnos para decir que funciona?", answer: "" },
        { id: "met-4", q: "¿Cuál es la línea roja para pivotar o cerrar?", answer: "" },
        { id: "met-5", q: "¿Buscamos inversión externa o crecemos con lo que genera (bootstrap)?", answer: "" },
      ],
    },
    {
      id: "operacion",
      tag: "Operación",
      title: "Operación y responsabilidades",
      questions: [
        { id: "ope-1", q: "¿Quién responde por: producto/código, ventas, soporte, finanzas, contenido y legal?", answer: "" },
        { id: "ope-2", q: "¿Cómo damos soporte a alumnos e instructores y con qué tiempos?", answer: "" },
        { id: "ope-3", q: "¿Quién aprueba nuevos instructores y cursos, y con qué criterios?", answer: "" },
        { id: "ope-4", q: "¿Cada cuánto revisamos los números juntos (junta semanal / mensual)?", answer: "" },
      ],
    },
  ],
};
