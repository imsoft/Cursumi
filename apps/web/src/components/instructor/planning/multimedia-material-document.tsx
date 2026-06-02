import { type MultimediaMaterialData } from "@/lib/planning/multimedia-material";
import { PlanningCoverV2 } from "./planning-cover-v2";

const W = 794;
const PURPLE = "#6d28d9";
const TEXT = "#111827";
const MUTED = "#6b7280";
const WHITE = "#ffffff";

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
      <PlanningCoverV2 documentTitle="Material Multimedia" courseName={data.courseName} referenceStandard={data.referenceStandard} />
      {data.showTableOfContents && <TocPage videos={data.videos} />}
      <ContentPages data={data} />
    </div>
  );
}
