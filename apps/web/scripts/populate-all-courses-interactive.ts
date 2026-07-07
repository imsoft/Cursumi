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

const COURSE_C_ID = "cmrb1z3g200003u1mup2qk02i";
const COURSE_WEB_ID = "cmrb26mfn0000571m4ou102st";
const COURSE_CLAUDE_ID = "cmrb5vtlw0001kx1m9qjgauf1";

async function populateCourseC() {
  console.log("\n==============================================");
  console.log("Procesando Curso: Inicios en Programación C...");
  const course = await prisma.course.findUnique({
    where: { id: COURSE_C_ID },
    include: { sections: { include: { lessons: true } } },
  });
  if (!course) {
    console.error("Curso C no encontrado");
    return;
  }

  // 1. Examen Final
  const exam = {
    id: crypto.randomUUID(),
    title: "Examen Final: Programación en C",
    description: "Demuestra tus competencias en sintaxis, control de flujo, funciones y gestión de memoria en Lenguaje C.",
    instructions: "Responde las 5 preguntas. Se requiere 80 puntos para aprobar.",
    passingScore: 80,
    questions: [
      {
        id: "c-fe-q1",
        question: "¿Cuál es la sintaxis correcta para declarar una variable entera en C?",
        type: "multiple-choice",
        options: ["var x int;", "int x;", "x = int;", "integer x;"],
        correctAnswer: 1,
        points: 20,
      },
      {
        id: "c-fe-q2",
        question: "¿Cuál es el operador de dirección utilizado en C para obtener la dirección de memoria de una variable?",
        type: "multiple-choice",
        options: ["*", "&", "%", "->"],
        correctAnswer: 1,
        points: 20,
      },
      {
        id: "c-fe-q3",
        question: "La memoria asignada dinámicamente con malloc se libera automáticamente al finalizar la ejecución de la función donde fue creada.",
        type: "true-false",
        options: ["Verdadero", "Falso"],
        correctAnswer: 1,
        points: 20,
      },
      {
        id: "c-fe-q4",
        question: "¿Qué función de la biblioteca estándar (stdio.h) se utiliza para imprimir texto con formato en consola?",
        type: "multiple-choice",
        options: ["scanf", "printf", "print", "echo"],
        correctAnswer: 1,
        points: 20,
      },
      {
        id: "c-fe-q5",
        question: "¿Cuál es el tamaño en bytes del tipo de datos char en la especificación estándar de C?",
        type: "multiple-choice",
        options: ["1 byte", "2 bytes", "4 bytes", "Depende del procesador"],
        correctAnswer: 0,
        points: 20,
      },
    ],
  };

  await prisma.course.update({ where: { id: COURSE_C_ID }, data: { finalExam: exam } });
  console.log("Examen final del Curso C actualizado.");

  // 2. Quiz y Minijuego en Sección 1
  const sec1 = course.sections.find((s) => s.order === 1);
  if (sec1) {
    const maxOrder = Math.max(...sec1.lessons.map((l) => l.order), 0);
    
    // Quiz lección
    const quizContent = {
      instructions: "Responde este quiz rápido sobre variables y funciones en C.",
      passingScore: 70,
      questions: [
        {
          id: "c-q-1",
          question: "¿Toda instrucción en Lenguaje C debe finalizar obligatoriamente con qué caracter?",
          type: "multiple-choice",
          options: ["Punto (.)", "Dos puntos (:)", "Punto y coma (;)", "Ninguno"],
          correctAnswer: 2,
          points: 50,
        },
        {
          id: "c-q-2",
          question: "¿Cómo se llama la función principal por donde comienza la ejecución de cualquier programa en C?",
          type: "multiple-choice",
          options: ["start()", "init()", "main()", "run()"],
          correctAnswer: 2,
          points: 50,
        },
      ],
    };

    // Minijuego Ahorcado
    const minigameContent = {
      type: "hangman",
      instruction: "Adivina las palabras clave de desarrollo en C",
      words: [
        { word: "COMPILADOR", hint: "Programa que traduce código C a lenguaje máquina." },
        { word: "PUNTERO", hint: "Variable que almacena la dirección de memoria de otra variable." },
        { word: "VARIABLE", hint: "Espacio reservado en memoria para almacenar un valor." },
      ],
    };

    await prisma.lesson.create({
      data: {
        sectionId: sec1.id,
        title: "Quiz Rápido: Fundamentos de C",
        type: "quiz",
        order: maxOrder + 1,
        content: JSON.stringify(quizContent),
      },
    });

    await prisma.lesson.create({
      data: {
        sectionId: sec1.id,
        title: "Minijuego: Ahorcado de Conceptos C",
        type: "section_minigame",
        order: maxOrder + 2,
        content: JSON.stringify(minigameContent),
      },
    });
    console.log("Quiz y Minijuego agregados a Sección 1 del Curso C.");
  }

  // 3. Tarea en Sección 2
  const sec2 = course.sections.find((s) => s.order === 2);
  if (sec2) {
    const maxOrder = Math.max(...sec2.lessons.map((l) => l.order), 0);
    const assignmentContent = {
      instructions: "Escribe un programa completo en C que solicite al usuario su edad y determine si es mayor de edad (>= 18 años). Debe compilar sin advertencias. Sube tu archivo `.c` y una captura de pantalla de la terminal con el programa en ejecución.",
      criteria: [
        { id: "c-ac-1", criterion: "Uso correcto de condicionales (if/else)", points: 50, description: "La lógica para determinar la mayoría de edad es correcta." },
        { id: "c-ac-2", criterion: "Compilación libre de errores", points: 50, description: "El código compila perfectamente sin warnings." },
      ],
    };

    await prisma.lesson.create({
      data: {
        sectionId: sec2.id,
        title: "Tarea Práctica: Condicionales en C",
        type: "assignment",
        order: maxOrder + 1,
        content: JSON.stringify(assignmentContent),
      },
    });
    console.log("Tarea agregada a Sección 2 del Curso C.");
  }
}

async function populateCourseWeb() {
  console.log("\n==============================================");
  console.log("Procesando Curso: Desarrollo Web desde Cero...");
  const course = await prisma.course.findUnique({
    where: { id: COURSE_WEB_ID },
    include: { sections: { include: { lessons: true } } },
  });
  if (!course) {
    console.error("Curso Web no encontrado");
    return;
  }

  // 1. Examen Final
  const exam = {
    id: crypto.randomUUID(),
    title: "Examen Final: Desarrollo Web HTML, CSS y JS",
    description: "Prueba final integradora de conceptos de maquetación web, estilos responsivos y lógica con JavaScript.",
    instructions: "Responde las 5 preguntas. Necesitas un 80% de respuestas correctas para aprobar.",
    passingScore: 80,
    questions: [
      {
        id: "web-fe-q1",
        question: "¿Qué etiqueta HTML se utiliza para incrustar una imagen en una página?",
        type: "multiple-choice",
        options: ["<image>", "<img>", "<picture>", "<src>"],
        correctAnswer: 1,
        points: 20,
      },
      {
        id: "web-fe-q2",
        question: "¿Qué propiedad de CSS se utiliza para cambiar el color de fondo de un contenedor?",
        type: "multiple-choice",
        options: ["color", "bg-color", "background-color", "fill"],
        correctAnswer: 2,
        points: 20,
      },
      {
        id: "web-fe-q3",
        question: "En JavaScript moderno, la palabra clave const permite declarar una variable cuyo valor puede ser reasignado posteriormente en cualquier parte del código.",
        type: "true-false",
        options: ["Verdadero", "Falso"],
        correctAnswer: 1,
        points: 20,
      },
      {
        id: "web-fe-q4",
        question: "¿Cuál es la forma correcta de agregar una clase CSS a un elemento usando JavaScript nativo?",
        type: "multiple-choice",
        options: [
          "element.class = \"nueva\"",
          "element.classList.add(\"nueva\")",
          "element.addClass(\"nueva\")",
          "element.setAttribute(\"class\", \"nueva\")"
        ],
        correctAnswer: 1,
        points: 20,
      },
      {
        id: "web-fe-q5",
        question: "¿Qué caracter especial o selector CSS se utiliza para hacer referencia a una clase?",
        type: "multiple-choice",
        options: ["El punto (.)", "El gato (#)", "El asterisco (*)", "La arroba (@)"],
        correctAnswer: 0,
        points: 20,
      },
    ],
  };

  await prisma.course.update({ where: { id: COURSE_WEB_ID }, data: { finalExam: exam } });
  console.log("Examen final del Curso Web actualizado.");

  // 2. Quiz y Minijuego en Sección 1
  const sec1 = course.sections.find((s) => s.order === 1);
  if (sec1) {
    const maxOrder = Math.max(...sec1.lessons.map((l) => l.order), 0);
    
    // Quiz lección
    const quizContent = {
      instructions: "Valida tus conceptos sobre estructura HTML5 y selectores básicos.",
      passingScore: 70,
      questions: [
        {
          id: "web-q-1",
          question: "¿Cuál de los siguientes es un elemento semántico de HTML5?",
          type: "multiple-choice",
          options: ["<div>", "<span>", "<section>", "<font>"],
          correctAnswer: 2,
          points: 50,
        },
        {
          id: "web-q-2",
          question: "¿Qué propiedad de CSS se utiliza para controlar el espacio interno (padding) de un elemento?",
          type: "multiple-choice",
          options: ["margin", "padding", "border", "gap"],
          correctAnswer: 1,
          points: 50,
        },
      ],
    };

    // Minijuego Ahorcado
    const minigameContent = {
      type: "hangman",
      instruction: "Adivina los términos web",
      words: [
        { word: "SELECTOR", hint: "Patrón en CSS usado para identificar los elementos a los que se aplican los estilos." },
        { word: "ATRIBUTO", hint: "Información adicional que se añade a una etiqueta HTML (ej. class, src, id)." },
        { word: "ELEMENTO", hint: "Etiqueta completa de HTML con su etiqueta de apertura, contenido y cierre." },
      ],
    };

    await prisma.lesson.create({
      data: {
        sectionId: sec1.id,
        title: "Quiz: Estructura HTML y CSS",
        type: "quiz",
        order: maxOrder + 1,
        content: JSON.stringify(quizContent),
      },
    });

    await prisma.lesson.create({
      data: {
        sectionId: sec1.id,
        title: "Minijuego: Ahorcado de Conceptos Web",
        type: "section_minigame",
        order: maxOrder + 2,
        content: JSON.stringify(minigameContent),
      },
    });
    console.log("Quiz y Minijuego agregados a Sección 1 del Curso Web.");
  }

  // 3. Tarea en Sección 2
  const sec2 = course.sections.find((s) => s.order === 2);
  if (sec2) {
    const maxOrder = Math.max(...sec2.lessons.map((l) => l.order), 0);
    const assignmentContent = {
      instructions: "Maqueta una página de aterrizaje (landing page) responsiva utilizando HTML5 semántico y CSS puro. Debe tener una cabecera, una sección de características y un pie de página. Sube el archivo comprimido (.zip) con tus archivos index.html e index.css.",
      criteria: [
        { id: "web-ac-1", criterion: "Uso de HTML5 semántico", points: 40, description: "Utiliza etiquetas como header, nav, section, footer adecuadamente." },
        { id: "web-ac-2", criterion: "Diseño Responsivo con CSS", points: 40, description: "La página se visualiza correctamente tanto en móviles como en computadoras." },
        { id: "web-ac-3", criterion: "Estilo y Estética", points: 20, description: "La combinación de colores y tipografías se ve moderna." },
      ],
    };

    await prisma.lesson.create({
      data: {
        sectionId: sec2.id,
        title: "Tarea: Maquetación Responsiva",
        type: "assignment",
        order: maxOrder + 1,
        content: JSON.stringify(assignmentContent),
      },
    });
    console.log("Tarea agregada a Sección 2 del Curso Web.");
  }
}

async function populateCourseClaude() {
  console.log("\n==============================================");
  console.log("Procesando Curso: IA y Startups con Claude...");
  const course = await prisma.course.findUnique({
    where: { id: COURSE_CLAUDE_ID },
    include: { sections: { include: { lessons: true } } },
  });
  if (!course) {
    console.error("Curso Claude no encontrado");
    return;
  }

  // Enriquecemos las secciones con lecciones reales en vez de sólo metadata a nivel sección
  // 1. Minijuego Ahorcado en Sección 1
  const sec1 = course.sections.find((s) => s.order === 1);
  if (sec1) {
    const maxOrder = Math.max(...sec1.lessons.map((l) => l.order), 0);
    
    // Verificamos si ya existe el minijuego de lección para no duplicar
    const hasMg = sec1.lessons.some((l) => l.type === "section_minigame");
    if (!hasMg) {
      const minigameContent = {
        type: "hangman",
        instruction: "Completa el reto de Ahorcado sobre Claude e IA",
        words: [
          { word: "CLAUDE", hint: "Modelo de lenguaje avanzado de Anthropic ideal para desarrollo." },
          { word: "CURSOR", hint: "Editor de código inteligente que utiliza modelos de IA de forma nativa." },
          { word: "PROMPT", hint: "Instrucción de texto que le das a una IA para obtener una respuesta." }
        ]
      };

      await prisma.lesson.create({
        data: {
          sectionId: sec1.id,
          title: "Reto Ahorcado: Conceptos de IA y Claude",
          type: "section_minigame",
          order: maxOrder + 1,
          content: JSON.stringify(minigameContent)
        }
      });
      console.log("Minijuego de Ahorcado como lección insertado en la Sección 1.");
    }
  }

  // 2. Minijuego Memoria en Sección 2
  const sec2 = course.sections.find((s) => s.order === 2);
  if (sec2) {
    const maxOrder = Math.max(...sec2.lessons.map((l) => l.order), 0);
    
    const hasMg = sec2.lessons.some((l) => l.type === "section_minigame");
    if (!hasMg) {
      const minigameContent = {
        type: "memory",
        instruction: "Resuelve el juego de memoria de tecnologías No-Code",
        pairs: [
          { term: "v0", definition: "Generador de UI con React y Tailwind CSS de Vercel" },
          { term: "MVP", definition: "Producto Mínimo Viable para probar valor inicial" },
          { term: "Stripe", definition: "Pasarela de pagos en línea para cobrar suscripciones" },
          { term: "Make", definition: "Plataforma de automatización de flujos con APIs visuales" }
        ]
      };

      await prisma.lesson.create({
        data: {
          sectionId: sec2.id,
          title: "Juego de Memoria: Conceptos de Desarrollo No-Code",
          type: "section_minigame",
          order: maxOrder + 1,
          content: JSON.stringify(minigameContent)
        }
      });
      console.log("Minijuego de Memoria como lección insertado en la Sección 2.");
    }
  }
}

async function main() {
  await populateCourseC();
  await populateCourseWeb();
  await populateCourseClaude();
  console.log("\n==============================================");
  console.log("🎉 ¡Todos los 3 cursos han sido enriquecidos con Exámenes Finales, Quizzes, Tareas y Minijuegos visibles!");
}

main()
  .catch((e) => {
    console.error("Error general:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
