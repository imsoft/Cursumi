import type { Metadata } from "next";
import "./globals.css";
import { LayoutShell } from "@/components/layout-shell";
import { ThemeProvider } from "@/components/theme-provider";
import { CookieConsent } from "@/components/cookie-consent";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const ogImage = `${siteUrl}/api/og`;

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Cursumi",
  url: siteUrl,
  logo: `${siteUrl}/logos/cursumi.svg`,
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
      areaServed: "MX",
      availableLanguage: ["es", "en"],
    },
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Cursumi",
  url: siteUrl,
  description: "Plataforma de cursos virtuales y presenciales con instructores expertos.",
  publisher: { "@type": "Organization", name: "Cursumi", url: siteUrl },
};

export const metadata: Metadata = {
  manifest: "/manifest.json",
  metadataBase: new URL(siteUrl),
  title: {
    default: "Cursumi · Formación presencial y online",
    template: "%s · Cursumi",
  },
  description:
    "Cursumi conecta estudiantes e instructores en cursos virtuales y presenciales que generan resultados reales.",
  applicationName: "Cursumi",
  keywords: [
    "cursos",
    "educación",
    "formación online",
    "formación presencial",
    "instructores",
    "aprendizaje",
    "plataforma educativa",
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
    url: siteUrl,
    siteName: "Cursumi",
    title: "Cursumi · Formación presencial y online",
    description:
      "Plataforma de cursos virtuales y presenciales con instructores expertos y experiencias de aprendizaje completas.",
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: "Cursumi - Formación presencial y online",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@cursumi",
    creator: "@cursumi",
    title: "Cursumi · Formación presencial y online",
    description:
      "Cursos virtuales y presenciales con instructores expertos. Aprende, practica y consigue resultados reales.",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="antialiased">
        {/* Recarga única si falla un chunk tras un deploy (antes de hidratar React). */}
        <script
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
        <ThemeProvider>
          <LayoutShell>{children}</LayoutShell>
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        </ThemeProvider>
        <CookieConsent />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
