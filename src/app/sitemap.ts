import type { MetadataRoute } from "next";

const siteUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");

const marketingRoutes = [
  "/",
  "/courses",
  "/instructors",
  "/how-it-works",
  "/contact",
  "/login",
  "/signup",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return marketingRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified,
  }));
}
