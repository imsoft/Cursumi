import { type PresentationData, type Slide } from "@/lib/planning/presentation";

// Slide base 1280×720 (16:9)
const SW = 1280;
const SH = 720;

const PURPLE = "#6d28d9";
const PURPLE_DARK = "#4300d0";
const PURPLE_LIGHT = "#a400e3";
const GRADIENT = `linear-gradient(135deg, ${PURPLE_DARK} 0%, ${PURPLE} 50%, ${PURPLE_LIGHT} 100%)`;
const TEXT = "#1f1147";
const MUTED = "#6b7280";
const WHITE = "#ffffff";
const LOGO = "/icons/icon-512.png";

const slideBase: React.CSSProperties = {
  width: SW,
  height: SH,
  background: WHITE,
  fontFamily: "'Helvetica Neue', Arial, Helvetica, sans-serif",
  position: "relative",
  overflow: "hidden",
  boxSizing: "border-box",
};

function CoverSlide({ slide, presenter }: { slide: Slide; presenter: string }) {
  return (
    <div style={{ ...slideBase, display: "flex", flexDirection: "column" }}>
      <div style={{ height: 12, background: GRADIENT }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 110px" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO} alt="Cursumi" width={110} height={110} style={{ display: "block", marginBottom: 40 }} />
        <h1 style={{ fontSize: 76, fontWeight: 900, color: PURPLE, margin: 0, lineHeight: 1.05, letterSpacing: "-1.5px" }}>
          {slide.heading || "Título del curso"}
        </h1>
        <div style={{ height: 6, width: 120, background: GRADIENT, borderRadius: 4, margin: "28px 0" }} />
        {slide.sub && <p style={{ fontSize: 30, color: MUTED, margin: 0 }}>{slide.sub}</p>}
        {presenter && <p style={{ fontSize: 24, color: PURPLE, fontWeight: 600, margin: "40px 0 0" }}>{presenter}</p>}
      </div>
      <div style={{ height: 12, background: GRADIENT }} />
      <div style={{ position: "absolute", left: 0, top: 12, bottom: 12, width: 6, background: GRADIENT, opacity: 0.35 }} />
    </div>
  );
}

function SectionSlide({ slide }: { slide: Slide }) {
  return (
    <div style={{ ...slideBase, display: "flex" }}>
      {/* Panel izquierdo */}
      <div
        style={{
          width: 520,
          background: GRADIENT,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO} alt="Cursumi" width={48} height={48} style={{ display: "block" }} />
          <span style={{ color: WHITE, fontWeight: 700, fontSize: 26, letterSpacing: 0.5 }}>Cursumi</span>
        </div>
        <div style={{ color: WHITE, fontSize: 22, opacity: 0.85, fontWeight: 500 }}>Curso en línea</div>
      </div>
      {/* Contenido derecho */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 90px" }}>
        <h2 style={{ fontSize: 82, fontWeight: 900, color: TEXT, margin: 0, lineHeight: 1.02, letterSpacing: "-1.5px" }}>
          {slide.heading || "Tema"}
        </h2>
        {slide.sub && <p style={{ fontSize: 30, color: MUTED, margin: "24px 0 0", lineHeight: 1.35 }}>{slide.sub}</p>}
      </div>
    </div>
  );
}

function ContentSlide({ slide }: { slide: Slide }) {
  const bullets = slide.bullets.filter((b) => b.trim());
  return (
    <div style={{ ...slideBase, display: "flex", flexDirection: "column" }}>
      {/* Barra superior */}
      <div style={{ background: GRADIENT, padding: "0 64px", height: 130, display: "flex", alignItems: "center", gap: 18 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO} alt="Cursumi" width={56} height={56} style={{ display: "block", filter: "brightness(0) invert(1)" }} />
        <h2 style={{ fontSize: 42, fontWeight: 800, color: WHITE, margin: 0, lineHeight: 1.1 }}>
          {slide.heading || "Contenido"}
        </h2>
      </div>
      {/* Cuerpo */}
      <div style={{ flex: 1, padding: "56px 80px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        {slide.sub && <p style={{ fontSize: 30, color: TEXT, fontWeight: 600, margin: "0 0 28px" }}>{slide.sub}</p>}
        {bullets.map((b, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 20, marginBottom: 22 }}>
            <div style={{ width: 16, height: 16, borderRadius: 4, background: PURPLE, marginTop: 12, flexShrink: 0 }} />
            <span style={{ fontSize: 30, color: TEXT, lineHeight: 1.4 }}>{b}</span>
          </div>
        ))}
      </div>
      {/* Pie */}
      <div style={{ padding: "0 80px 36px", display: "flex", justifyContent: "flex-end" }}>
        <span style={{ fontSize: 18, color: MUTED, fontWeight: 600 }}>Cursumi</span>
      </div>
    </div>
  );
}

function ClosingSlide({ slide }: { slide: Slide }) {
  return (
    <div style={{ ...slideBase, background: GRADIENT, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 120px" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={LOGO} alt="Cursumi" width={110} height={110} style={{ display: "block", marginBottom: 40, filter: "brightness(0) invert(1)" }} />
      <h2 style={{ fontSize: 84, fontWeight: 900, color: WHITE, margin: 0, lineHeight: 1.05, letterSpacing: "-1.5px" }}>
        {slide.heading || "¡Gracias!"}
      </h2>
      {slide.sub && <p style={{ fontSize: 32, color: WHITE, opacity: 0.9, margin: "28px 0 0", lineHeight: 1.4 }}>{slide.sub}</p>}
    </div>
  );
}

function renderSlide(slide: Slide, presenter: string) {
  switch (slide.kind) {
    case "cover":
      return <CoverSlide slide={slide} presenter={presenter} />;
    case "section":
      return <SectionSlide slide={slide} />;
    case "content":
      return <ContentSlide slide={slide} />;
    case "closing":
      return <ClosingSlide slide={slide} />;
  }
}

export function PresentationDocument({ data }: { data: PresentationData }) {
  return (
    <div style={{ width: SW, background: "#e5e7eb" }}>
      {data.slides.map((slide) => (
        <div key={slide.id} data-slide style={{ marginBottom: 24 }}>
          {renderSlide(slide, data.presenter)}
        </div>
      ))}
    </div>
  );
}

/** Miniatura escalada de una diapositiva, para previsualizar en el formulario. */
export function SlideThumb({ slide, presenter, width = 320 }: { slide: Slide; presenter: string; width?: number }) {
  const scale = width / SW;
  return (
    <div
      style={{
        width,
        height: SH * scale,
        overflow: "hidden",
        borderRadius: 8,
        border: "1px solid #e5e7eb",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        flexShrink: 0,
      }}
    >
      <div style={{ width: SW, height: SH, transform: `scale(${scale})`, transformOrigin: "top left" }}>
        {renderSlide(slide, presenter)}
      </div>
    </div>
  );
}
