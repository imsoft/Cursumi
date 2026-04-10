import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const isProd = process.env.NODE_ENV === "production";

const securityHeaders = [
  // Impide que la app sea embebida en iframes de otros orígenes (clickjacking)
  { key: "X-Frame-Options", value: "DENY" },
  // Impide que el browser adivine el MIME type de respuestas (evita ejecutar archivos como scripts)
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Controla qué información se envía en el header Referer
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Fuerza HTTPS por 1 año — solo en producción (localhost no soporta HTTPS)
  ...(isProd
    ? [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }]
    : []),
  // Restringe acceso a APIs del navegador desde iframes
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self)" },
  // Evita que el browser exponga datos de la app a otras páginas en el mismo proceso
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  // Content Security Policy (Previene vulnerabilidades XSS severas limitando recursos)
  // Nota: unsafe-inline y unsafe-eval son requeridos por Next.js App Router y librerías de terceros.
  // Para eliminarlos completamente se necesitaría implementar nonces server-side en layout.tsx.
  {
    key: "Content-Security-Policy",
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://js.stripe.com;
      style-src 'self' 'unsafe-inline';
      img-src 'self' blob: data: https://images.unsplash.com https://res.cloudinary.com https://image.mux.com;
      media-src 'self' blob: data: https://stream.mux.com;
      connect-src 'self' https://challenges.cloudflare.com https://api.stripe.com https://api.cloudinary.com *.sentry.io;
      frame-src 'self' https://challenges.cloudflare.com https://js.stripe.com;
      font-src 'self' data:;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
    `.replace(/\s{2,}/g, " ").trim()
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      // Cloudinary — imágenes subidas por instructores
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      // Mux — thumbnails de video
      {
        protocol: "https",
        hostname: "image.mux.com",
      },
    ],
  },
  transpilePackages: [
    "@prisma/client",
    "@prisma/client-runtime-utils",
    "@prisma/adapter-neon",
  ],
};

export default withSentryConfig(nextConfig, {
  silent: !process.env.CI,
  widenClientFileUpload: true,
  sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN },
});
