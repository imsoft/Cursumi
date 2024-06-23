export interface User {
  id: number;
  name: string;
  lastname: string;
  profileImage?: string;
  birthday: Date;
  role: Role;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  courseStatus: CourseStatus;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
}

export interface CourseChapter {
  id: number;
  title: string;
  videoUrl: string;
  status: VideoStatusEnum;
  createdAt: Date;
  updatedAt: Date;
  courseId: number;
}

export interface Enrollment {
  id: number;
  userId: number;
  courseId: number;
  status: string;
  grade?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Blog {
  id: number;
  title: string;
  content: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  tags?: string[];
  description?: string;
  keywords?: string[];
}

export type Role = "student" | "teacher" | "admin";
export type VideoStatusEnum = "complete" | "current" | "upcoming";
export type CourseStatus = "not_started" | "in_progress" | "completed";

export interface SeedData {
  users: User[];
  courses: Course[];
  courseChapters: CourseChapter[];
  enrollments: Enrollment[];
  blogs: Blog[];
}

export const initialData: SeedData = {
  users: [
    {
      id: 1,
      name: "John",
      lastname: "Doe",
      profileImage: "https://example.com/johndoe.jpg",
      birthday: new Date("1990-01-01"),
      role: "teacher",
      email: "john.doe@example.com",
      password: "password123",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-01T00:00:00.000Z"),
    },
    {
      id: 2,
      name: "Jane",
      lastname: "Smith",
      profileImage: "https://example.com/janesmith.jpg",
      birthday: new Date("1992-02-02"),
      role: "student",
      email: "jane.smith@example.com",
      password: "password123",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-01T00:00:00.000Z"),
    },
  ],
  courses: [
    {
      id: 1,
      title: "Curso de Matemáticas",
      description: "Un curso completo de matemáticas",
      thumbnail: "https://example.com/math.jpg",
      price: 99.99,
      courseStatus: "not_started",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-01T00:00:00.000Z"),
      userId: 1,
    },
  ],
  courseChapters: [
    {
      id: 1,
      title: "Introducción a las Matemáticas",
      videoUrl: "https://example.com/video1.mp4",
      status: "upcoming",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-01T00:00:00.000Z"),
      courseId: 1,
    },
  ],
  enrollments: [
    {
      id: 1,
      userId: 2,
      courseId: 1,
      status: "enrolled",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-01T00:00:00.000Z"),
    },
  ],
  blogs: [
    {
      id: 1,
      title: "Bienvenido al curso de Matemáticas",
      content: "Este es un blog sobre el curso de matemáticas.",
      published: true,
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-01T00:00:00.000Z"),
      userId: 1,
      tags: ["matemáticas", "educación"],
      description: "Un blog sobre el curso de matemáticas.",
      keywords: ["matemáticas", "curso", "educación"],
    },
  ],
};
