import type { Metadata } from "next";

const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://cursumi.com").replace(/\/$/, "");

export const metadata: Metadata = {
  title: "Política de uso de IA — Cursumi",
  description: "Cómo Cursumi utiliza la inteligencia artificial, qué datos procesa y sus límites.",
  alternates: { canonical: `${baseUrl}/ai` },
};

export default function AiPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="mb-2 text-3xl font-bold">Política de uso de inteligencia artificial</h1>
        <p className="mb-8 text-sm text-muted-foreground">Última actualización: junio 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-sm leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold mb-3">1. Uso de IA en la Plataforma</h2>
            <p>
              Cursumi (en adelante, "la Plataforma") utiliza tecnologías de inteligencia artificial
              generativa para mejorar la experiencia de aprendizaje. Esta política explica para qué
              usamos la IA, qué datos se procesan y cuáles son sus límites. Complementa nuestro{" "}
              <a href="/privacy" className="text-primary underline underline-offset-4">
                Aviso de privacidad
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. ¿Para qué usamos la IA?</h2>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                <strong>Recomendaciones de cursos:</strong> sugerir cursos relevantes a partir del
                historial de inscripción y el catálogo disponible.
              </li>
              <li>
                <strong>Asistencia sobre el contenido:</strong> responder preguntas relacionadas con
                el contenido de los cursos.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Proveedor de IA</h2>
            <p>
              Estas funciones se apoyan en modelos de IA de <strong>Google (Gemini)</strong>, a
              quienes enviamos únicamente la información necesaria para generar el resultado. Google
              trata esos datos como encargado, conforme a sus propios términos y políticas de
              privacidad.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Datos que se procesan</h2>
            <p>
              Según la función, podemos enviar al proveedor de IA datos como tu historial de cursos,
              información del catálogo, el contenido de un curso o la pregunta que formulas. No
              enviamos datos de pago ni más información de la estrictamente necesaria para la función.
              No utilizamos tus datos personales para entrenar modelos de IA propios.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Límites y exactitud</h2>
            <p>
              Los resultados generados por IA pueden contener errores, imprecisiones o información
              desactualizada. Tienen carácter <strong>orientativo</strong> y no sustituyen el criterio
              de un instructor ni constituyen asesoría profesional, legal, médica o financiera. Te
              recomendamos verificar la información importante antes de tomar decisiones.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Supervisión humana</h2>
            <p>
              La IA es una herramienta de apoyo, no un sustituto de las personas. Las decisiones
              relevantes dentro de la Plataforma cuentan con supervisión humana, y siempre puedes
              contactar a nuestro equipo o a los instructores para obtener ayuda.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Uso responsable por parte de los usuarios</h2>
            <p>
              Al interactuar con las funciones de IA, te comprometes a no introducir datos sensibles
              de terceros ni utilizarlas para fines ilegales, engañosos o que infrinjan derechos de
              otras personas.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Cambios a esta política</h2>
            <p>
              Podemos actualizar esta política a medida que evolucionen nuestras funciones de IA o la
              normativa aplicable. Publicaremos cualquier cambio en esta misma página, indicando la
              fecha de la última actualización.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Contacto</h2>
            <p>
              Si tienes dudas sobre el uso de IA en Cursumi, escríbenos desde{" "}
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
