import { PrismaClient } from '@prisma/client';
import { initialData } from './seedData';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Borrar registros previos en el orden correcto
  await Promise.all([
    prisma.blog.deleteMany(),
    prisma.enrollment.deleteMany(),
    prisma.courseChapter.deleteMany(),
    prisma.course.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  const {
    users,
    courses,
    courseChapters,
    enrollments,
    blogs,
  } = initialData;

  // Crear usuarios
  const userPromises = users.map(async (userData) => {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    return prisma.user.create({
      data: {
        name: userData.name,
        lastname: userData.lastname,
        profileImage: userData.profileImage,
        birthday: userData.birthday,
        role: userData.role,
        email: userData.email,
        password: hashedPassword,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
      },
    });
  });

  const createdUsers = await Promise.all(userPromises);

  // Mapear los ids de los usuarios creados a los datos iniciales
  const userMap = new Map();
  createdUsers.forEach((user) => {
    const initialUser = users.find((u) => u.email === user.email);
    if (initialUser) {
      userMap.set(initialUser.id, user.id);
    }
  });

  // Crear cursos
  const coursePromises = courses.map((courseData) =>
    prisma.course.create({
      data: {
        title: courseData.title,
        description: courseData.description,
        thumbnail: courseData.thumbnail,
        price: courseData.price,
        courseStatus: courseData.courseStatus,
        userId: userMap.get(courseData.userId),
        createdAt: courseData.createdAt,
        updatedAt: courseData.updatedAt,
      },
    })
  );

  const createdCourses = await Promise.all(coursePromises);

  // Mapear los ids de los cursos creados a los datos iniciales
  const courseMap = new Map();
  createdCourses.forEach((course) => {
    const initialCourse = courses.find((c) => c.title === course.title);
    if (initialCourse) {
      courseMap.set(initialCourse.id, course.id);
    }
  });

  // Crear capítulos del curso
  const chapterPromises = courseChapters.map((chapterData) =>
    prisma.courseChapter.create({
      data: {
        title: chapterData.title,
        videoUrl: chapterData.videoUrl,
        status: chapterData.status,
        courseId: courseMap.get(chapterData.courseId),
        createdAt: chapterData.createdAt,
        updatedAt: chapterData.updatedAt,
      },
    })
  );

  await Promise.all(chapterPromises);

  // Crear inscripciones
  const enrollmentPromises = enrollments.map((enrollmentData) =>
    prisma.enrollment.create({
      data: {
        userId: userMap.get(enrollmentData.userId),
        courseId: courseMap.get(enrollmentData.courseId),
        status: enrollmentData.status,
        grade: enrollmentData.grade,
        createdAt: enrollmentData.createdAt,
        updatedAt: enrollmentData.updatedAt,
      },
    })
  );

  await Promise.all(enrollmentPromises);

  // Crear blogs
  const blogPromises = blogs.map((blogData) =>
    prisma.blog.create({
      data: {
        title: blogData.title,
        content: blogData.content,
        published: blogData.published,
        userId: userMap.get(blogData.userId),
        createdAt: blogData.createdAt,
        updatedAt: blogData.updatedAt,
        tags: blogData.tags,
        description: blogData.description,
        keywords: blogData.keywords,
      },
    })
  );

  await Promise.all(blogPromises);

  console.log('✅ Seed executed successfully 🌱');
}

(async () => {
  try {
    if (process.env.NODE_ENV === "production") return;
    await main();
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
