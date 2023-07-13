import "./globals.css";
import { Gantari } from "next/font/google";

const gantari = Gantari({ subsets: ["latin"] });

export const metadata = {
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
      <body className={gantari.className}>{children}</body>
    </html>
  );
}
