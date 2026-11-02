import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import type { ReactNode } from "react";
import { EMAIL_BRAND_GRADIENT } from "@/lib/email";

/**
 * Piezas compartidas de las imágenes Open Graph (`/api/og` y `/api/og/course/[id]`).
 *
 * Marca: el mismo degradado de los correos, el ícono de `logos/cursumi.svg` y
 * Plus Jakarta Sans en blanco. Nada de colores fuera de esa paleta.
 */

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_ALT = "Cursumi - Aprende a tu ritmo o en vivo";
export const OG_FONT_FAMILY = "Plus Jakarta Sans";

/** Ícono de marca: mínimo 96 px, con zona de resguardo de 1/6 de su ancho. */
const LOGO_SIZE = 112;
const LOGO_CLEAR_SPACE = Math.ceil(LOGO_SIZE / 6);
const PADDING = 64;

const WHITE = "#ffffff";
const WHITE_SOFT = "rgba(255,255,255,0.85)";
const WHITE_GLASS = "rgba(255,255,255,0.16)";

type OgFont = {
  name: string;
  data: Buffer;
  weight: 600 | 800;
  style: "normal";
};

let fontsPromise: Promise<OgFont[]> | null = null;
let logoPromise: Promise<string> | null = null;

/** Lee los .ttf una sola vez por instancia (satori no acepta woff2 ni fuentes variables). */
function loadOgFonts(): Promise<OgFont[]> {
  fontsPromise ??= Promise.all([
    readFile(join(process.cwd(), "assets/fonts/PlusJakartaSans-ExtraBold.ttf")),
    readFile(join(process.cwd(), "assets/fonts/PlusJakartaSans-SemiBold.ttf")),
  ]).then(([extraBold, semiBold]) => [
    { name: OG_FONT_FAMILY, data: extraBold, weight: 800, style: "normal" },
    { name: OG_FONT_FAMILY, data: semiBold, weight: 600, style: "normal" },
  ]);
  return fontsPromise;
}

function loadLogoDataUri(): Promise<string> {
  logoPromise ??= readFile(join(process.cwd(), "public/logos/cursumi.svg")).then(
    (svg) => `data:image/svg+xml;base64,${svg.toString("base64")}`,
  );
  return logoPromise;
}

/**
 * Genera la imagen con el marco común: fondo de marca, logo arriba a la
 * izquierda y cursumi.com abajo. `children` es el bloque central.
 */
export async function renderOgImage(children: ReactNode, footerRight?: ReactNode) {
  const [fonts, logo] = await Promise.all([loadOgFonts(), loadLogoDataUri()]);
  return new ImageResponse(
    <OgFrame logo={logo} footerRight={footerRight}>
      {children}
    </OgFrame>,
    { ...OG_SIZE, fonts },
  );
}

function OgFrame({
  logo,
  children,
  footerRight,
}: {
  logo: string;
  children: ReactNode;
  footerRight?: ReactNode;
}) {
  return (
    <div
      style={{
        width: OG_SIZE.width,
        height: OG_SIZE.height,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundImage: EMAIL_BRAND_GRADIENT,
        color: WHITE,
        padding: PADDING,
        fontFamily: OG_FONT_FAMILY,
      }}
    >
      {/* Zona de resguardo: nada a menos de 1/6 del ancho del logo. */}
      <div style={{ display: "flex", paddingBottom: LOGO_CLEAR_SPACE, paddingRight: LOGO_CLEAR_SPACE }}>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img src={logo} width={LOGO_SIZE} height={LOGO_SIZE} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 1040 }}>
        {children}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 32, fontWeight: 600, color: WHITE_SOFT }}>cursumi.com</div>
        {footerRight}
      </div>
    </div>
  );
}

export function OgBadge({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignSelf: "flex-start",
        padding: "10px 22px",
        borderRadius: 9999,
        backgroundColor: WHITE_GLASS,
        fontSize: 28,
        fontWeight: 600,
        color: WHITE,
      }}
    >
      {children}
    </div>
  );
}

/** Bloque central de la imagen general (y respaldo cuando un curso no existe). */
export function OgGeneralHeadline() {
  return (
    <div
      style={{
        display: "flex",
        fontSize: 96,
        lineHeight: 1.02,
        fontWeight: 800,
        letterSpacing: "-0.03em",
        maxWidth: 900,
      }}
    >
      Aprende a tu ritmo o en vivo
    </div>
  );
}
