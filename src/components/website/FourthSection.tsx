import { UserCircleIcon } from "@heroicons/react/24/outline";
import {
  AdjustmentsHorizontalIcon,
  ClockIcon,
  DocumentChartBarIcon,
  FolderIcon,
  HeartIcon,
  QueueListIcon,
  ServerStackIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

const features = [
  {
    name: "Acceso Ilimitado",
    description:
      "Accede a una cantidad ilimitada de cursos y recursos sin restricciones, cuando y donde lo necesites.",
    icon: ServerStackIcon,
  },
  {
    name: "Gestión de Cursos",
    description:
      "Administra tus cursos y módulos con facilidad, personalizando tu aprendizaje según tus necesidades.",
    icon: QueueListIcon,
  },
  {
    name: "Reportes de Progreso",
    description:
      "Monitorea tu avance con informes detallados y ajusta tu estrategia de aprendizaje para alcanzar tus metas.",
    icon: DocumentChartBarIcon,
  },
  {
    name: "Interacción Dinámica",
    description:
      "Conecta con instructores y compañeros para una experiencia de aprendizaje colaborativa y enriquecedora.",
    icon: AdjustmentsHorizontalIcon,
  },
  {
    name: "Respuestas Guardadas",
    description:
      "Ahorra tiempo con respuestas prediseñadas para preguntas frecuentes y feedback instantáneo.",
    icon: FolderIcon,
  },
  {
    name: "Comentarios en Tiempo Real",
    description:
      "Participa en discusiones y recibe comentarios en tiempo real para enriquecer tu comprensión.",
    icon: ClockIcon,
  },
  {
    name: "Conexión con la Comunidad",
    description:
      "Forma parte de una comunidad activa de estudiantes y profesionales que comparten tus intereses y objetivos.",
    icon: UserGroupIcon,
  },
  {
    name: "Aprendizaje Personalizado",
    description:
      "Disfruta de un enfoque de aprendizaje adaptativo que se ajusta a tu ritmo y estilo, asegurando que cada lección sea relevante y efectiva para ti.",
    icon: UserCircleIcon,
  },
];

export const FourthSection = () => {
  return (
    <>
      {/* Gradient Feature Section */}
      <div className="bg-gradient-to-r from-purple-800 to-purple-700">
        <div className="mx-auto max-w-4xl px-6 py-16 sm:pb-24 sm:pt-20 lg:max-w-7xl lg:px-8 lg:pt-24">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Educación diseñada para la eficiencia
          </h2>
          <p className="mt-4 max-w-3xl text-lg text-purple-200">
            Con Cursumi, optimizamos tu experiencia educativa con herramientas
            innovadoras que facilitan el aprendizaje y la interacción,
            permitiéndote maximizar tu tiempo y esfuerzo.
          </p>
          <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-16">
            {features.map((feature) => (
              <div key={feature.name}>
                <div>
                  <span className="flex h-12 w-12 items-center justify-center rounded-md bg-white bg-opacity-10">
                    <feature.icon
                      aria-hidden="true"
                      className="h-6 w-6 text-white"
                    />
                  </span>
                </div>
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-white">
                    {feature.name}
                  </h3>
                  <p className="mt-2 text-base text-purple-200">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
