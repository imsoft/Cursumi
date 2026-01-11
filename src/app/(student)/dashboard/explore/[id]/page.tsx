"use client";

import { use } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, BookOpen, User, Clock, MapPin, CheckCircle2, PlayCircle, FileText, FileQuestion, Calendar, Users, Car, Bus, Mail, Phone, Navigation } from "lucide-react";
import { formatPriceMXN } from "@/lib/utils";

interface Course {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  category: string;
  modality: "virtual" | "presencial";
  instructorName: string;
  instructorBio?: string;
  price: number;
  imageUrl?: string;
  level: string;
  duration?: string;
  totalLessons?: number;
  city?: string;
  address?: string;
  startDate?: string;
  endDate?: string;
  schedule?: string; // Ej: "Lunes y Miércoles, 6:00 PM - 8:00 PM"
  totalSessions?: number;
  capacity?: number;
  enrolled?: number;
  includes?: string[]; // Qué incluye el curso
  whatToBring?: string[]; // Qué traer
  parking?: string; // Información de estacionamiento
  publicTransport?: string; // Información de transporte público
  contactEmail?: string;
  contactPhone?: string;
  sections?: CourseSection[];
}

interface CourseSection {
  id: string;
  title: string;
  description?: string;
  order: number;
  lessons: CourseLesson[];
}

interface CourseLesson {
  id: string;
  title: string;
  description?: string;
  type: "video" | "text" | "quiz" | "assignment";
  duration?: string;
  order: number;
  sectionId: string;
}

// Mock data - En producción esto vendría de una API
const getCourseDetail = (id: string): Course | null => {
  const courses: Record<string, Course> = {
    "1": {
      id: "1",
      title: "Bootcamp Full Stack",
      description: "Aprende desarrollo web completo desde cero hasta convertirte en un desarrollador full stack",
      longDescription: "Este bootcamp intensivo te llevará desde los fundamentos de HTML, CSS y JavaScript hasta el desarrollo de aplicaciones web completas con React, Node.js y bases de datos. Aprenderás las mejores prácticas de la industria, trabajarás en proyectos reales y construirás un portafolio impresionante.",
      category: "Programación",
      modality: "virtual",
      instructorName: "Carlos Méndez",
      instructorBio: "Desarrollador full stack con más de 10 años de experiencia. Ha trabajado en empresas como Google y Microsoft, y ha enseñado a más de 5,000 estudiantes.",
      price: 2500,
      level: "Intermedio",
      imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=450&fit=crop",
      duration: "12 semanas",
      totalLessons: 48,
      sections: [
        {
          id: "sec-1",
          title: "Fundamentos de desarrollo web",
          description: "Aprende las bases de HTML, CSS y JavaScript",
          order: 1,
          lessons: [
            { id: "les-1", title: "Introducción a HTML5", type: "video", duration: "30 min", order: 1, sectionId: "sec-1" },
            { id: "les-2", title: "CSS moderno y Flexbox", type: "video", duration: "45 min", order: 2, sectionId: "sec-1" },
            { id: "les-3", title: "JavaScript básico", type: "video", duration: "60 min", order: 3, sectionId: "sec-1" },
          ],
        },
        {
          id: "sec-2",
          title: "React y desarrollo frontend",
          description: "Domina React y las herramientas modernas",
          order: 2,
          lessons: [
            { id: "les-4", title: "Introducción a React", type: "video", duration: "50 min", order: 1, sectionId: "sec-2" },
            { id: "les-5", title: "Hooks y estado", type: "video", duration: "55 min", order: 2, sectionId: "sec-2" },
            { id: "les-6", title: "Routing con React Router", type: "video", duration: "40 min", order: 3, sectionId: "sec-2" },
          ],
        },
        {
          id: "sec-3",
          title: "Backend con Node.js",
          description: "Construye APIs y servidores robustos",
          order: 3,
          lessons: [
            { id: "les-7", title: "Node.js y Express", type: "video", duration: "60 min", order: 1, sectionId: "sec-3" },
            { id: "les-8", title: "Bases de datos y MongoDB", type: "video", duration: "70 min", order: 2, sectionId: "sec-3" },
            { id: "les-9", title: "Autenticación y seguridad", type: "video", duration: "65 min", order: 3, sectionId: "sec-3" },
          ],
        },
      ],
    },
    "2": {
      id: "2",
      title: "Habilidades blandas para equipos remotos",
      description: "Desarrolla habilidades de comunicación y colaboración para equipos distribuidos",
      longDescription: "Aprende a trabajar efectivamente en equipos remotos, mejorar tu comunicación asíncrona y construir relaciones sólidas con colegas distribuidos en diferentes zonas horarias.",
      category: "Habilidades blandas",
      modality: "virtual",
      instructorName: "Ana Martínez",
      instructorBio: "Especialista en gestión de equipos remotos y comunicación efectiva. Consultora para empresas Fortune 500.",
      price: 1200,
      level: "Principiante",
      imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=450&fit=crop",
      duration: "6 semanas",
      totalLessons: 24,
    },
    "3": {
      id: "3",
      title: "Presentaciones efectivas",
      description: "Domina el arte de presentar ideas de forma clara y persuasiva",
      longDescription: "Aprende técnicas probadas para crear presentaciones impactantes que conecten con tu audiencia y comuniquen tus ideas de manera efectiva.",
      category: "Marketing",
      modality: "presencial",
      instructorName: "Laura Fernández",
      instructorBio: "Experta en comunicación y presentaciones. Ha entrenado a ejecutivos de empresas líderes.",
      price: 1800,
      level: "Intermedio",
      imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=450&fit=crop",
      duration: "8 semanas",
      totalLessons: 32,
      city: "CDMX",
      address: "Av. Reforma 123, Col. Centro, Ciudad de México, CDMX 06000",
      startDate: "15 de enero, 2025",
      endDate: "5 de marzo, 2025",
      schedule: "Lunes y Miércoles, 6:00 PM - 8:00 PM",
      totalSessions: 16,
      capacity: 25,
      enrolled: 18,
      includes: [
        "Material de trabajo incluido",
        "Coffee breaks",
        "Certificado de participación",
        "Acceso a recursos digitales",
      ],
      whatToBring: [
        "Laptop o tablet (opcional)",
        "Cuaderno para notas",
        "Identificación oficial",
      ],
      parking: "Estacionamiento disponible en el edificio (costo adicional: $50 por sesión)",
      publicTransport: "Metro: Línea 2, estación Hidalgo (5 min caminando). Metrobús: Línea 1, estación Reforma (3 min caminando)",
      contactEmail: "laura.fernandez@cursumi.com",
      contactPhone: "+52 55 1234 5678",
    },
    "4": {
      id: "4",
      title: "Python para Data Science",
      description: "Aprende Python y sus librerías para análisis de datos y machine learning",
      longDescription: "Sumérgete en el mundo del análisis de datos con Python. Aprende pandas, numpy, matplotlib y scikit-learn para convertirte en un data scientist.",
      category: "Programación",
      modality: "virtual",
      instructorName: "Roberto Silva",
      instructorBio: "Data scientist con PhD en Ciencias de la Computación. Ha publicado múltiples papers en conferencias internacionales.",
      price: 2000,
      level: "Avanzado",
      imageUrl: "https://images.unsplash.com/photo-1528595077908-5f13e1f1f14a?w=800&h=450&fit=crop",
      duration: "10 semanas",
      totalLessons: 40,
    },
    "5": {
      id: "5",
      title: "Diseño de interfaces modernas",
      description: "Crea interfaces de usuario atractivas y funcionales con las últimas tendencias",
      longDescription: "Aprende los principios del diseño UI/UX moderno, herramientas como Figma y Sketch, y cómo crear interfaces que los usuarios aman.",
      category: "Diseño",
      modality: "virtual",
      instructorName: "Natalia Soto",
      instructorBio: "Diseñadora UI/UX con más de 8 años de experiencia. Ha diseñado productos para startups y empresas establecidas.",
      price: 1500,
      level: "Intermedio",
      imageUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=450&fit=crop",
      duration: "8 semanas",
      totalLessons: 30,
    },
    "6": {
      id: "6",
      title: "Estrategias de marketing digital",
      description: "Aprende a crear campañas efectivas en redes sociales y plataformas digitales",
      longDescription: "Domina las estrategias de marketing digital más efectivas, desde SEO y SEM hasta marketing en redes sociales y email marketing.",
      category: "Marketing",
      modality: "presencial",
      instructorName: "Luis Herrera",
      instructorBio: "Especialista en marketing digital con más de 12 años de experiencia. Ha ayudado a cientos de empresas a crecer en línea.",
      price: 2200,
      level: "Intermedio",
      imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop",
      duration: "10 semanas",
      totalLessons: 35,
      city: "Guadalajara",
      address: "Av. López Mateos 2077, Col. Providencia, Guadalajara, Jalisco 44630",
      startDate: "20 de enero, 2025",
      endDate: "31 de marzo, 2025",
      schedule: "Sábados, 10:00 AM - 1:00 PM",
      totalSessions: 10,
      capacity: 30,
      enrolled: 22,
      includes: [
        "Material didáctico completo",
        "Coffee breaks",
        "Certificado de finalización",
        "Acceso a plataforma online complementaria",
      ],
      whatToBring: [
        "Laptop",
        "Cuaderno y plumas",
        "Identificación oficial",
      ],
      parking: "Estacionamiento gratuito disponible",
      publicTransport: "Ruta 275 del transporte público. Parada a 2 cuadras del lugar",
      contactEmail: "luis.herrera@cursumi.com",
      contactPhone: "+52 33 5678 9012",
    },
  };

  return courses[id] || null;
};

const getLessonIcon = (type: CourseLesson["type"]) => {
  switch (type) {
    case "video":
      return PlayCircle;
    case "text":
      return BookOpen;
    case "quiz":
      return FileQuestion;
    case "assignment":
      return FileText;
    default:
      return BookOpen;
  }
};

const getLessonTypeLabel = (type: CourseLesson["type"]) => {
  switch (type) {
    case "video":
      return "Video";
    case "text":
      return "Lectura";
    case "quiz":
      return "Quiz";
    case "assignment":
      return "Tarea";
    default:
      return "Lección";
  }
};

interface CourseDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { id } = use(params);
  const course = getCourseDetail(id);

  if (!course) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 p-8 text-center">
        <h1 className="text-2xl font-bold text-foreground">Curso no encontrado</h1>
        <p className="text-muted-foreground mb-4">El curso que buscas no existe o no está disponible.</p>
        <Link href="/dashboard/explore">
          <Button>Volver a explorar cursos</Button>
        </Link>
      </div>
    );
  }

  const totalLessons = course.sections?.reduce((acc, section) => acc + section.lessons.length, 0) || course.totalLessons || 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header con botón de regreso */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/explore">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a explorar
          </Button>
        </Link>
      </div>

      {/* Información principal del curso */}
      <Card className="border border-border bg-card/90">
        {course.imageUrl && (
          <div className="relative h-64 w-full overflow-hidden rounded-t-2xl md:h-80">
            <Image
              src={course.imageUrl}
              alt={course.title}
              fill
              className="object-cover"
            />
          </div>
        )}
        <CardHeader className="px-6 pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant="outline">{course.modality}</Badge>
                <Badge variant="outline">{course.category}</Badge>
                <Badge variant="outline">{course.level}</Badge>
              </div>
              <CardTitle className="text-3xl font-bold text-foreground mb-3">
                {course.title}
              </CardTitle>
              <p className="text-lg text-muted-foreground mb-4">{course.description}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Por {course.instructorName}</span>
                </div>
                {course.duration && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration}</span>
                  </div>
                )}
                {totalLessons > 0 && (
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span>{totalLessons} lecciones</span>
                  </div>
                )}
                {course.modality === "presencial" && course.city && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{course.city}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-4 w-full md:w-auto md:min-w-[250px]">
              <div className="text-center md:text-right">
                <p className="text-sm text-muted-foreground mb-1">Precio</p>
                <p className="text-3xl font-bold text-foreground">{formatPriceMXN(course.price)}</p>
              </div>
              <Button size="lg" className="w-full">
                <BookOpen className="mr-2 h-4 w-4" />
                Inscribirse al curso
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Descripción detallada */}
      {course.longDescription && (
        <Card className="border border-border bg-card/90">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-foreground">Acerca de este curso</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {course.longDescription}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Información del instructor */}
      <Card className="border border-border bg-card/90">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-foreground">Sobre el instructor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-2">{course.instructorName}</h3>
              {course.instructorBio ? (
                <p className="text-sm text-muted-foreground leading-relaxed">{course.instructorBio}</p>
              ) : (
                <p className="text-sm text-muted-foreground">Instructor experto en {course.category}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contenido del curso (secciones y lecciones) */}
      {course.sections && course.sections.length > 0 && (
        <Card className="border border-border bg-card/90">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-foreground">Contenido del curso</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {totalLessons} lecciones en {course.sections.length} secciones
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {course.sections.map((section, sectionIndex) => {
                const LessonIcon = getLessonIcon(section.lessons[0]?.type || "video");
                return (
                  <div key={section.id} className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">{sectionIndex + 1}</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">{section.title}</h3>
                        {section.description && (
                          <p className="text-sm text-muted-foreground mb-3">{section.description}</p>
                        )}
                        <div className="space-y-2">
                          {section.lessons.map((lesson) => {
                            const Icon = getLessonIcon(lesson.type);
                            return (
                              <div
                                key={lesson.id}
                                className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                              >
                                <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-foreground">{lesson.title}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] border border-border bg-background text-muted-foreground">
                                      {getLessonTypeLabel(lesson.type)}
                                    </span>
                                    {lesson.duration && (
                                      <span className="text-xs text-muted-foreground">{lesson.duration}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    {sectionIndex < course.sections!.length - 1 && <Separator className="my-4" />}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Información completa para cursos presenciales */}
      {course.modality === "presencial" && (
        <div className="space-y-6">
          {/* Ubicación y mapa */}
          <Card className="border border-border bg-card/90">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Ubicación del curso
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {course.city && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <p className="font-semibold text-foreground">{course.city}</p>
                  </div>
                )}
                {course.address && (
                  <p className="text-sm text-muted-foreground pl-6">{course.address}</p>
                )}
              </div>
              
              {/* Mapa placeholder */}
              <div className="relative h-64 w-full rounded-lg overflow-hidden border border-border bg-muted/30">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <MapPin className="h-12 w-12 text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground">Mapa interactivo</p>
                    <Button variant="outline" size="sm" asChild>
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(course.address || course.city || "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <Navigation className="h-4 w-4" />
                        Abrir en Google Maps
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fechas y horarios */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border border-border bg-card/90">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Fechas y horarios
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {course.startDate && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Fecha de inicio</p>
                    <p className="font-medium text-foreground">{course.startDate}</p>
                  </div>
                )}
                {course.endDate && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Fecha de finalización</p>
                    <p className="font-medium text-foreground">{course.endDate}</p>
                  </div>
                )}
                {course.schedule && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Horario</p>
                    <p className="font-medium text-foreground">{course.schedule}</p>
                  </div>
                )}
                {course.totalSessions && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Total de sesiones</p>
                    <p className="font-medium text-foreground">{course.totalSessions} sesiones</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Disponibilidad */}
            <Card className="border border-border bg-card/90">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Disponibilidad
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {course.capacity && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Capacidad máxima</p>
                    <p className="font-medium text-foreground">{course.capacity} estudiantes</p>
                  </div>
                )}
                {course.enrolled !== undefined && course.capacity && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Inscritos</p>
                    <div className="space-y-2">
                      <p className="font-medium text-foreground">
                        {course.enrolled} de {course.capacity} estudiantes
                      </p>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${(course.enrolled / course.capacity) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {course.capacity - course.enrolled} lugares disponibles
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Información de transporte */}
          <div className="grid gap-6 md:grid-cols-2">
            {course.parking && (
              <Card className="border border-border bg-card/90">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Car className="h-5 w-5 text-primary" />
                    Estacionamiento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{course.parking}</p>
                </CardContent>
              </Card>
            )}
            {course.publicTransport && (
              <Card className="border border-border bg-card/90">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Bus className="h-5 w-5 text-primary" />
                    Transporte público
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{course.publicTransport}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Qué incluye y qué traer */}
          <div className="grid gap-6 md:grid-cols-2">
            {course.includes && course.includes.length > 0 && (
              <Card className="border border-border bg-card/90">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    El curso incluye
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {course.includes.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
            {course.whatToBring && course.whatToBring.length > 0 && (
              <Card className="border border-border bg-card/90">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Qué traer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {course.whatToBring.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-primary mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Información de contacto */}
          {(course.contactEmail || course.contactPhone) && (
            <Card className="border border-border bg-card/90">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground">Información de contacto</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  ¿Tienes preguntas sobre este curso? Contáctanos
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3 md:flex-row md:gap-6">
                  {course.contactEmail && (
                    <a 
                      href={`mailto:${course.contactEmail}`}
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <Mail className="h-4 w-4" />
                      {course.contactEmail}
                    </a>
                  )}
                  {course.contactPhone && (
                    <a 
                      href={`tel:${course.contactPhone}`}
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <Phone className="h-4 w-4" />
                      {course.contactPhone}
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Call to action final */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">¿Listo para comenzar?</h3>
              <p className="text-muted-foreground">
                Únete a este curso y comienza tu viaje de aprendizaje hoy mismo.
              </p>
            </div>
            <Button size="lg" className="w-full md:w-auto">
              <BookOpen className="mr-2 h-4 w-4" />
              Inscribirse ahora
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

