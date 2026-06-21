import type { Metadata } from "next";

const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://cursumi.com").replace(/\/$/, "");

export const metadata: Metadata = {
  title: "Términos para instructores — Cursumi",
  description: "Condiciones aplicables a los instructores que publican cursos en Cursumi.",
  alternates: { canonical: `${baseUrl}/instructor-terms` },
};

export default function InstructorTermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="mb-2 text-3xl font-bold">Términos para instructores</h1>
        <p className="mb-8 text-sm text-muted-foreground">Última actualización: junio 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-sm leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold mb-3">1. Relación con la Plataforma</h2>
            <p>
              Estos términos aplican a quienes publican contenido como instructores en Cursumi (en
              adelante, "Instructor"). El Instructor actúa como creador independiente; nada en estos
              términos crea una relación laboral, de sociedad o de agencia con Cursumi. Estos términos
              complementan los{" "}
              <a href="/terms" className="text-primary underline underline-offset-4">
                Términos y condiciones
              </a>{" "}
              generales.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Requisitos del instructor</h2>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Proporcionar información verídica para la validación de su cuenta.</li>
              <li>Contar con los derechos necesarios sobre todo el contenido que publique.</li>
              <li>Cumplir las leyes fiscales y emitir comprobantes cuando corresponda.</li>
              <li>Mantener un trato profesional y respetuoso con los estudiantes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Contenido y licencia</h2>
            <p>
              El Instructor conserva la titularidad de su contenido. Al publicarlo, otorga a Cursumi
              una licencia no exclusiva, mundial y revocable para alojar, mostrar, transmitir y
              promocionar dicho contenido dentro de la Plataforma con el fin de prestar el servicio a
              los estudiantes. Esta licencia subsiste respecto de los estudiantes que ya hayan
              adquirido el curso, incluso si el contenido se retira posteriormente.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Responsabilidad sobre el contenido</h2>
            <p>
              El Instructor es el único responsable de la exactitud, calidad, legalidad y originalidad
              de su contenido. Garantiza que no infringe derechos de propiedad intelectual ni otros
              derechos de terceros, y mantiene indemne a Cursumi frente a reclamaciones derivadas de su
              contenido.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Precios y pagos</h2>
            <p>
              Los pagos a instructores se realizan conforme a los acuerdos de remuneración y a la
              comisión de la Plataforma vigente al momento de la venta, según se indique en el panel
              del instructor. Los pagos se procesan en los periodos y por los medios establecidos en la
              Plataforma, una vez transcurrido el periodo de garantía de reembolso aplicable a cada
              compra.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Reembolsos a estudiantes</h2>
            <p>
              Cuando un estudiante reciba un reembolso conforme a nuestra{" "}
              <a href="/refunds" className="text-primary underline underline-offset-4">
                Política de reembolsos
              </a>
              , el importe correspondiente podrá descontarse de los pagos al Instructor o de
              liquidaciones futuras.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Conducta prohibida</h2>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Publicar contenido falso, engañoso o que infrinja derechos de terceros.</li>
              <li>Manipular reseñas, calificaciones o métricas de la Plataforma.</li>
              <li>Redirigir a los estudiantes para evadir el procesamiento de pagos de la Plataforma.</li>
              <li>Recopilar datos de estudiantes para fines ajenos al curso sin consentimiento.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Suspensión y terminación</h2>
            <p>
              Cursumi puede retirar contenido o suspender cuentas de instructores que incumplan estos
              términos, sin perjuicio de las obligaciones de pago ya devengadas. El Instructor puede
              dejar de publicar en cualquier momento, respetando el acceso de los estudiantes que ya
              hayan adquirido sus cursos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Contacto</h2>
            <p>
              Para dudas sobre estos términos, escríbenos desde{" "}
              <a href="/contact" className="text-primary underline underline-offset-4">
                nuestra página de contacto
              </a>
              .
            </p>
          </section>

        </div>
      </main>
    </div>
  );
}
