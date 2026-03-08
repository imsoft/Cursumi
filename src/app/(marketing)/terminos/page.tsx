import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos y Condiciones — Cursumi",
  description: "Lee los términos y condiciones de uso de la plataforma Cursumi.",
};

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="mb-2 text-3xl font-bold">Términos y Condiciones</h1>
        <p className="mb-8 text-sm text-muted-foreground">Última actualización: marzo 2025</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-sm leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold mb-3">1. Aceptación de los términos</h2>
            <p>
              Al acceder o usar la plataforma Cursumi (en adelante, "la Plataforma"), aceptas estar
              sujeto a estos Términos y Condiciones. Si no estás de acuerdo con alguna parte de estos
              términos, no podrás acceder al servicio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Descripción del servicio</h2>
            <p>
              Cursumi es una plataforma de educación en línea que conecta a instructores con
              estudiantes mediante cursos virtuales y presenciales. Actuamos como intermediario entre
              instructores independientes y estudiantes; el contenido de los cursos es responsabilidad
              exclusiva de cada instructor.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Cuentas de usuario</h2>
            <p>
              Para acceder a funciones de la Plataforma debes crear una cuenta con información
              verídica. Eres responsable de mantener la confidencialidad de tu contraseña y de todas
              las actividades que ocurran bajo tu cuenta. Cursumi no se hace responsable por pérdidas
              derivadas del acceso no autorizado a tu cuenta.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Compras y pagos</h2>
            <p>
              Los precios se muestran en pesos mexicanos (MXN) e incluyen los impuestos aplicables.
              Los pagos se procesan de forma segura a través de Stripe. Al completar una compra,
              aceptas la política de pagos del procesador correspondiente. Una vez completada la
              transacción, el acceso al curso se activa de manera inmediata.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Política de reembolsos</h2>
            <p>
              Puedes solicitar un reembolso dentro de los primeros 7 días naturales después de la
              compra, siempre que no hayas completado más del 30% del curso. Las solicitudes se
              atienden en un plazo de 5 a 10 días hábiles. Los cursos presenciales tienen políticas
              de cancelación específicas indicadas en la página del curso.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Propiedad intelectual</h2>
            <p>
              Todo el contenido disponible en la Plataforma (videos, textos, imágenes, materiales de
              curso) es propiedad de Cursumi o de los instructores que lo publicaron, y está protegido
              por las leyes de derechos de autor. Queda prohibida la reproducción, distribución o
              modificación sin autorización previa y por escrito.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Conducta del usuario</h2>
            <p>Al usar la Plataforma, te comprometes a no:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Publicar contenido ilegal, ofensivo o que infrinja derechos de terceros.</li>
              <li>Intentar acceder a cuentas ajenas o sistemas de la Plataforma sin autorización.</li>
              <li>Usar la Plataforma para enviar spam o comunicaciones no solicitadas.</li>
              <li>Compartir tu acceso a cursos de pago con terceros.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Instructores</h2>
            <p>
              Los instructores son responsables del contenido que publican en la Plataforma, incluyendo
              su veracidad, calidad y cumplimiento de las leyes aplicables. Cursumi se reserva el
              derecho de retirar cualquier contenido que viole estas políticas. La remuneración a los
              instructores se realiza conforme a los acuerdos de pago establecidos en la plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Limitación de responsabilidad</h2>
            <p>
              Cursumi no garantiza que la Plataforma esté libre de errores o disponible de manera
              ininterrumpida. En la medida permitida por la ley, no seremos responsables por daños
              indirectos, incidentales o consecuentes derivados del uso o imposibilidad de uso de
              la Plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Modificaciones</h2>
            <p>
              Nos reservamos el derecho de modificar estos Términos en cualquier momento. Notificaremos
              los cambios significativos mediante correo electrónico o un aviso prominente en la
              Plataforma. El uso continuado del servicio después de la notificación constituye tu
              aceptación de los nuevos términos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Ley aplicable</h2>
            <p>
              Estos Términos se rigen por las leyes de los Estados Unidos Mexicanos. Cualquier
              controversia se someterá a la jurisdicción de los tribunales competentes de la Ciudad
              de México.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">12. Contacto</h2>
            <p>
              Para cualquier duda sobre estos Términos, puedes contactarnos en{" "}
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
