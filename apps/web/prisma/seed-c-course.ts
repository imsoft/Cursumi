/**
 * Seed: Curso "Inicios en la Programación con Lenguaje C"
 *
 * Crea el curso completo con 10 secciones y 50 lecciones de video
 * para el instructor brangarciaramos@gmail.com.
 *
 * Uso:
 *   npx tsx prisma/seed-c-course.ts
 */

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { readFileSync } from "fs";

// ── Carga de variables de entorno ─────────────────────────────────────────────

if (!process.env.DATABASE_URL) {
  try {
    const env = readFileSync(".env", "utf-8");
    for (const line of env.split("\n")) {
      const eqIdx = line.indexOf("=");
      if (eqIdx === -1) continue;
      const key = line.slice(0, eqIdx).trim();
      const val = line.slice(eqIdx + 1).trim();
      // Strip surrounding quotes (single or double)
      const unquoted = val.replace(/^['"]|['"]$/g, "");
      if (key && !process.env[key]) process.env[key] = unquoted;
    }
  } catch {
    // .env not found — DATABASE_URL must be in environment
  }
}

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter } as any);

// ── Helpers ───────────────────────────────────────────────────────────────────

function toSlugPart(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

type LessonInput = {
  title: string;
  description: string;
  duration: string;
};

type SectionInput = {
  title: string;
  description: string;
  lessons: LessonInput[];
};

// ── Contenido del curso ───────────────────────────────────────────────────────

const INSTRUCTOR_EMAIL = "brangarciaramos@gmail.com";

const COURSE = {
  title: "Inicios en la Programación con Lenguaje C",
  description:
    "Aprende los fundamentos de la programación desde cero utilizando el lenguaje C. " +
    "Este curso te llevará paso a paso desde tu primer 'Hola Mundo' hasta conceptos como " +
    "funciones, arreglos, punteros y estructuras. Cada sección incluye prácticas guiadas " +
    "para que refuerces lo aprendido con ejercicios reales. No necesitas experiencia previa " +
    "en programación — solo ganas de aprender.",
  category: "Programación",
  level: "principiante",
  duration: "10 horas",
};

const SECTIONS: SectionInput[] = [
  // ── Sección 1 ──────────────────────────────────────────────────────────────
  {
    title: "Introducción a la Programación y al Lenguaje C",
    description:
      "Contexto general: qué es programar, por qué C, y cómo preparar tu entorno de desarrollo.",
    lessons: [
      {
        title: "¿Qué es la programación y por qué aprender a programar?",
        description:
          "Descubre qué significa programar, cómo las computadoras ejecutan instrucciones y por qué es una habilidad valiosa en cualquier carrera profesional.",
        duration: "8 min",
      },
      {
        title: "Historia y relevancia del lenguaje C",
        description:
          "Conoce los orígenes de C, su influencia en lenguajes modernos como C++, Java y Python, y por qué sigue siendo fundamental hoy en día.",
        duration: "10 min",
      },
      {
        title: "Instalación del entorno de desarrollo (GCC + VS Code)",
        description:
          "Instala paso a paso el compilador GCC y configura Visual Studio Code como tu editor de código para programar en C.",
        duration: "15 min",
      },
      {
        title: 'Tu primer programa: "Hola Mundo" en C',
        description:
          "Escribe, comprende y ejecuta tu primer programa en C. Analizamos línea por línea la estructura básica de un programa.",
        duration: "12 min",
      },
      {
        title: "Cómo compilar y ejecutar programas en C",
        description:
          "Aprende el flujo completo: código fuente → compilación → ejecutable. Entiende los errores de compilación más comunes y cómo solucionarlos.",
        duration: "10 min",
      },
    ],
  },

  // ── Sección 2 ──────────────────────────────────────────────────────────────
  {
    title: "Variables y Tipos de Datos",
    description:
      "Aprende a almacenar y manejar información en tus programas usando variables y los tipos de datos fundamentales de C.",
    lessons: [
      {
        title: "¿Qué son las variables? Declaración e inicialización",
        description:
          "Entiende el concepto de variable como espacio en memoria, cómo declararlas, inicializarlas y las reglas para nombrarlas.",
        duration: "12 min",
      },
      {
        title: "Tipos de datos básicos: int, float, double, char",
        description:
          "Explora los tipos de datos primitivos de C, su tamaño en memoria, rangos de valores y cuándo usar cada uno.",
        duration: "15 min",
      },
      {
        title: "Constantes y la directiva #define",
        description:
          "Aprende a declarar valores que no cambian usando const y #define. Comprende la diferencia entre ambas formas.",
        duration: "8 min",
      },
      {
        title: "Entrada y salida con scanf() y printf()",
        description:
          "Domina las funciones de entrada/salida estándar de C. Aprende los especificadores de formato (%d, %f, %c, %s) y cómo leer datos del usuario.",
        duration: "15 min",
      },
      {
        title: "Práctica: Calculadora de área de figuras geométricas",
        description:
          "Pon en práctica todo lo aprendido creando un programa que calcule el área de un círculo, rectángulo y triángulo usando variables y funciones de E/S.",
        duration: "12 min",
      },
    ],
  },

  // ── Sección 3 ──────────────────────────────────────────────────────────────
  {
    title: "Operadores y Expresiones",
    description:
      "Domina las operaciones fundamentales que puedes realizar con datos: aritméticas, lógicas y de comparación.",
    lessons: [
      {
        title: "Operadores aritméticos (+, -, *, /, %)",
        description:
          "Aprende a realizar operaciones matemáticas básicas en C, incluyendo la división entera y el operador módulo.",
        duration: "10 min",
      },
      {
        title: "Operadores de asignación y operadores compuestos",
        description:
          "Conoce los operadores =, +=, -=, *=, /= y %= para modificar valores de variables de forma eficiente. Incluye incremento (++) y decremento (--).",
        duration: "8 min",
      },
      {
        title: "Operadores de comparación y lógicos",
        description:
          "Aprende a comparar valores con ==, !=, <, >, <=, >= y a combinar condiciones con && (AND), || (OR) y ! (NOT).",
        duration: "12 min",
      },
      {
        title: "Precedencia de operadores y paréntesis",
        description:
          "Entiende el orden en que C evalúa las expresiones y cómo usar paréntesis para controlar la evaluación.",
        duration: "10 min",
      },
      {
        title: "Práctica: Conversor de temperaturas y monedas",
        description:
          "Crea un programa interactivo que convierta entre Celsius y Fahrenheit, y entre pesos mexicanos y dólares usando operadores.",
        duration: "12 min",
      },
    ],
  },

  // ── Sección 4 ──────────────────────────────────────────────────────────────
  {
    title: "Estructuras de Control — Condicionales",
    description:
      "Toma decisiones dentro de tus programas usando sentencias condicionales.",
    lessons: [
      {
        title: "La sentencia if y if-else",
        description:
          "Aprende a ejecutar código condicionalmente. Entiende la evaluación de expresiones booleanas y el flujo de ejecución con if-else.",
        duration: "12 min",
      },
      {
        title: "Sentencias if-else if-else anidadas",
        description:
          "Maneja múltiples condiciones encadenadas para tomar decisiones complejas. Aprende buenas prácticas para evitar código difícil de leer.",
        duration: "10 min",
      },
      {
        title: "El operador ternario (? :)",
        description:
          "Conoce la forma abreviada de if-else para asignaciones simples y cuándo es apropiado usarla.",
        duration: "8 min",
      },
      {
        title: "La sentencia switch-case",
        description:
          "Simplifica la selección múltiple con switch. Aprende sobre el uso de break, default y las diferencias con if-else if.",
        duration: "12 min",
      },
      {
        title: "Práctica: Sistema de calificaciones escolares",
        description:
          "Construye un programa que lea la calificación de un alumno y determine su letra (A-F), si aprobó o reprobó, y muestre un mensaje personalizado.",
        duration: "15 min",
      },
    ],
  },

  // ── Sección 5 ──────────────────────────────────────────────────────────────
  {
    title: "Estructuras de Control — Ciclos (Loops)",
    description:
      "Repite acciones de forma eficiente usando ciclos while, do-while y for.",
    lessons: [
      {
        title: "El ciclo while",
        description:
          "Aprende a repetir un bloque de código mientras se cumpla una condición. Entiende los riesgos de los ciclos infinitos.",
        duration: "12 min",
      },
      {
        title: "El ciclo do-while",
        description:
          "Conoce la variante que garantiza al menos una ejecución. Ideal para validación de entrada del usuario.",
        duration: "10 min",
      },
      {
        title: "El ciclo for",
        description:
          "Domina el ciclo más usado en C: inicialización, condición e incremento en una sola línea. Compara con while para elegir el adecuado.",
        duration: "12 min",
      },
      {
        title: "Break, continue y ciclos anidados",
        description:
          "Controla el flujo dentro de los ciclos con break y continue. Aprende a usar ciclos dentro de otros ciclos para patrones complejos.",
        duration: "12 min",
      },
      {
        title: "Práctica: Tabla de multiplicar y patrones con asteriscos",
        description:
          "Genera tablas de multiplicar dinámicas y dibuja figuras geométricas (triángulos, cuadrados) usando asteriscos y ciclos anidados.",
        duration: "15 min",
      },
    ],
  },

  // ── Sección 6 ──────────────────────────────────────────────────────────────
  {
    title: "Funciones",
    description:
      "Organiza tu código en bloques reutilizables usando funciones.",
    lessons: [
      {
        title: "¿Qué son las funciones? Definición y llamada",
        description:
          "Comprende la importancia de dividir tu programa en funciones. Aprende la sintaxis de definición, llamada y la función main().",
        duration: "12 min",
      },
      {
        title: "Parámetros y valores de retorno",
        description:
          "Aprende a pasar datos a funciones mediante parámetros y a recibir resultados con return. Entiende la diferencia entre parámetros y argumentos.",
        duration: "12 min",
      },
      {
        title: "Prototipos de funciones y scope de variables",
        description:
          "Declara funciones antes de usarlas con prototipos. Entiende variables locales, globales y el tiempo de vida de cada una.",
        duration: "10 min",
      },
      {
        title: "Funciones void y recursividad básica",
        description:
          "Crea funciones que no retornan valor (void) y descubre la recursividad con ejemplos clásicos: factorial y Fibonacci.",
        duration: "15 min",
      },
      {
        title: "Práctica: Biblioteca de funciones matemáticas",
        description:
          "Construye tu propia biblioteca de funciones: potencia, valor absoluto, máximo, mínimo y número primo. Organiza tu código en archivos separados.",
        duration: "12 min",
      },
    ],
  },

  // ── Sección 7 ──────────────────────────────────────────────────────────────
  {
    title: "Arreglos (Arrays)",
    description:
      "Maneja colecciones de datos del mismo tipo con arreglos unidimensionales y multidimensionales.",
    lessons: [
      {
        title: "Declaración e inicialización de arreglos",
        description:
          "Aprende a crear arreglos, asignar valores y acceder a elementos por índice. Entiende los límites y el desbordamiento de arreglos.",
        duration: "12 min",
      },
      {
        title: "Recorrer arreglos con ciclos",
        description:
          "Usa ciclos for y while para procesar todos los elementos de un arreglo: suma, promedio, búsqueda del mayor y menor.",
        duration: "10 min",
      },
      {
        title: "Arreglos multidimensionales (matrices)",
        description:
          "Crea y manipula matrices (arreglos 2D). Aprende a recorrerlas con ciclos anidados y sus aplicaciones prácticas.",
        duration: "12 min",
      },
      {
        title: "Ordenamiento básico: Bubble Sort",
        description:
          "Implementa tu primer algoritmo de ordenamiento. Comprende cómo funciona Bubble Sort paso a paso y analiza su eficiencia.",
        duration: "15 min",
      },
      {
        title: "Práctica: Sistema de registro de calificaciones",
        description:
          "Crea un programa que registre las calificaciones de N alumnos, calcule promedios, encuentre la nota más alta y más baja, y ordene los resultados.",
        duration: "15 min",
      },
    ],
  },

  // ── Sección 8 ──────────────────────────────────────────────────────────────
  {
    title: "Cadenas de Caracteres (Strings)",
    description:
      "Trabaja con texto en C entendiendo cómo funciona la representación interna de cadenas.",
    lessons: [
      {
        title: "Cadenas como arreglos de caracteres",
        description:
          "Entiende que en C las cadenas son arreglos de char terminados en '\\0'. Aprende a declararlas, inicializarlas y sus limitaciones.",
        duration: "10 min",
      },
      {
        title: "Funciones de la biblioteca string.h",
        description:
          "Domina las funciones esenciales: strlen(), strcpy(), strcat(), strcmp() y strstr(). Entiende por qué existen y cómo usarlas de forma segura.",
        duration: "12 min",
      },
      {
        title: "Lectura de cadenas con fgets() y gets()",
        description:
          "Aprende la forma correcta y segura de leer texto del usuario. Por qué fgets() es preferible a gets() y cómo manejar el salto de línea.",
        duration: "10 min",
      },
      {
        title: "Manipulación de cadenas: búsqueda, comparación, concatenación",
        description:
          "Implementa operaciones comunes con cadenas de forma manual y con funciones de biblioteca. Convierte entre mayúsculas y minúsculas.",
        duration: "12 min",
      },
      {
        title: "Práctica: Analizador de texto (contador de palabras y vocales)",
        description:
          "Construye un programa que analice un texto ingresado: cuente palabras, vocales, consonantes, y determine la palabra más larga.",
        duration: "15 min",
      },
    ],
  },

  // ── Sección 9 ──────────────────────────────────────────────────────────────
  {
    title: "Punteros — Introducción",
    description:
      "Entiende la base de la gestión de memoria en C con punteros.",
    lessons: [
      {
        title: "¿Qué son los punteros? Concepto y sintaxis",
        description:
          "Comprende qué es una dirección de memoria, cómo declarar punteros y por qué son una de las características más poderosas (y temidas) de C.",
        duration: "15 min",
      },
      {
        title: "Operadores de dirección (&) e indirección (*)",
        description:
          "Practica con los operadores fundamentales de punteros. Visualiza la memoria para entender cómo los punteros apuntan a variables.",
        duration: "12 min",
      },
      {
        title: "Punteros y arreglos: la relación fundamental",
        description:
          "Descubre por qué el nombre de un arreglo es en realidad un puntero. Aprende aritmética de punteros para recorrer arreglos.",
        duration: "12 min",
      },
      {
        title: "Paso por referencia vs paso por valor",
        description:
          "Entiende la diferencia entre pasar una copia del dato y pasar su dirección. Cómo las funciones pueden modificar variables externas usando punteros.",
        duration: "12 min",
      },
      {
        title: "Práctica: Función swap() y manipulación de arreglos con punteros",
        description:
          "Implementa la función clásica swap() para intercambiar valores, y recorre arreglos usando punteros en lugar de índices.",
        duration: "15 min",
      },
    ],
  },

  // ── Sección 10 ─────────────────────────────────────────────────────────────
  {
    title: "Estructuras (structs) y Proyecto Final",
    description:
      "Crea tipos de datos complejos con structs y aplica todo lo aprendido en un proyecto integrador.",
    lessons: [
      {
        title: "Definición y uso de structs",
        description:
          "Aprende a crear tus propios tipos de datos agrupando variables relacionadas. Declara, inicializa y accede a los miembros de un struct.",
        duration: "12 min",
      },
      {
        title: "Arreglos de structs",
        description:
          "Combina arreglos con structs para manejar colecciones de registros complejos, como una lista de estudiantes o productos.",
        duration: "10 min",
      },
      {
        title: "Structs y funciones",
        description:
          "Pasa structs como parámetros a funciones, retórnalos y combínalos con punteros para manipular datos de forma eficiente.",
        duration: "10 min",
      },
      {
        title: "Proyecto final: Sistema de gestión de contactos",
        description:
          "Construye paso a paso un programa completo que permita agregar, buscar, listar, editar y eliminar contactos usando structs, arreglos y funciones.",
        duration: "20 min",
      },
      {
        title: "Siguientes pasos en tu camino como programador",
        description:
          "Resumen del curso, recursos recomendados, y una hoja de ruta para seguir aprendiendo: archivos, memoria dinámica, C++ y más.",
        duration: "8 min",
      },
    ],
  },
];

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🔍 Buscando instructor por email:", INSTRUCTOR_EMAIL);

  const instructor = await prisma.user.findUnique({
    where: { email: INSTRUCTOR_EMAIL },
    select: { id: true, name: true, role: true },
  });

  if (!instructor) {
    console.error(`❌ No se encontró un usuario con email: ${INSTRUCTOR_EMAIL}`);
    console.error("   Asegúrate de que la cuenta existe en la base de datos.");
    process.exit(1);
  }

  if (instructor.role !== "instructor" && instructor.role !== "admin") {
    console.error(`❌ El usuario ${INSTRUCTOR_EMAIL} tiene rol "${instructor.role}". Necesita ser "instructor" o "admin".`);
    process.exit(1);
  }

  console.log(`✅ Instructor encontrado: ${instructor.name} (${instructor.id})`);

  // Buscar categoría "Programación"
  const category = await prisma.category.findFirst({
    where: { slug: "programacion" },
    select: { id: true, name: true },
  });

  console.log(category ? `✅ Categoría encontrada: ${category.name}` : "⚠️ Categoría 'Programación' no encontrada, se usará solo el string");

  // Generar slug
  const slug = `${toSlugPart(COURSE.title)}-por-${toSlugPart(instructor.name || "instructor")}`;

  // Verificar si ya existe un curso con este slug
  const existing = await prisma.course.findFirst({
    where: { slug },
    select: { id: true },
  });

  if (existing) {
    console.error(`❌ Ya existe un curso con slug "${slug}" (id: ${existing.id})`);
    console.error("   Elimínalo primero o cambia el título del curso.");
    process.exit(1);
  }

  console.log(`📝 Creando curso: "${COURSE.title}"`);
  console.log(`   Slug: ${slug}`);
  console.log(`   Secciones: ${SECTIONS.length}`);
  console.log(`   Lecciones totales: ${SECTIONS.reduce((acc, s) => acc + s.lessons.length, 0)}`);

  const course = await prisma.course.create({
    data: {
      instructorId: instructor.id,
      slug,
      title: COURSE.title,
      description: COURSE.description,
      category: COURSE.category,
      categoryId: category?.id ?? null,
      level: COURSE.level,
      modality: "virtual",
      courseType: "ondemand",
      duration: COURSE.duration,
      price: 0,
      isFree: true,
      status: "draft",
      sections: {
        create: SECTIONS.map((section, sectionIndex) => ({
          title: section.title,
          description: section.description,
          order: sectionIndex + 1,
          lessons: {
            create: section.lessons.map((lesson, lessonIndex) => ({
              title: lesson.title,
              description: lesson.description,
              type: "video" as const,
              duration: lesson.duration,
              order: lessonIndex + 1,
              videoUrl: null,
              content: null,
            })),
          },
        })),
      },
    },
    include: {
      sections: {
        include: { lessons: true },
        orderBy: { order: "asc" },
      },
    },
  });

  console.log("\n🎉 ¡Curso creado exitosamente!\n");
  console.log(`   ID: ${course.id}`);
  console.log(`   Slug: ${course.slug}`);
  console.log(`   Estado: ${course.status}`);
  console.log(`   Precio: Gratuito`);
  console.log("");

  for (const section of course.sections) {
    console.log(`   📂 Sección ${section.order}: ${section.title} (${section.lessons.length} lecciones)`);
    for (const lesson of section.lessons) {
      const videoStatus = lesson.videoUrl ? "✅" : "⏳";
      console.log(`      ${videoStatus} ${lesson.order}. ${lesson.title} — ${lesson.duration}`);
    }
  }

  console.log("\n📋 Próximos pasos:");
  console.log("   1. Ingresa al dashboard de instructor en Cursumi");
  console.log("   2. Edita cada lección para subir el video correspondiente");
  console.log("   3. Cuando todos los videos estén listos, publica el curso");
}

main()
  .catch((e) => {
    console.error("Error al crear el curso:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
