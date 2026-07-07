/**
 * Seed: Curso "Desarrollo Web desde Cero: HTML, CSS y JavaScript"
 *
 * Crea el curso completo con 12 secciones y 60 lecciones de video
 * para el instructor brangarciaramos@gmail.com.
 *
 * Uso:
 *   npx tsx prisma/seed-web-course.ts
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
  title: "Desarrollo Web desde Cero: HTML, CSS y JavaScript",
  description:
    "Aprende a crear sitios web profesionales desde cero dominando las tres tecnologías " +
    "fundamentales de la web: HTML para la estructura, CSS para el diseño y JavaScript " +
    "para la interactividad. Este curso te lleva paso a paso desde tu primera página web " +
    "hasta un proyecto final completo desplegado en internet. Incluye Flexbox, CSS Grid, " +
    "diseño responsivo, manipulación del DOM, consumo de APIs y despliegue con GitHub Pages " +
    "y Vercel. No necesitas experiencia previa — solo ganas de construir para la web.",
  category: "Programación",
  level: "principiante",
  duration: "15 horas",
  price: 49900, // $499 MXN en centavos
};

const SECTIONS: SectionInput[] = [
  // ── Sección 1 ──────────────────────────────────────────────────────────────
  {
    title: "Introducción al Desarrollo Web",
    description:
      "Entiende cómo funciona la web y prepara tu entorno de trabajo para empezar a construir sitios.",
    lessons: [
      {
        title: "¿Qué es el desarrollo web? Frontend, Backend y Fullstack",
        description:
          "Descubre las diferentes áreas del desarrollo web, qué hace cada una y cuál es el camino que seguiremos en este curso.",
        duration: "10 min",
      },
      {
        title: "Cómo funciona internet: navegadores, servidores y HTTP",
        description:
          "Entiende qué sucede cuando escribes una URL en el navegador: DNS, peticiones HTTP, respuestas del servidor y renderizado de la página.",
        duration: "12 min",
      },
      {
        title: "Las tres tecnologías de la web: HTML, CSS y JavaScript",
        description:
          "Conoce el rol de cada tecnología: HTML como esqueleto, CSS como piel y JavaScript como cerebro de una página web.",
        duration: "8 min",
      },
      {
        title: "Instalación y configuración de VS Code para web",
        description:
          "Instala Visual Studio Code y configura las extensiones esenciales: Live Server, Prettier, Emmet y más para un flujo de trabajo profesional.",
        duration: "12 min",
      },
      {
        title: "Tu primera página web en 5 minutos",
        description:
          "Crea tu primer archivo HTML, ábrelo en el navegador con Live Server y experimenta el ciclo de desarrollo web en tiempo real.",
        duration: "10 min",
      },
    ],
  },

  // ── Sección 2 ──────────────────────────────────────────────────────────────
  {
    title: "HTML — Fundamentos",
    description:
      "Aprende a construir la estructura de cualquier página web con las etiquetas HTML esenciales.",
    lessons: [
      {
        title: "Anatomía de un documento HTML: DOCTYPE, head y body",
        description:
          "Comprende la estructura obligatoria de todo documento HTML. Aprende qué va en el head (metadatos, título) y qué va en el body (contenido visible).",
        duration: "12 min",
      },
      {
        title: "Etiquetas de texto: h1-h6, p, span, strong, em",
        description:
          "Domina las etiquetas para estructurar texto: encabezados jerárquicos, párrafos, texto en línea, negritas y cursivas semánticas.",
        duration: "10 min",
      },
      {
        title: "Listas ordenadas, desordenadas y de definición",
        description:
          "Crea listas con ul, ol y dl. Aprende cuándo usar cada tipo y cómo anidar listas para menús y contenido organizado.",
        duration: "8 min",
      },
      {
        title: "Enlaces con <a> y navegación entre páginas",
        description:
          "Conecta páginas con hipervínculos. Aprende sobre rutas relativas y absolutas, target _blank, anclas internas y enlaces a email/teléfono.",
        duration: "10 min",
      },
      {
        title: "Imágenes, audio y video en HTML",
        description:
          "Inserta contenido multimedia con img, audio y video. Comprende los atributos alt, src, width, controls y formatos compatibles.",
        duration: "12 min",
      },
    ],
  },

  // ── Sección 3 ──────────────────────────────────────────────────────────────
  {
    title: "HTML — Semántica y Formularios",
    description:
      "Escribe HTML profesional con etiquetas semánticas y crea formularios funcionales para capturar datos.",
    lessons: [
      {
        title: "HTML semántico: header, nav, main, section, article, footer",
        description:
          "Mejora la accesibilidad y SEO de tus páginas usando etiquetas semánticas en lugar de divs genéricos. Entiende el significado de cada una.",
        duration: "12 min",
      },
      {
        title: "Tablas en HTML: thead, tbody, tfoot",
        description:
          "Crea tablas de datos bien estructuradas con encabezados, cuerpo y pie. Aprende colspan, rowspan y cuándo usar tablas (y cuándo no).",
        duration: "10 min",
      },
      {
        title: "Formularios: input, textarea, select y label",
        description:
          "Construye formularios completos: campos de texto, áreas de texto, menús desplegables, checkboxes y radio buttons con labels accesibles.",
        duration: "15 min",
      },
      {
        title: "Tipos de input modernos: email, date, range, color",
        description:
          "Aprovecha los tipos de input de HTML5 para obtener teclados optimizados en móvil, selectores de fecha nativos y validación automática.",
        duration: "10 min",
      },
      {
        title: "Validación nativa de formularios y atributos required, pattern",
        description:
          "Valida datos sin JavaScript usando atributos HTML: required, minlength, maxlength, pattern con expresiones regulares y mensajes personalizados.",
        duration: "12 min",
      },
    ],
  },

  // ── Sección 4 ──────────────────────────────────────────────────────────────
  {
    title: "CSS — Fundamentos",
    description:
      "Dale vida y estilo a tus páginas web dominando los conceptos base de CSS.",
    lessons: [
      {
        title: "¿Qué es CSS? Formas de agregar estilos (inline, internal, external)",
        description:
          "Comprende las tres formas de aplicar CSS y por qué las hojas de estilo externas son la mejor práctica profesional.",
        duration: "10 min",
      },
      {
        title: "Selectores CSS: etiqueta, clase, ID y combinadores",
        description:
          "Domina los selectores fundamentales para apuntar a elementos específicos. Aprende especificidad, cascada y la regla !important.",
        duration: "15 min",
      },
      {
        title: "Modelo de caja: margin, padding, border y box-sizing",
        description:
          "Entiende el box model, la base de todo layout en CSS. Aprende la diferencia entre content-box y border-box y por qué border-box es estándar.",
        duration: "15 min",
      },
      {
        title: "Colores, fondos y gradientes",
        description:
          "Aplica colores con nombres, hex, rgb, hsl y la función opacity. Crea fondos sólidos, con imagen y gradientes lineales/radiales.",
        duration: "12 min",
      },
      {
        title: "Tipografía web: fuentes, tamaños, Google Fonts",
        description:
          "Configura tipografía profesional: font-family, font-size, line-height, font-weight. Integra Google Fonts en tus proyectos.",
        duration: "12 min",
      },
    ],
  },

  // ── Sección 5 ──────────────────────────────────────────────────────────────
  {
    title: "CSS — Layouts con Flexbox",
    description:
      "Domina el sistema de layout más utilizado en la web moderna para organizar elementos.",
    lessons: [
      {
        title: "Introducción a Flexbox: contenedor y elementos flex",
        description:
          "Entiende el concepto de flex container y flex items. Activa Flexbox con display: flex y observa cómo cambia el comportamiento de los elementos.",
        duration: "12 min",
      },
      {
        title: "Dirección, wrap y alineación con justify-content",
        description:
          "Controla la dirección del flujo con flex-direction, permite el salto de línea con flex-wrap y distribuye el espacio con justify-content.",
        duration: "12 min",
      },
      {
        title: "Alineación cruzada: align-items y align-self",
        description:
          "Alinea elementos en el eje cruzado. Centra vertical y horizontalmente con la combinación perfecta de justify-content y align-items.",
        duration: "10 min",
      },
      {
        title: "Flex-grow, flex-shrink y flex-basis",
        description:
          "Controla cómo los elementos crecen y se encogen dentro del contenedor. Domina el shorthand flex para layouts proporcionales.",
        duration: "12 min",
      },
      {
        title: "Práctica: Navbar y tarjetas de producto con Flexbox",
        description:
          "Construye una barra de navegación responsiva y un grid de tarjetas de producto estilo e-commerce usando solo Flexbox.",
        duration: "15 min",
      },
    ],
  },

  // ── Sección 6 ──────────────────────────────────────────────────────────────
  {
    title: "CSS — Grid y Diseño Responsivo",
    description:
      "Crea layouts complejos con CSS Grid y páginas que se adaptan a cualquier tamaño de pantalla.",
    lessons: [
      {
        title: "Introducción a CSS Grid: filas, columnas y áreas",
        description:
          "Activa Grid con display: grid. Define filas y columnas explícitas. Nombra áreas del grid para layouts legibles y mantenibles.",
        duration: "15 min",
      },
      {
        title: "Grid template, gap y fr units",
        description:
          "Usa grid-template-columns/rows con la unidad fr para distribución flexible. Agrega espaciado con gap y crea layouts complejos con pocas líneas.",
        duration: "12 min",
      },
      {
        title: "Media queries: diseño responsivo mobile-first",
        description:
          "Adapta tu diseño a diferentes pantallas con @media. Aprende el enfoque mobile-first: diseña para móvil y escala hacia escritorio.",
        duration: "15 min",
      },
      {
        title: "Unidades relativas: rem, em, vw, vh, %",
        description:
          "Deja de usar solo pixeles. Aprende cuándo usar cada unidad relativa para tipografía fluida y layouts que escalan correctamente.",
        duration: "10 min",
      },
      {
        title: "Práctica: Landing page responsiva con Grid y Flexbox",
        description:
          "Construye una landing page profesional completa que se vea perfecta en móvil, tablet y escritorio combinando Grid y Flexbox.",
        duration: "18 min",
      },
    ],
  },

  // ── Sección 7 ──────────────────────────────────────────────────────────────
  {
    title: "CSS — Animaciones y Efectos",
    description:
      "Agrega interactividad visual y micro-animaciones para crear sitios web con sensación premium.",
    lessons: [
      {
        title: "Transiciones CSS: hover effects suaves",
        description:
          "Anima cambios de propiedades con transition. Crea efectos hover suaves en botones, enlaces y tarjetas. Configura duración, delay y easing.",
        duration: "10 min",
      },
      {
        title: "Transformaciones: translate, rotate, scale",
        description:
          "Mueve, rota y escala elementos con transform sin afectar el flujo del documento. Combina transformaciones para efectos creativos.",
        duration: "10 min",
      },
      {
        title: "Animaciones con @keyframes",
        description:
          "Crea animaciones complejas definiendo estados intermedios con @keyframes. Controla repetición, dirección y fill-mode.",
        duration: "12 min",
      },
      {
        title: "Variables CSS (custom properties)",
        description:
          "Define valores reutilizables con --custom-properties. Crea temas de color, modo oscuro y diseños mantenibles con variables CSS nativas.",
        duration: "10 min",
      },
      {
        title: "Práctica: Galería de portafolio con efectos hover",
        description:
          "Construye una galería de proyectos con overlays animados, efectos de zoom y transiciones suaves al pasar el mouse.",
        duration: "15 min",
      },
    ],
  },

  // ── Sección 8 ──────────────────────────────────────────────────────────────
  {
    title: "JavaScript — Fundamentos",
    description:
      "Aprende la lógica de programación con el lenguaje que hace interactivas las páginas web.",
    lessons: [
      {
        title: "¿Qué es JavaScript? La consola del navegador",
        description:
          "Conoce JavaScript, su historia y dónde se ejecuta. Usa la consola del navegador como tu primer laboratorio de código.",
        duration: "10 min",
      },
      {
        title: "Variables: var, let y const. Tipos de datos",
        description:
          "Declara variables con let y const (y por qué evitar var). Conoce los tipos: string, number, boolean, null, undefined y typeof.",
        duration: "15 min",
      },
      {
        title: "Operadores aritméticos, de comparación y lógicos",
        description:
          "Realiza cálculos, compara valores con == vs === y combina condiciones con && y ||. Entiende la coerción de tipos en JavaScript.",
        duration: "12 min",
      },
      {
        title: "Condicionales: if, else, switch y operador ternario",
        description:
          "Toma decisiones en tu código. Aprende if-else, switch para múltiples opciones y el operador ternario para asignaciones condicionales.",
        duration: "12 min",
      },
      {
        title: "Ciclos: for, while y métodos de iteración",
        description:
          "Repite tareas con for y while. Conoce for...of para recorrer arrays y cuándo usar cada tipo de ciclo.",
        duration: "12 min",
      },
    ],
  },

  // ── Sección 9 ──────────────────────────────────────────────────────────────
  {
    title: "JavaScript — Funciones y Estructuras de Datos",
    description:
      "Organiza tu código con funciones y maneja datos complejos con arrays y objetos.",
    lessons: [
      {
        title: "Funciones: declaración, expresión y arrow functions",
        description:
          "Crea funciones de tres formas distintas. Entiende parámetros, return, scope y por qué las arrow functions son el estándar moderno.",
        duration: "15 min",
      },
      {
        title: "Arrays: métodos esenciales (push, pop, map, filter, find)",
        description:
          "Domina los arrays de JavaScript. Aprende a agregar, eliminar, transformar y buscar elementos con los métodos más usados del día a día.",
        duration: "15 min",
      },
      {
        title: "Objetos: propiedades, métodos y desestructuración",
        description:
          "Crea objetos con propiedades y métodos. Accede a datos con dot notation y bracket notation. Simplifica con destructuring.",
        duration: "15 min",
      },
      {
        title: "Template literals y métodos de strings",
        description:
          "Construye strings dinámicos con backticks y ${expresiones}. Aprende métodos útiles: includes, split, trim, replace, toUpperCase.",
        duration: "10 min",
      },
      {
        title: "Práctica: Lista de tareas en consola (lógica pura)",
        description:
          "Construye la lógica completa de un To-Do List: agregar, listar, completar y eliminar tareas usando arrays y objetos sin tocar el DOM.",
        duration: "12 min",
      },
    ],
  },

  // ── Sección 10 ─────────────────────────────────────────────────────────────
  {
    title: "JavaScript — El DOM",
    description:
      "Conecta JavaScript con tu HTML para crear páginas web verdaderamente interactivas.",
    lessons: [
      {
        title: "¿Qué es el DOM? Seleccionar elementos con querySelector",
        description:
          "Entiende el Document Object Model como un árbol de nodos. Selecciona elementos con querySelector y querySelectorAll usando selectores CSS.",
        duration: "12 min",
      },
      {
        title: "Modificar contenido: textContent, innerHTML y atributos",
        description:
          "Cambia el texto, HTML interno y atributos de elementos desde JavaScript. Entiende la diferencia entre textContent e innerHTML.",
        duration: "12 min",
      },
      {
        title: "Crear y eliminar elementos dinámicamente",
        description:
          "Genera HTML desde JavaScript con createElement, appendChild e insertBefore. Elimina elementos con remove() para interfaces dinámicas.",
        duration: "12 min",
      },
      {
        title: "Eventos: click, submit, input y addEventListener",
        description:
          "Responde a las acciones del usuario con event listeners. Maneja clicks, envíos de formularios, escritura en inputs y el objeto event.",
        duration: "15 min",
      },
      {
        title: "Práctica: Calculadora interactiva completa",
        description:
          "Construye una calculadora funcional con interfaz visual: botones numéricos, operaciones, display y manejo de estados con el DOM.",
        duration: "18 min",
      },
    ],
  },

  // ── Sección 11 ─────────────────────────────────────────────────────────────
  {
    title: "JavaScript — APIs y Almacenamiento",
    description:
      "Conecta tu web con datos externos y guarda información del usuario en el navegador.",
    lessons: [
      {
        title: "Fetch API: consumir datos de una API REST",
        description:
          "Realiza peticiones HTTP desde JavaScript con fetch(). Obtiene datos JSON de APIs públicas y muéstralos en tu página web.",
        duration: "15 min",
      },
      {
        title: "Promesas y async/await explicado fácil",
        description:
          "Entiende la programación asíncrona: por qué es necesaria, cómo funcionan las promesas y cómo simplificar todo con async/await.",
        duration: "15 min",
      },
      {
        title: "LocalStorage y SessionStorage",
        description:
          "Guarda datos en el navegador del usuario: preferencias, carrito de compras, tema oscuro. Aprende a serializar con JSON.stringify/parse.",
        duration: "12 min",
      },
      {
        title: "Manejo de errores: try/catch y validación",
        description:
          "Protege tu código contra fallos: captura errores de red, valida datos del usuario y muestra mensajes de error amigables.",
        duration: "10 min",
      },
      {
        title: "Práctica: App del clima consumiendo una API real",
        description:
          "Construye una aplicación del clima que consulte una API real, muestre temperatura, condición y un ícono dinámico según la ciudad buscada.",
        duration: "18 min",
      },
    ],
  },

  // ── Sección 12 ─────────────────────────────────────────────────────────────
  {
    title: "Proyecto Final y Despliegue",
    description:
      "Construye un sitio web completo aplicando todo lo aprendido y publícalo en internet para que el mundo lo vea.",
    lessons: [
      {
        title: "Planificación del proyecto: estructura y wireframe",
        description:
          "Planifica tu sitio web profesional: define secciones, dibuja wireframes y organiza la estructura de archivos antes de escribir código.",
        duration: "10 min",
      },
      {
        title: "Maquetación HTML del sitio completo",
        description:
          "Construye toda la estructura HTML del sitio con HTML semántico: hero, about, servicios, portafolio, testimonios, contacto y footer.",
        duration: "20 min",
      },
      {
        title: "Estilizado con CSS: diseño responsivo y animaciones",
        description:
          "Aplica estilos profesionales con CSS Grid, Flexbox, variables CSS, transiciones y animaciones. Asegura que se vea perfecto en todas las pantallas.",
        duration: "20 min",
      },
      {
        title: "Funcionalidad con JavaScript: interactividad y datos dinámicos",
        description:
          "Agrega interactividad: menú hamburguesa, scroll suave, validación de formulario, modo oscuro y carga dinámica de contenido.",
        duration: "20 min",
      },
      {
        title: "Despliegue gratuito con GitHub Pages y Vercel",
        description:
          "Sube tu proyecto a GitHub y despliégalo gratis con GitHub Pages y Vercel. Tu sitio estará en línea con una URL pública en minutos.",
        duration: "15 min",
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

  console.log(`\n📝 Creando curso: "${COURSE.title}"`);
  console.log(`   Slug: ${slug}`);
  console.log(`   Precio: $${(COURSE.price / 100).toFixed(0)} MXN`);
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
      price: COURSE.price,
      isFree: false,
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
  console.log(`   Precio: $${(COURSE.price / 100).toFixed(0)} MXN`);
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
  console.log("   3. Agrega una imagen de portada al curso");
  console.log("   4. Cuando todos los videos estén listos, publica el curso");
}

main()
  .catch((e) => {
    console.error("Error al crear el curso:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
