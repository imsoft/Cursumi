import { type VirtualParticipantManualData, type VirtualManualSection } from "@/lib/planning/virtual-participant-manual";

const W = 794;
const PURPLE = "#6d28d9";
const PURPLE_DARK = "#4300d0";
const PURPLE_LIGHT = "#a400e3";
const GRADIENT = `linear-gradient(135deg, ${PURPLE_DARK} 0%, ${PURPLE} 50%, ${PURPLE_LIGHT} 100%)`;
const TEXT = "#111827";
const MUTED = "#6b7280";
const WHITE = "#ffffff";

// ── Cover page ─────────────────────────────────────────────────────────────

function CoverPage({ data }: { data: VirtualParticipantManualData }) {
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
      {/* Purple gradient top band */}
      <div style={{ height: 6, background: GRADIENT, flexShrink: 0 }} />

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "64px 72px 56px" }}>

        {/* Course name — small, top */}
        <p style={{ fontSize: 13, color: PURPLE, fontWeight: 500, margin: "0 0 48px", letterSpacing: "0.01em" }}>
          {data.courseName}
        </p>

        {/* Logo hexagon */}
        <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 40 }}>
          <div
            style={{
              width: 80,
              height: 80,
              background: GRADIENT,
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 32px rgba(109,40,217,0.25)",
            }}
          >
            <span style={{ color: WHITE, fontWeight: 900, fontSize: 38, letterSpacing: "-2px", lineHeight: 1 }}>C</span>
          </div>
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: 56,
            fontWeight: 900,
            color: PURPLE,
            margin: "0 0 20px",
            lineHeight: 1.05,
            letterSpacing: "-1px",
          }}
        >
          MANUAL DEL<br />PARTICIPANTE
        </h1>

        {/* Purple rule */}
        <div style={{ height: 5, width: 80, background: GRADIENT, borderRadius: 3, marginBottom: 28 }} />

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Standard reference — bottom right */}
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

      {/* Purple gradient bottom band */}
      <div style={{ height: 6, background: GRADIENT, flexShrink: 0 }} />

      {/* Left vertical accent */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 6,
          bottom: 6,
          width: 4,
          background: GRADIENT,
          opacity: 0.35,
        }}
      />
    </div>
  );
}

// ── Table of contents ───────────────────────────────────────────────────────

function TocPage({ sections }: { sections: VirtualManualSection[] }) {
  const visible = sections.filter((s) => s.title.trim());

  return (
    <div
      style={{
        width: W,
        minHeight: 1123,
        background: WHITE,
        fontFamily: "'Helvetica Neue', Arial, Helvetica, sans-serif",
        padding: "72px 80px",
        boxSizing: "border-box" as const,
      }}
    >
      <h2
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: PURPLE,
          margin: "0 0 32px",
          borderBottom: `3px solid ${PURPLE}`,
          paddingBottom: 10,
        }}
      >
        Contenido
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {visible.map((s) => (
          <div
            key={s.id}
            style={{
              display: "flex",
              alignItems: "baseline",
              paddingLeft: s.level === 2 ? 28 : 0,
              marginBottom: s.level === 1 ? 10 : 5,
            }}
          >
            <span
              style={{
                fontSize: s.level === 1 ? 13 : 12,
                fontWeight: s.level === 1 ? 600 : 400,
                color: s.level === 1 ? TEXT : MUTED,
                flexShrink: 0,
              }}
            >
              {s.title}
            </span>
            <span
              style={{
                flex: 1,
                borderBottom: "1px dotted #d1d5db",
                margin: "0 8px",
                marginBottom: 3,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Content pages ───────────────────────────────────────────────────────────

const bodyTextStyle: React.CSSProperties = {
  fontSize: 12,
  color: TEXT,
  lineHeight: 1.8,
  textAlign: "justify",
  whiteSpace: "pre-wrap",
  textIndent: "2em",
  margin: "0 0 12px",
};

function ContentPages({ sections }: { sections: VirtualManualSection[] }) {
  return (
    <div
      style={{
        width: W,
        background: WHITE,
        fontFamily: "'Helvetica Neue', Arial, Helvetica, sans-serif",
        padding: "56px 80px",
        boxSizing: "border-box" as const,
      }}
    >
      {sections.map((s) => (
        <div key={s.id} style={{ marginBottom: s.level === 1 ? 36 : 20 }}>
          {s.level === 1 ? (
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: TEXT,
                margin: "0 0 16px",
                paddingBottom: 4,
              }}
            >
              {s.title}
            </h2>
          ) : (
            <h3
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: TEXT,
                margin: "0 0 10px",
              }}
            >
              {s.title}
            </h3>
          )}
          {s.body && <p style={bodyTextStyle}>{s.body}</p>}
        </div>
      ))}
    </div>
  );
}

// ── Bibliography ────────────────────────────────────────────────────────────

function BibliographyPage({ entries }: { entries: string[] }) {
  const filled = entries.filter((e) => e.trim());
  if (filled.length === 0) return null;

  return (
    <div
      style={{
        width: W,
        background: WHITE,
        fontFamily: "'Helvetica Neue', Arial, Helvetica, sans-serif",
        padding: "56px 80px",
        boxSizing: "border-box" as const,
      }}
    >
      <h2 style={{ fontSize: 20, fontWeight: 700, color: TEXT, margin: "0 0 20px" }}>
        Bibliografía
      </h2>
      {filled.map((entry, i) => (
        <p
          key={i}
          style={{
            fontSize: 12,
            color: TEXT,
            lineHeight: 1.7,
            margin: "0 0 14px",
            textIndent: "-2em",
            paddingLeft: "2em",
            whiteSpace: "pre-wrap",
          }}
        >
          {entry}
        </p>
      ))}
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────

export function VirtualParticipantManualDocument({ data }: { data: VirtualParticipantManualData }) {
  const contentSections = data.sections.filter((s) => s.title.trim());
  const bibFilled = data.bibliography.filter((b) => b.trim());

  return (
    <div style={{ width: W, background: WHITE }}>
      {/* 1. Cover */}
      <CoverPage data={data} />

      {/* 2. Table of contents */}
      {data.showTableOfContents && contentSections.length > 0 && (
        <TocPage sections={contentSections} />
      )}

      {/* 3. Content */}
      {contentSections.length > 0 && <ContentPages sections={contentSections} />}

      {/* 4. Bibliography */}
      {bibFilled.length > 0 && <BibliographyPage entries={data.bibliography} />}
    </div>
  );
}
