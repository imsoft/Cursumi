import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { LayoutShell } from "@/components/layout-shell";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});
import { ThemeProvider } from "@/components/theme-provider";
import { CookieConsent } from "@/components/cookie-consent";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { jsonLdScript } from "@/lib/sanitize"
import { headers } from "next/headers"

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const ogImage = `${siteUrl}/api/og`;

// Países de Latinoamérica que servimos (ISO 3166-1 alpha-2) — usados en
// structured data para reforzar el targeting geográfico.
const LATAM_COUNTRIES = [
  "MX", "CO", "AR", "CL", "PE", "VE", "EC", "GT", "BO", "DO",
  "HN", "PY", "SV", "NI", "CR", "PA", "UY", "PR",
];

// Locales LatAm para Open Graph (locale principal es_MX + alternativos).
const LATAM_OG_LOCALES = [
  "es_AR", "es_BO", "es_CL", "es_CO", "es_CR", "es_DO", "es_EC", "es_GT",
  "es_HN", "es_NI", "es_PA", "es_PE", "es_PR", "es_PY", "es_SV", "es_UY", "es_VE",
];

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Cursumi",
  url: siteUrl,
  logo: `${siteUrl}/logos/cursumi.svg`,
  areaServed: LATAM_COUNTRIES.map((code) => ({ "@type": "Country", name: code })),
  sameAs: [
    "https://www.facebook.com/cursumi/",
    "https://www.instagram.com/cursumi/",
    "https://x.com/cursumi_",
    "https://www.youtube.com/@cursumi",
    "https://www.tiktok.com/@cursumi",
    "https://www.threads.net/@cursumi",
    "https://www.twitch.tv/cursumi",
  ],
  contactPoint: [
    {
      "@type": "ContactPoint",
      email: "contacto@cursumi.com",
      contactType: "customer support",
      areaServed: LATAM_COUNTRIES,
      availableLanguage: ["es"],
    },
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Cursumi",
  url: siteUrl,
  description: "Plataforma de cursos en video y eventos en vivo con instructores expertos.",
  inLanguage: "es-419",
  publisher: { "@type": "Organization", name: "Cursumi", url: siteUrl },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${siteUrl}/courses?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export const metadata: Metadata = {
  manifest: "/manifest.json",
  metadataBase: new URL(siteUrl),
  title: {
    default: "Cursumi · Aprende a tu ritmo o en vivo",
    template: "%s · Cursumi",
  },
  description:
    "Cursumi conecta estudiantes e instructores en cursos en video y eventos en vivo que generan resultados reales.",
  applicationName: "Cursumi",
  keywords: [
    "cursos en línea",
    "cursos en video",
    "capacitación en línea",
    "educación en línea",
    "aprender en línea",
    "instructores",
    "aprendizaje",
    "plataforma educativa",
    "cursos Latinoamérica",
    "cursos en español",
  ],
  authors: [{ name: "Cursumi" }],
  creator: "Cursumi",
  publisher: "Cursumi",
  category: "education",
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    locale: "es_MX",
    alternateLocale: LATAM_OG_LOCALES,
    url: siteUrl,
    siteName: "Cursumi",
    title: "Cursumi · Aprende a tu ritmo o en vivo",
    description:
      "Plataforma de cursos en video y eventos en vivo con instructores expertos y experiencias de aprendizaje completas.",
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: "Cursumi - Aprende a tu ritmo o en vivo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@cursumi",
    creator: "@cursumi",
    title: "Cursumi · Aprende a tu ritmo o en vivo",
    description:
      "Cursos en video y en vivo con instructores expertos. Aprende, practica y consigue resultados reales.",
    images: [ogImage],
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  // Verificación de Google Search Console: define GOOGLE_SITE_VERIFICATION en el
  // entorno (Vercel) con el código que da Search Console para validar la propiedad.
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
    : {}),
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Nonce de la CSP estricta (lo fija src/middleware.ts). Lo aplicamos a nuestro
  // script inline para que se ejecute sin necesidad de 'unsafe-inline'.
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html lang="es-419" className={plusJakartaSans.variable} suppressHydrationWarning>
      <body className="antialiased">
        {/* Recarga única si falla un chunk tras un deploy (antes de hidratar React). */}
        <script
          nonce={nonce}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `(function(){var f="cursumi-chunk-reload-done";function c(r){if(r==null)return false;var s=typeof r==="string"?r:String((r&&r.message)||(r&&r.name)||r);return s.indexOf("ChunkLoadError")!==-1||s.indexOf("Loading chunk")!==-1||s.indexOf("Failed to load chunk")!==-1||s.indexOf("Failed to fetch dynamically imported module")!==-1;}function g(){if(sessionStorage.getItem(f))return;sessionStorage.setItem(f,"1");location.reload();}addEventListener("unhandledrejection",function(e){if(c(e.reason))g();});addEventListener("error",function(e){if(c(e.error)||c(e.message))g();});setTimeout(function(){sessionStorage.removeItem(f);},12e4);})();`,
          }}
        />
        {/* Skip navigation — visible solo en foco (accesibilidad) */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-9999 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Saltar al contenido principal
        </a>
        <ThemeProvider nonce={nonce}>
          <LayoutShell>{children}</LayoutShell>
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: jsonLdScript(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: jsonLdScript(websiteJsonLd) }}
        />
        </ThemeProvider>
        <CookieConsent />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
