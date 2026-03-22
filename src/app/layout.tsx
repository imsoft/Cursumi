import type { Metadata } from "next";
import "./globals.css";
import { LayoutShell } from "@/components/layout-shell";
import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const ogImage =
  "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=1200&q=80";

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
      email: "cursumi.com@gmail.com",
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

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
  generator: "Next.js",
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
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
