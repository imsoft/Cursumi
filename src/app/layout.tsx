import { Metadata } from "next";
import { Gantari } from "next/font/google";

import { Footer, HeaderMenu } from "@/components";

import "./globals.css";

const gantari = Gantari({ subsets: ["latin"] });

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
      <body className={gantari.className}>
        <HeaderMenu />
        {children}
        <Footer />
      </body>
    </html>
  );
}
