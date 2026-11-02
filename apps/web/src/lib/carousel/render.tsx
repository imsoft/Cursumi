import { ImageResponse } from "next/og";
import { EMAIL_BRAND_GRADIENT } from "@/lib/email";
import { loadLogoDataUri, loadOgFonts, OG_FONT_FAMILY } from "@/lib/og";
import { slideTextLength, toWords, type Block, type Segment, type Slide } from "./parse";

/** 4:5, el formato vertical que Instagram y TikTok muestran sin recortar. */
export const CAROUSEL_SIZE = { width: 1080, height: 1350 } as const;

const PADDING = 88;
const LOGO_SIZE = 96;
const WHITE = "#ffffff";
const WHITE_SOFT = "rgba(255,255,255,0.82)";
const WHITE_GLASS = "rgba(255,255,255,0.16)";
/** Violeta oscuro del degradado: texto sobre la pastilla blanca del resaltado. */
const INK = "#4300d0";
const HANDLE = "@cursumi";

/**
 * Satori no mezcla texto y elementos dentro de un bloque, así que el texto va
 * palabra por palabra (ver `toWords`) en un contenedor flex que hace el salto
 * de línea. Un resaltado (**así**) se queda junto como una sola pastilla.
 */
function RichText({
  segments,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
}: {
  segments: Segment[];
  fontSize: number;
  fontWeight: 600 | 800;
  lineHeight: number;
  letterSpacing?: string;
}) {
  const words = toWords(segments);
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        columnGap: Math.round(fontSize * 0.27),
        rowGap: Math.round(fontSize * (lineHeight - 1)),
        fontSize,
        fontWeight,
        lineHeight: 1,
        ...(letterSpacing ? { letterSpacing } : {}),
      }}
    >
      {words.map((word, i) => (
        <div key={i} style={{ display: "flex" }}>
          {word.map((p, j) =>
            p.highlight ? (
              <span
                key={j}
                style={{
                  backgroundColor: WHITE,
                  color: INK,
                  padding: `${Math.round(fontSize * 0.08)}px ${Math.round(fontSize * 0.22)}px`,
                  margin: `-${Math.round(fontSize * 0.08)}px 0`,
                  borderRadius: Math.round(fontSize * 0.18),
                }}
              >
                {p.text}
              </span>
            ) : (
              <span key={j}>{p.text}</span>
            ),
          )}
        </div>
      ))}
    </div>
  );
}

function BlockView({ block, fontSize }: { block: Block; fontSize: number }) {
  const text = <RichText segments={block.segments} fontSize={fontSize} fontWeight={600} lineHeight={1.3} />;
  if (block.kind === "paragraph") return text;
  return (
    <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
      <div
        style={{
          display: "flex",
          flexShrink: 0,
          width: fontSize * 1.3,
          height: fontSize * 1.3,
          borderRadius: 9999,
          backgroundColor: WHITE_GLASS,
          alignItems: "center",
          justifyContent: "center",
          fontSize: fontSize * 0.7,
          fontWeight: 800,
        }}
      >
        {block.marker}
      </div>
      <div style={{ display: "flex", flex: 1 }}>{text}</div>
    </div>
  );
}

function Pill({ children }: { children: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignSelf: "flex-start",
        padding: "12px 26px",
        borderRadius: 9999,
        backgroundColor: WHITE_GLASS,
        fontSize: 30,
        fontWeight: 800,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
      }}
    >
      {children}
    </div>
  );
}

function SlideView({ slide, logo }: { slide: Slide; logo: string }) {
  const isCover = slide.role === "cover";
  const isClosing = slide.role === "closing";
  const titleSize = isCover ? 104 : isClosing ? 84 : 72;
  const length = slideTextLength(slide);
  const bodySize = isCover ? 48 : length > 260 ? 40 : length > 160 ? 46 : 52;

  return (
    <div
      style={{
        width: CAROUSEL_SIZE.width,
        height: CAROUSEL_SIZE.height,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundImage: EMAIL_BRAND_GRADIENT,
        color: WHITE,
        padding: PADDING,
        fontFamily: OG_FONT_FAMILY,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img src={logo} width={LOGO_SIZE} height={LOGO_SIZE} />
        {!isCover && (
          <div style={{ fontSize: 30, fontWeight: 600, color: WHITE_SOFT }}>
            {`${slide.index}/${slide.total}`}
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
        {slide.tag && <Pill>{slide.tag}</Pill>}
        {slide.title && (
          <RichText
            segments={slide.title}
            fontSize={titleSize}
            fontWeight={800}
            lineHeight={1.12}
            letterSpacing="-0.025em"
          />
        )}
        {slide.blocks.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 28, color: isCover ? WHITE_SOFT : WHITE }}>
            {slide.blocks.map((b, i) => (
              <BlockView key={i} block={b} fontSize={bodySize} />
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 40 }}>
        <div style={{ display: "flex", flex: 1, fontSize: 26, fontWeight: 600, color: WHITE_SOFT, lineHeight: 1.35 }}>
          {slide.source ? `Fuente: ${slide.source}` : isClosing ? "cursumi.com" : HANDLE}
        </div>
        <div style={{ display: "flex", fontSize: 30, fontWeight: 800, flexShrink: 0 }}>
          {isCover ? "Desliza  →" : isClosing ? HANDLE : ""}
        </div>
      </div>
    </div>
  );
}

/** PNG de una slide, con la misma marca que las imágenes OG. */
export async function renderSlide(slide: Slide): Promise<Buffer> {
  const [fonts, logo] = await Promise.all([loadOgFonts(), loadLogoDataUri()]);
  const res = new ImageResponse(<SlideView slide={slide} logo={logo} />, { ...CAROUSEL_SIZE, fonts });
  return Buffer.from(await res.arrayBuffer());
}
