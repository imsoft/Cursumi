import type { MetadataRoute } from "next";
import { getPublishedCourseIdsForSitemap } from "@/lib/course-service";
import { prisma } from "@/lib/prisma";

const siteUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");

type StaticRoute = {
  url: string;
  lastModified?: Date;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
};

const staticRoutes: StaticRoute[] = [
  { url: `${siteUrl}/`,              changeFrequency: "weekly",  priority: 1.0 },
  { url: `${siteUrl}/courses`,       changeFrequency: "daily",   priority: 0.9 },
  { url: `${siteUrl}/instructors`,   changeFrequency: "weekly",  priority: 0.8 },
  { url: `${siteUrl}/how-it-works`,  changeFrequency: "monthly", priority: 0.7 },
  { url: `${siteUrl}/contact`,       changeFrequency: "monthly", priority: 0.6 },
  { url: `${siteUrl}/privacidad`,    changeFrequency: "yearly",  priority: 0.3 },
  { url: `${siteUrl}/terminos`,      changeFrequency: "yearly",  priority: 0.3 },
  { url: `${siteUrl}/pricing`,       changeFrequency: "monthly", priority: 0.7 },
  { url: `${siteUrl}/business`,      changeFrequency: "monthly", priority: 0.7 },
  { url: `${siteUrl}/blog`,          changeFrequency: "weekly",  priority: 0.8 },
  { url: `${siteUrl}/login`,         changeFrequency: "monthly", priority: 0.5 },
  { url: `${siteUrl}/signup`,        changeFrequency: "monthly", priority: 0.5 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: route.url,
    lastModified: route.lastModified ?? lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  let courseEntries: MetadataRoute.Sitemap = [];
  try {
    const courses = await getPublishedCourseIdsForSitemap();
    courseEntries = courses.map((course) => ({
      url: `${siteUrl}/courses/${course.slug || course.id}`,
      lastModified: course.updatedAt,
      changeFrequency: "weekly",
      priority: 0.85,
    }));
  } catch {
    // Si la BD no está disponible (build time), solo devolver rutas estáticas
  }

  let blogEntries: MetadataRoute.Sitemap = [];
  try {
    const posts = await prisma.blogPost.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    });
    blogEntries = posts.map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "monthly",
      priority: 0.7,
    }));
  } catch {
    // BD no disponible en build time
  }

  return [...staticEntries, ...courseEntries, ...blogEntries];
}
