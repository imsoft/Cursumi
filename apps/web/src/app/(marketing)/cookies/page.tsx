import type { Metadata } from "next";

const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://cursumi.com").replace(/\/$/, "");

export const metadata: Metadata = {
  title: "Política de cookies — Cursumi",
  description: "Qué cookies y tecnologías similares utiliza Cursumi y cómo gestionarlas.",
  alternates: { canonical: `${baseUrl}/cookies` },
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="mb-2 text-3xl font-bold">Política de cookies</h1>
        <p className="mb-8 text-sm text-muted-foreground">Última actualización: junio 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-sm leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold mb-3">1. ¿Qué son las cookies?</h2>
            <p>
              Las cookies son pequeños archivos de texto que los sitios web almacenan en tu
              dispositivo cuando los visitas. Sirven para que la Plataforma funcione correctamente,
              recuerde tus preferencias y nos ayude a entender cómo se usa Cursumi. También usamos
              tecnologías similares como el almacenamiento local (localStorage) del navegador.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Tipos de cookies que utilizamos</h2>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                <strong>Esenciales:</strong> necesarias para iniciar sesión, mantener tu sesión
                activa y proteger la seguridad de tu cuenta. Sin ellas la Plataforma no funciona.
              </li>
              <li>
                <strong>De preferencias:</strong> recuerdan ajustes como el tema (claro/oscuro) o el
                idioma para personalizar tu experiencia.
              </li>
              <li>
                <strong>Analíticas:</strong> nos permiten medir el uso de la Plataforma (páginas
                visitadas, rendimiento) para mejorarla. Estos datos se tratan de forma agregada.
              </li>
              <li>
                <strong>De terceros:</strong> nuestros proveedores (por ejemplo, el procesador de
                pagos o herramientas de medición) pueden establecer cookies al usar sus servicios.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Cookies de terceros</h2>
            <p>
              Algunas funciones dependen de servicios externos que pueden instalar sus propias
              cookies, entre ellos Stripe (procesamiento de pagos), Vercel (hosting y métricas de
              rendimiento) y herramientas de monitoreo de errores. Estos terceros tratan los datos
              conforme a sus propias políticas de privacidad.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Cómo gestionar o desactivar las cookies</h2>
            <p>
              Puedes configurar tu navegador para bloquear o eliminar cookies en cualquier momento
              desde sus ajustes de privacidad. Ten en cuenta que si desactivas las cookies
              esenciales, algunas funciones —como iniciar sesión o realizar compras— podrían dejar de
              funcionar correctamente.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Cambios a esta política</h2>
            <p>
              Podemos actualizar esta Política de Cookies periódicamente para reflejar cambios en la
              Plataforma o en la normativa aplicable. Publicaremos cualquier cambio en esta misma
              página, indicando la fecha de la última actualización.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Contacto</h2>
            <p>
              Si tienes dudas sobre el uso de cookies, puedes escribirnos a través de{" "}
              <a href="/contact" className="text-primary underline underline-offset-4">
                nuestra página de contacto
              </a>
              . Para más información sobre el tratamiento de tus datos, consulta nuestro{" "}
              <a href="/privacy" className="text-primary underline underline-offset-4">
                Aviso de privacidad
              </a>
              .
            </p>
          </section>

        </div>
      </main>
    </div>
  );
}
