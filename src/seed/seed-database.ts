import prisma from "../lib/prisma";
import { initialData } from "./seed";

async function main() {
  // 1.- Borrar registros previos
  await Promise.all([
    prisma.user.deleteMany(),
    prisma.course.deleteMany(),
    prisma.courseChapter.deleteMany(),
  ]);

  const { user, course, courseChapter } = initialData;

  // 2.- Crear registros

  // User
  await prisma.user.createMany({
    data: user,
  });

  // Course
  // await prisma.course.createMany({
  //   data: course,
  // });

  course.forEach(async (c) => {
    const { state, ...rest } = c;

    const dbCourse = await prisma.course.create({
      data: {
        ...rest,
      },
    });

    await prisma.course.createMany({
      data: dbCourse,
    });
  });

  // Course Chapter
  await prisma.courseChapter.createMany({
    data: courseChapter,
  });

  console.log("✅ Seed executed successfully 🌱");
}

(() => {
  if (process.env.NODE_ENV === "production") return;

  main();
})();
