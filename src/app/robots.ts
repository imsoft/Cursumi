import type { MetadataRoute } from "next";

const siteUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");

const privateRoutes = ["/dashboard", "/instructor", "/admin", "/api"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Todos los crawlers: permite contenido público
      {
        userAgent: "*",
        allow: "/",
        disallow: privateRoutes,
      },
      // OpenAI — ChatGPT Search y entrenamiento
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: privateRoutes,
      },
      // OpenAI — ChatGPT browsing
      {
        userAgent: "ChatGPT-User",
        allow: "/",
        disallow: privateRoutes,
      },
      // Anthropic — Claude
      {
        userAgent: "anthropic-ai",
        allow: "/",
        disallow: privateRoutes,
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
        disallow: privateRoutes,
      },
      // Perplexity
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: privateRoutes,
      },
      // Google AI (Gemini / entrenamiento)
      {
        userAgent: "Google-Extended",
        allow: "/",
        disallow: privateRoutes,
      },
      // Meta AI
      {
        userAgent: "FacebookBot",
        allow: "/",
        disallow: privateRoutes,
      },
      // Apple
      {
        userAgent: "Applebot",
        allow: "/",
        disallow: privateRoutes,
      },
      // Common Crawl (base de datos de entrenamiento de muchos LLMs)
      {
        userAgent: "CCBot",
        allow: "/",
        disallow: privateRoutes,
      },
      // Cohere
      {
        userAgent: "cohere-ai",
        allow: "/",
        disallow: privateRoutes,
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
