import type { Metadata } from "next";

const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://cursumi.com").replace(/\/$/, "");

export const metadata: Metadata = {
  title: "Política de reembolsos — Cursumi",
  description: "Condiciones y proceso para solicitar la devolución de una compra en Cursumi.",
  alternates: { canonical: `${baseUrl}/refunds` },
};

export default function RefundsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="mb-2 text-3xl font-bold">Política de reembolsos</h1>
        <p className="mb-8 text-sm text-muted-foreground">Última actualización: junio 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-sm leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold mb-3">1. Alcance</h2>
            <p>
              Esta política describe las condiciones bajo las cuales puedes solicitar el reembolso de
              una compra realizada en Cursumi (en adelante, "la Plataforma"). Aplica a cursos
              individuales adquiridos por estudiantes y complementa lo establecido en nuestros{" "}
              <a href="/terms" className="text-primary underline underline-offset-4">
                Términos y condiciones
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Cursos en línea</h2>
            <p>
              Puedes solicitar un reembolso completo dentro de los <strong>7 días naturales</strong>{" "}
              posteriores a la compra, siempre que no hayas completado más del <strong>30%</strong> del
              contenido del curso. Esta condición busca garantizar un uso de buena fe del periodo de
              garantía.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Cursos presenciales</h2>
            <p>
              Los cursos presenciales o con cupo limitado pueden tener políticas de cancelación
              específicas indicadas en la página del curso. Por lo general, las cancelaciones
              realizadas con anticipación suficiente al inicio del curso son reembolsables; las
              solicitudes posteriores al inicio pueden no serlo.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Casos no reembolsables</h2>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Solicitudes realizadas después de los 7 días naturales de la compra.</li>
              <li>Cursos completados en más del 30% de su contenido.</li>
              <li>Certificados ya emitidos o descargados.</li>
              <li>Compras realizadas con un cupón o promoción explícitamente marcada como no reembolsable.</li>
              <li>Uso indebido o reiterado del periodo de garantía.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Cómo solicitar un reembolso</h2>
            <p>
              Para iniciar una solicitud, escríbenos desde{" "}
              <a href="/contact" className="text-primary underline underline-offset-4">
                nuestra página de contacto
              </a>{" "}
              indicando el correo de tu cuenta, el nombre del curso y el motivo de la solicitud.
              Revisaremos tu caso y te confirmaremos la resolución.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Plazos y forma de devolución</h2>
            <p>
              Las solicitudes se atienden en un plazo de <strong>5 a 10 días hábiles</strong>. Los
              reembolsos aprobados se realizan al mismo método de pago utilizado en la compra, a
              través de nuestro procesador de pagos (Stripe). El tiempo en que el monto se refleje en
              tu estado de cuenta depende de tu banco o emisor.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Compras empresariales (B2B)</h2>
            <p>
              Las suscripciones o licencias adquiridas por empresas pueden regirse por condiciones
              comerciales específicas pactadas en el momento de la contratación, las cuales
              prevalecerán sobre esta política general.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Derechos del consumidor</h2>
            <p>
              Esta política no limita los derechos que te correspondan conforme a la Ley Federal de
              Protección al Consumidor y demás normativa aplicable en México.
            </p>
          </section>

        </div>
      </main>
    </div>
  );
}
