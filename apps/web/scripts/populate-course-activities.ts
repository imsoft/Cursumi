import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { readFileSync } from "fs";

// Load .env
if (!process.env.DATABASE_URL) {
  try {
    const env = readFileSync(".env", "utf-8");
    for (const line of env.split("\n")) {
      const eqIdx = line.indexOf("=");
      if (eqIdx === -1) continue;
      const key = line.slice(0, eqIdx).trim();
      let val = line.slice(eqIdx + 1).trim();
      if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) {
        val = val.slice(1, -1);
      }
      if (key && !process.env[key]) process.env[key] = val;
    }
  } catch {
    // .env not found
  }
}

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter } as any);

const COURSE_SLUG = "desarrollo-rapido-de-startups-con-inteligencia-artificial-y-claude-por-brandon-uriel-garcia-ramos";

async function main() {
  console.log(`Buscando curso con slug: ${COURSE_SLUG}`);
  const course = await prisma.course.findUnique({
    where: { slug: COURSE_SLUG },
    include: {
      sections: {
        include: {
          lessons: true,
        },
      },
    },
  });

  if (!course) {
    console.error(`Error: Curso con slug ${COURSE_SLUG} no encontrado.`);
    return;
  }

  console.log(`Curso encontrado: "${course.title}" (ID: ${course.id})`);

  // 1. Configurar Examen Final Completo en el Curso
  console.log("Configurando Examen Final...");
  const finalExamData = {
    id: crypto.randomUUID(),
    title: "Examen Final: IA y Claude para Startups",
    description: "Demuestra tus conocimientos sobre el uso de modelos de lenguaje, desarrollo de prototipos rápidos, programación con Cursor e integración de APIs en la creación de tu startup.",
    instructions: "Este examen consta de 5 preguntas de opción múltiple y verdadero/falso. Para aprobar necesitas una puntuación mínima de 80 puntos.",
    passingScore: 80,
    questions: [
      {
        id: "fe-q1",
        question: "¿Qué modelo de lenguaje es desarrollado por Anthropic y destaca por su excelente capacidad de razonamiento en desarrollo de software?",
        type: "multiple-choice",
        options: [
          "GPT-4o",
          "Claude 3.5 Sonnet",
          "Gemini 1.5 Pro",
          "Llama 3.1"
        ],
        correctAnswer: 1, // Claude 3.5 Sonnet
        points: 20
      },
      {
        id: "fe-q2",
        question: "¿Cuál es el principal beneficio de utilizar v0 de Vercel al validar una idea de startup?",
        type: "multiple-choice",
        options: [
          "Permite alojar bases de datos SQL gratuitas",
          "Genera interfaces de usuario React y Tailwind CSS a partir de lenguaje natural en segundos",
          "Automatiza el envío de correos electrónicos transaccionales",
          "Conecta las APIs de Stripe y Paypal automáticamente"
        ],
        correctAnswer: 1, // Genera interfaces...
        points: 20
      },
      {
        id: "fe-q3",
        question: "Cursor es un editor de código que está construido como un fork directo de Visual Studio Code (VS Code), lo que permite conservar las mismas extensiones y atajos.",
        type: "true-false",
        options: ["Verdadero", "Falso"],
        correctAnswer: 0, // Verdadero
        points: 20
      },
      {
        id: "fe-q4",
        question: "En Make (antes Integromat), ¿cómo se llama el elemento que permite recibir información en tiempo real desde un servicio externo cuando ocurre un evento?",
        type: "multiple-choice",
        options: [
          "Router",
          "Webhook",
          "API Token",
          "Data Store"
        ],
        correctAnswer: 1, // Webhook
        points: 20
      },
      {
        id: "fe-q5",
        question: "Un MVP (Producto Mínimo Viable) debe contener todas las características del producto final para poder presentarse al mercado.",
        type: "true-false",
        options: ["Verdadero", "Falso"],
        correctAnswer: 1, // Falso
        points: 20
      }
    ]
  };

  await prisma.course.update({
    where: { id: course.id },
    data: { finalExam: finalExamData },
  });
  console.log("¡Examen Final configurado con éxito!");

  // 2. Modificar Lección 1.3 para que sea un QUIZ de lección
  console.log("\nConfigurando Quiz en lección de la Sección 1...");
  const quizLesson = course.sections[0]?.lessons.find((l) => l.order === 3); // Creación de Lean Canvas
  if (quizLesson) {
    const quizContent = {
      instructions: "Responde las siguientes preguntas rápidas sobre el Lean Canvas y su relación con Claude.",
      passingScore: 70,
      attempts: 3,
      passingRequired: true,
      questions: [
        {
          id: "ql-q1",
          question: "¿Cuál de los siguientes no es un bloque del bloque Lean Canvas?",
          type: "multiple-choice",
          options: [
            "Problema",
            "Propuesta de Valor Única",
            "Organigrama de RRHH",
            "Estructura de Costes"
          ],
          correctAnswer: 2, // Organigrama
          points: 50
        },
        {
          id: "ql-q2",
          question: "El Lean Canvas se enfoca principalmente en la planeación a largo plazo del negocio (5+ años).",
          type: "true-false",
          options: ["Verdadero", "Falso"],
          correctAnswer: 1, // Falso
          points: 50
        }
      ]
    };

    await prisma.lesson.update({
      where: { id: quizLesson.id },
      data: {
        type: "quiz",
        content: JSON.stringify(quizContent)
      }
    });
    console.log(`Lección "${quizLesson.title}" convertida a QUIZ con éxito.`);
  }

  // 3. Modificar Lección 2.2 para que sea una TAREA (Assignment)
  console.log("\nConfigurando Tarea en lección de la Sección 2...");
  const assignmentLesson = course.sections[1]?.lessons.find((l) => l.order === 2); // Exportar y Refinar Interfaces
  if (assignmentLesson) {
    const assignmentContent = {
      instructions: "Diseña un prototipo visual en v0 de Vercel de tu landing page de registro. Exporta el código generado e intégralo en un repositorio local de React. Sube una captura de pantalla del resultado y el código de tu componente principal.",
      criteria: [
        {
          id: "ac-1",
          criterion: "Diseño e interfaz responsiva en v0",
          points: 40,
          description: "La UI debe verse profesional y adaptarse a dispositivos móviles."
        },
        {
          id: "ac-2",
          criterion: "Integración local con React y Tailwind CSS",
          points: 40,
          description: "El código debe compilar correctamente en tu entorno local sin errores de TypeScript o clases perdidas."
        },
        {
          id: "ac-3",
          criterion: "Personalización y copia",
          points: 20,
          description: "Los textos y copys deben estar adaptados al problema real que resuelve tu startup."
        }
      ]
    };

    await prisma.lesson.update({
      where: { id: assignmentLesson.id },
      data: {
        type: "assignment",
        content: JSON.stringify(assignmentContent)
      }
    });
    console.log(`Lección "${assignmentLesson.title}" convertida a TAREA con éxito.`);
  }

  // 4. Agregar MINIJUEGO (Ahorcado - Hangman) al final de la Sección 1
  console.log("\nConfigurando Minijuegos de Sección...");
  const section1 = course.sections[0];
  if (section1) {
    const activitiesData = [
      {
        id: crypto.randomUUID(),
        kind: "minigame",
        minigame: {
          type: "hangman",
          instruction: "Adivina las palabras clave sobre Inteligencia Artificial y Claude",
          words: [
            { word: "CLAUDE", hint: "Modelo de lenguaje avanzado de Anthropic ideal para desarrollo." },
            { word: "CURSOR", "hint": "Editor de código inteligente que utiliza modelos de IA de forma nativa." },
            { word: "PROMPT", "hint": "Instrucción de texto que le das a una IA para obtener una respuesta." }
          ]
        }
      }
    ];

    await prisma.courseSection.update({
      where: { id: section1.id },
      data: { activities: activitiesData }
    });
    console.log(`Minijuego de Ahorcado agregado a la Sección 1: "${section1.title}"`);
  }

  // 5. Agregar MINIJUEGO (Memoria - Memory Match) al final de la Sección 2
  const section2 = course.sections[1];
  if (section2) {
    const activitiesData = [
      {
        id: crypto.randomUUID(),
        kind: "minigame",
        minigame: {
          type: "memory",
          instruction: "Encuentra las parejas de conceptos y tecnologías de prototipado rápido",
          pairs: [
            { term: "v0", definition: "Generador de UI con React y Tailwind CSS de Vercel" },
            { term: "MVP", definition: "Producto Mínimo Viable para probar valor inicial" },
            { term: "Stripe", definition: "Pasarela de pagos en línea para cobrar suscripciones" },
            { term: "Make", definition: "Plataforma de automatización de flujos con APIs visuales" }
          ]
        }
      }
    ];

    await prisma.courseSection.update({
      where: { id: section2.id },
      data: { activities: activitiesData }
    });
    console.log(`Minijuego de Memoria agregado a la Sección 2: "${section2.title}"`);
  }

  console.log("\n🎉 ¡Curso de IA enriquecido con todas las actividades con éxito!");
}

main()
  .catch((e) => {
    console.error("Error al poblar las actividades:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
