import { type MultimediaMaterialData } from "@/lib/planning/multimedia-material";

const W = 794;
const PURPLE = "#6d28d9";
const PURPLE_DARK = "#4300d0";
const PURPLE_LIGHT = "#a400e3";
const GRADIENT = `linear-gradient(135deg, ${PURPLE_DARK} 0%, ${PURPLE} 50%, ${PURPLE_LIGHT} 100%)`;
const TEXT = "#111827";
const MUTED = "#6b7280";
const WHITE = "#ffffff";

// ── Cover ──────────────────────────────────────────────────────────────────

function CoverPage({ data }: { data: MultimediaMaterialData }) {
  return (
    <div
      style={{
        width: W,
        minHeight: 1123,
        background: WHITE,
        fontFamily: "'Helvetica Neue', Arial, Helvetica, sans-serif",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        boxSizing: "border-box" as const,
      }}
    >
      <div style={{ height: 6, background: GRADIENT, flexShrink: 0 }} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "64px 72px 56px" }}>
        <p style={{ fontSize: 13, color: PURPLE, fontWeight: 500, margin: "0 0 48px" }}>
          {data.courseName}
        </p>

        <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 40 }}>
          <div
            style={{
              width: 80, height: 80,
              background: GRADIENT,
              borderRadius: 16,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 8px 32px rgba(109,40,217,0.25)",
            }}
          >
            <span style={{ color: WHITE, fontWeight: 900, fontSize: 38, letterSpacing: "-2px", lineHeight: 1 }}>C</span>
          </div>
        </div>

        <h1
          style={{
            fontSize: 56, fontWeight: 900, color: PURPLE,
            margin: "0 0 20px", lineHeight: 1.05, letterSpacing: "-1px",
          }}
        >
          MATERIAL<br />MULTIMEDIA
        </h1>

        <div style={{ height: 5, width: 80, background: GRADIENT, borderRadius: 3, marginBottom: 28 }} />

        <div style={{ flex: 1 }} />

        {data.referenceStandard && (
          <div style={{ textAlign: "right", maxWidth: 280, alignSelf: "flex-end" }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: PURPLE, margin: "0 0 6px", letterSpacing: "0.05em" }}>
              Estándar de Referencia
            </p>
            <p style={{ fontSize: 11, color: MUTED, margin: 0, lineHeight: 1.5 }}>
              {data.referenceStandard}
            </p>
          </div>
        )}
      </div>

      <div style={{ height: 6, background: GRADIENT, flexShrink: 0 }} />

      <div
        style={{
          position: "absolute", left: 0, top: 6, bottom: 6,
          width: 4, background: GRADIENT, opacity: 0.35,
        }}
      />
    </div>
  );
}

// ── Table of contents ───────────────────────────────────────────────────────

function TocPage({ videos }: { videos: MultimediaMaterialData["videos"] }) {
  return (
    <div
      style={{
        width: W, minHeight: 1123, background: WHITE,
        fontFamily: "'Helvetica Neue', Arial, Helvetica, sans-serif",
        padding: "72px 80px", boxSizing: "border-box" as const,
      }}
    >
      <h2 style={{ fontSize: 28, fontWeight: 700, color: PURPLE, margin: "0 0 32px", borderBottom: `3px solid ${PURPLE}`, paddingBottom: 10 }}>
        Contenido
      </h2>

      {[
        { title: "Presentación", indent: false },
        { title: "Evidencias", indent: false },
        ...videos.filter((v) => v.title.trim()).map((v) => ({ title: v.title, indent: true })),
      ].map(({ title, indent }, i) => (
        <div
          key={i}
          style={{ display: "flex", alignItems: "baseline", paddingLeft: indent ? 28 : 0, marginBottom: indent ? 5 : 10 }}
        >
          <span style={{ fontSize: indent ? 12 : 13, fontWeight: indent ? 400 : 600, color: indent ? MUTED : TEXT, flexShrink: 0 }}>
            {title}
          </span>
          <span style={{ flex: 1, borderBottom: "1px dotted #d1d5db", margin: "0 8px", marginBottom: 3 }} />
        </div>
      ))}
    </div>
  );
}

// ── Content ─────────────────────────────────────────────────────────────────

function ContentPages({ data }: { data: MultimediaMaterialData }) {
  const filledVideos = data.videos.filter((v) => v.title.trim());

  return (
    <div
      style={{
        width: W, background: WHITE,
        fontFamily: "'Helvetica Neue', Arial, Helvetica, sans-serif",
        padding: "56px 80px", boxSizing: "border-box" as const,
      }}
    >
      {/* Presentación */}
      {data.presentation && (
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: TEXT, margin: "0 0 16px" }}>Presentación</h2>
          <p
            style={{
              fontSize: 14, color: TEXT, lineHeight: 1.8,
              textIndent: "2em", margin: 0, whiteSpace: "pre-wrap",
            }}
          >
            {data.presentation}
          </p>
        </div>
      )}

      {/* Evidencias */}
      {filledVideos.length > 0 && (
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: TEXT, margin: "0 0 28px" }}>Evidencias</h2>
          {filledVideos.map((video) => (
            <div key={video.id} style={{ marginBottom: 48 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: TEXT, margin: "0 0 16px" }}>
                {video.title}
              </h3>
              {video.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={video.imageUrl}
                  alt={video.title}
                  style={{
                    width: "85%",
                    maxWidth: 560,
                    display: "block",
                    margin: "0 auto",
                    borderRadius: 4,
                    border: "1px solid #e5e7eb",
                  }}
                  crossOrigin="anonymous"
                />
              ) : (
                <div
                  style={{
                    width: "85%", maxWidth: 560, height: 180,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto",
                    border: "2px dashed #d1d5db",
                    borderRadius: 8,
                    color: MUTED, fontSize: 12,
                  }}
                >
                  Captura de pantalla del video
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main ────────────────────────────────────────────────────────────────────

export function MultimediaMaterialDocument({ data }: { data: MultimediaMaterialData }) {
  return (
    <div style={{ width: W, background: WHITE }}>
      <CoverPage data={data} />
      {data.showTableOfContents && <TocPage videos={data.videos} />}
      <ContentPages data={data} />
    </div>
  );
}
