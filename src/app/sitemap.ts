import type { MetadataRoute } from "next";
import { getPublishedCourseIdsForSitemap } from "@/lib/course-service";

const siteUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");

const staticRoutes: { url: string; lastModified?: Date }[] = [
  { url: `${siteUrl}/` },
  { url: `${siteUrl}/courses` },
  { url: `${siteUrl}/instructors` },
  { url: `${siteUrl}/how-it-works` },
  { url: `${siteUrl}/contact` },
  { url: `${siteUrl}/privacidad` },
  { url: `${siteUrl}/terminos` },
  { url: `${siteUrl}/login` },
  { url: `${siteUrl}/signup` },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: route.url,
    lastModified: route.lastModified ?? lastModified,
  }));

  let courseEntries: MetadataRoute.Sitemap = [];
  try {
    const courses = await getPublishedCourseIdsForSitemap();
    courseEntries = courses.map((course) => ({
      url: `${siteUrl}/courses/${course.id}`,
      lastModified: course.updatedAt,
    }));
  } catch {
    // Si la BD no está disponible (build time), solo devolver rutas estáticas
  }

  return [...staticEntries, ...courseEntries];
}
