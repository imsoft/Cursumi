import { Metadata } from "next";
import { Gantari } from "next/font/google";

import { Footer, HeaderMenu } from "@/components";

import "./globals.css";
import { cn } from "@/lib/utils";

const gantari = Gantari({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Cursumi",
  description: "Cursumi",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          gantari.variable
        )}
      >
        <HeaderMenu />
        {children}
        <Footer />
      </body>
    </html>
  );
}
