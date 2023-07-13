import "./globals.css";
import { Gantari } from "next/font/google";
import { HeaderMenu } from '../components/shared/HeaderMenu';

const gantari = Gantari({ subsets: ["latin"] });

export const metadata = {
  title: "Cursimi",
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
