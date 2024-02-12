interface SeedUser {
  name: string;
  surname: string;
  email: string;
  password: string;
  role: string;
}

interface SeedCourse {
  title: string;
  description: string;
  price: number;
  state: string;
}

interface SeedCourseChapter {
  title: string;
  videoUrl: string;
  status: Status;
}

interface SeedData {
  user: SeedUser[];
  course: SeedCourse[];
  courseChapter: SeedCourseChapter[];
}

type Status = "complete" | "current" | "upcoming";

export const initialData: SeedData = {
  user: [
    {
      name: "Juan",
      surname: "García",
      email: "juan@example.com",
      password: "contraseña123",
      role: "student",
    },
    {
      name: "María",
      surname: "López",
      email: "maria@example.com",
      password: "segura456",
      role: "teacher",
    },
  ],
  course: [
    {
      title: "Introducción a la Programación",
      description: "Un curso introductorio sobre programación.",
      price: 49,
      state: "activo",
    },
    {
      title: "Diseño Web Avanzado",
      description: "Un curso avanzado sobre diseño web.",
      price: 79,
      state: "inactivo",
    },
  ],
  courseChapter: [
    {
      title: "Introducción al Marketing Digital",
      videoUrl: "https://example.com/videos/intro_marketing",
      status: "complete",
    },
    {
      title: "Estrategias de Redes Sociales",
      videoUrl: "https://example.com/videos/redes_sociales",
      status: "current",
    },
  ],
};
