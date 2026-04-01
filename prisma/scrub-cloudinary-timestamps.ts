import { prisma } from "../src/lib/prisma";

function scrubUrl(url: string | null): string | null {
  if (!url) return null;
  // Match cloudinary secure urls and remove the /v123456/ version segment
  if (url.includes("res.cloudinary.com") && /\/v\d+\//.test(url)) {
    return url.replace(/\/v\d+\//, "/v1/");
  }
  
  // Auto-heal logic: Si la URL ya fue corrompida sin el "v1", la reparamos inyectándolo
  if (url.includes("res.cloudinary.com") && !/\/v\d+\//.test(url)) {
    return url.replace(/\/upload\//, "/upload/v1/");
  }
  return url;
}

async function main() {
  console.log("Iniciando purga de timestamps (Cloudinary) en la base de datos...");

  // 1. User images and signatures
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { image: { contains: "res.cloudinary.com" } },
        { signatureUrl: { contains: "res.cloudinary.com" } }
      ]
    }
  });

  let usersUpdated = 0;
  for (const user of users) {
    const newImage = scrubUrl(user.image);
    const newSig = scrubUrl(user.signatureUrl);
    if (newImage !== user.image || newSig !== user.signatureUrl) {
      await prisma.user.update({
        where: { id: user.id },
        data: { image: newImage, signatureUrl: newSig }
      });
      usersUpdated++;
    }
  }
  console.log(`[Users] Actualizados: ${usersUpdated}`);

  // 2. Course image covers
  const courses = await prisma.course.findMany({
    where: { imageUrl: { contains: "res.cloudinary.com" } }
  });

  let coursesUpdated = 0;
  for (const course of courses) {
    const newImageUrl = scrubUrl(course.imageUrl);
    if (newImageUrl !== course.imageUrl) {
      await prisma.course.update({
        where: { id: course.id },
        data: { imageUrl: newImageUrl }
      });
      coursesUpdated++;
    }
  }
  console.log(`[Courses] Actualizados: ${coursesUpdated}`);

  // 3. Org Materials
  const materials = await prisma.orgMaterial.findMany({
    where: { fileUrl: { contains: "res.cloudinary.com" } }
  });

  let materialsUpdated = 0;
  for (const material of materials) {
    const newFileUrl = scrubUrl(material.fileUrl);
    if (newFileUrl !== material.fileUrl) {
      await prisma.orgMaterial.update({
        where: { id: material.id },
        data: { fileUrl: newFileUrl as string }
      });
      materialsUpdated++;
    }
  }
  console.log(`[OrgMaterials] Actualizados: ${materialsUpdated}`);

  // 4. Lesson Attachments (JSON array of CourseFile)
  // Since we don't know the exact structure of attachments, we do a raw replace if it's a stringified JSON
  const lessons = await prisma.lesson.findMany({
    where: {
      attachments: { not: "DbNull" }
    }
  });

  let lessonsUpdated = 0;
  for (const lesson of lessons) {
    if (lesson.attachments) {
      const attachmentsStr = JSON.stringify(lesson.attachments);
      let scrubbedStr = attachmentsStr;
      if (scrubbedStr.includes("res.cloudinary.com") && /\\?\/v\d+\\?\//.test(scrubbedStr)) {
        scrubbedStr = scrubbedStr.replace(/(\/|\\\/)v\d+(\/|\\\/)/g, "$1v1$2");
      }
      if (scrubbedStr.includes("res.cloudinary.com") && !/\\?\/v\d+\\?\//.test(scrubbedStr)) {
        scrubbedStr = scrubbedStr.replace(/(\/|\\\/)(upload|authenticated|private)(\/|\\\/)/g, "$1$2$3v1$3");
      }
      
      if (scrubbedStr !== attachmentsStr) {
        await prisma.lesson.update({
          where: { id: lesson.id },
          data: { attachments: JSON.parse(scrubbedStr) }
        });
        lessonsUpdated++;
      }
    }
  }
  console.log(`[Lessons Attachments] Actualizados: ${lessonsUpdated}`);

  console.log("Purga completada exitosamente.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
