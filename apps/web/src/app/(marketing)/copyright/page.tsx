import type { Metadata } from "next";

const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://cursumi.com").replace(/\/$/, "");

export const metadata: Metadata = {
  title: "Política de propiedad intelectual — Cursumi",
  description: "Cómo Cursumi protege los derechos de autor y atiende avisos de infracción.",
  alternates: { canonical: `${baseUrl}/copyright` },
};

export default function CopyrightPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="mb-2 text-3xl font-bold">Política de propiedad intelectual</h1>
        <p className="mb-8 text-sm text-muted-foreground">Última actualización: junio 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-sm leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold mb-3">1. Respeto a los derechos de autor</h2>
            <p>
              Cursumi respeta los derechos de propiedad intelectual de terceros y espera que sus
              usuarios e instructores hagan lo mismo. Todo el contenido publicado en la Plataforma
              debe ser original del autor o contar con la debida autorización o licencia para su uso.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Titularidad del contenido</h2>
            <p>
              El contenido de los cursos pertenece a los instructores que lo crean o a Cursumi, según
              corresponda. La marca, el logotipo, el diseño y el software de la Plataforma son
              propiedad de Cursumi. Ningún elemento de la Plataforma podrá reproducirse, distribuirse
              o modificarse sin autorización previa y por escrito.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Aviso de infracción</h2>
            <p>
              Si consideras que algún contenido disponible en la Plataforma infringe tus derechos de
              autor u otros derechos de propiedad intelectual, envíanos un aviso desde{" "}
              <a href="/contact" className="text-primary underline underline-offset-4">
                nuestra página de contacto
              </a>{" "}
              incluyendo:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Identificación de la obra protegida que consideras infringida.</li>
              <li>La URL o ubicación exacta del contenido dentro de la Plataforma.</li>
              <li>Tus datos de contacto (nombre completo y correo electrónico).</li>
              <li>
                Una declaración de buena fe de que el uso no está autorizado por el titular, su agente
                o la ley.
              </li>
              <li>
                Una declaración de que la información proporcionada es veraz y de que eres el titular o
                estás autorizado para actuar en su nombre.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Proceso de retiro</h2>
            <p>
              Una vez recibido un aviso válido, podremos retirar o deshabilitar el acceso al contenido
              señalado y notificar al instructor responsable. Actuaremos con la diligencia debida y
              dentro de un plazo razonable.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Contranotificación</h2>
            <p>
              El instructor cuyo contenido haya sido retirado podrá presentar una contranotificación si
              considera que el retiro fue producto de un error o de una identificación incorrecta,
              aportando los elementos que sustenten su titularidad o autorización de uso.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Infractores reincidentes</h2>
            <p>
              Cursumi podrá suspender o cancelar las cuentas de usuarios o instructores que infrinjan de
              forma reiterada los derechos de propiedad intelectual de terceros.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Marco legal</h2>
            <p>
              Esta política se rige por la Ley Federal del Derecho de Autor y demás normativa aplicable
              en México, sin perjuicio de los procedimientos previstos para contenidos sujetos a
              legislación de otros países.
            </p>
          </section>

        </div>
      </main>
    </div>
  );
}
