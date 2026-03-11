import type { Metadata } from "next";

const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://cursumi.com").replace(/\/$/, "");

export const metadata: Metadata = {
  title: "Aviso de privacidad — Cursumi",
  description: "Cómo Cursumi recopila, usa y protege tus datos personales.",
  alternates: { canonical: `${baseUrl}/privacidad` },
};

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="mb-2 text-3xl font-bold">Aviso de privacidad</h1>
        <p className="mb-8 text-sm text-muted-foreground">Última actualización: marzo 2025</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-sm leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold mb-3">1. Responsable del tratamiento</h2>
            <p>
              Cursumi (en adelante, "nosotros" o "la Plataforma") es responsable del tratamiento de
              tus datos personales, en cumplimiento con la Ley Federal de Protección de Datos
              Personales en Posesión de los Particulares (LFPDPPP) y su Reglamento.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Datos que recopilamos</h2>
            <p>Recopilamos los siguientes tipos de información:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Datos de identificación:</strong> nombre, correo electrónico, foto de perfil.</li>
              <li><strong>Datos de uso:</strong> cursos vistos, progreso, lecciones completadas, resultados de exámenes.</li>
              <li><strong>Datos de pago:</strong> información de transacciones procesadas por Stripe (no almacenamos datos de tarjetas directamente).</li>
              <li><strong>Datos técnicos:</strong> dirección IP, tipo de navegador, sistema operativo, páginas visitadas.</li>
              <li><strong>Comunicaciones:</strong> mensajes enviados a instructores o al soporte de la Plataforma.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Finalidades del tratamiento</h2>
            <p>Tus datos se usan para:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Crear y gestionar tu cuenta de usuario.</li>
              <li>Procesar pagos y emitir comprobantes.</li>
              <li>Personalizar tu experiencia de aprendizaje y recomendaciones.</li>
              <li>Enviar notificaciones relacionadas con tus cursos (inscripciones, certificados, mensajes).</li>
              <li>Comunicaciones de marketing (con tu consentimiento).</li>
              <li>Cumplir obligaciones legales y fiscales.</li>
              <li>Mejorar la calidad y funcionamiento de la Plataforma.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Transferencia de datos</h2>
            <p>
              Tus datos pueden ser compartidos con terceros proveedores de servicios necesarios para
              operar la Plataforma, incluyendo:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Stripe:</strong> procesamiento de pagos.</li>
              <li><strong>Neon / Vercel:</strong> infraestructura de base de datos y hosting.</li>
              <li><strong>Cloudinary:</strong> almacenamiento de imágenes y videos.</li>
              <li><strong>Resend:</strong> envío de correos electrónicos transaccionales.</li>
            </ul>
            <p className="mt-3">
              No vendemos, alquilamos ni compartimos tus datos con terceros con fines comerciales
              propios sin tu consentimiento.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Derechos ARCO</h2>
            <p>
              Tienes derecho a Acceder, Rectificar, Cancelar u Oponerte al tratamiento de tus datos
              personales (derechos ARCO). Para ejercerlos, envíanos una solicitud a través de nuestra
              página de contacto. Responderemos en un plazo máximo de 20 días hábiles.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Cookies y tecnologías similares</h2>
            <p>
              Usamos cookies propias esenciales para el funcionamiento de la sesión y cookies de
              analíticas para entender el uso de la Plataforma. Puedes configurar tu navegador para
              rechazar cookies, aunque esto puede afectar la funcionalidad del sitio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Retención de datos</h2>
            <p>
              Conservamos tus datos mientras tu cuenta esté activa o por el tiempo necesario para
              cumplir con obligaciones legales. Al eliminar tu cuenta, tus datos personales serán
              eliminados en un plazo de 30 días, excepto aquellos requeridos por ley.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Seguridad</h2>
            <p>
              Implementamos medidas técnicas y organizativas para proteger tus datos contra acceso no
              autorizado, pérdida o destrucción, incluyendo cifrado en tránsito (TLS) y en reposo,
              control de acceso basado en roles y auditorías periódicas.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Cambios a este aviso</h2>
            <p>
              Podemos actualizar este Aviso de Privacidad periódicamente. Notificaremos cambios
              significativos por correo electrónico o mediante un aviso en la Plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Contacto</h2>
            <p>
              Para ejercer tus derechos ARCO o para cualquier duda sobre este Aviso, contáctanos en{" "}
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
