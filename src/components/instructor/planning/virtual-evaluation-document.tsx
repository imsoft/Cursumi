import { type VirtualEvaluationData, optionLetter } from "@/lib/planning/virtual-evaluation";

const W = 794;
const PURPLE = "#6d28d9";
const PURPLE_DARK = "#4300d0";
const PURPLE_LIGHT = "#a400e3";
const GRADIENT = `linear-gradient(135deg, ${PURPLE_DARK} 0%, ${PURPLE} 50%, ${PURPLE_LIGHT} 100%)`;
const TEXT = "#111827";
const MUTED = "#6b7280";
const WHITE = "#ffffff";
const HIGHLIGHT = "#fef08a";

// ── Cover ──────────────────────────────────────────────────────────────────

function CoverPage({ data }: { data: VirtualEvaluationData }) {
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
          EVALUACIÓN
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
      <div style={{ position: "absolute", left: 0, top: 6, bottom: 6, width: 4, background: GRADIENT, opacity: 0.35 }} />
    </div>
  );
}

// ── Table of contents ───────────────────────────────────────────────────────

function TocPage({ data }: { data: VirtualEvaluationData }) {
  const entries: string[] = [
    "Presentación",
    ...data.knowledgeEvaluations.filter((e) => e.title.trim()).map((e) => e.title),
    "Cuestionario de calidad.",
  ];

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
      {entries.map((title, i) => (
        <div key={i} style={{ display: "flex", alignItems: "baseline", marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: TEXT, flexShrink: 0 }}>{title}</span>
          <span style={{ flex: 1, borderBottom: "1px dotted #d1d5db", margin: "0 8px", marginBottom: 3 }} />
        </div>
      ))}
    </div>
  );
}

// ── Content ─────────────────────────────────────────────────────────────────

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 19,
  fontWeight: 700,
  color: TEXT,
  margin: "0 0 14px",
  lineHeight: 1.3,
};

const instructionsStyle: React.CSSProperties = {
  fontSize: 12.5,
  color: TEXT,
  lineHeight: 1.7,
  textIndent: "2em",
  margin: "0 0 18px",
  whiteSpace: "pre-wrap",
};

const questionStyle: React.CSSProperties = {
  fontSize: 12.5,
  color: TEXT,
  lineHeight: 1.6,
  margin: "0 0 6px",
  fontWeight: 500,
};

function ContentPages({ data }: { data: VirtualEvaluationData }) {
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
          <h2 style={sectionTitleStyle}>Presentación</h2>
          <p style={instructionsStyle}>{data.presentation}</p>
        </div>
      )}

      {/* Evaluaciones de conocimiento */}
      {data.knowledgeEvaluations.map((ev) => (
        <div key={ev.id} style={{ marginBottom: 44 }}>
          <h2 style={sectionTitleStyle}>{ev.title}</h2>
          {ev.instructions && <p style={instructionsStyle}>{ev.instructions}</p>}
          <ol style={{ margin: 0, paddingLeft: 28 }}>
            {ev.questions.map((q) => (
              <li key={q.id} style={{ marginBottom: 14 }}>
                <p style={questionStyle}>{q.statement}</p>
                <div style={{ paddingLeft: 20 }}>
                  {q.options.map((opt, oi) => (
                    <div
                      key={opt.id}
                      style={{
                        fontSize: 12,
                        color: TEXT,
                        lineHeight: 1.5,
                        marginBottom: 3,
                        backgroundColor: opt.correct ? HIGHLIGHT : "transparent",
                        display: "inline-block",
                        padding: opt.correct ? "1px 6px" : "1px 0",
                        borderRadius: 2,
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>{optionLetter(oi)}.</span>&nbsp;&nbsp;{opt.text}
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </div>
      ))}

      {/* Cuestionario de calidad */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={sectionTitleStyle}>Cuestionario de calidad.</h2>
        {data.qualityInstructions && <p style={instructionsStyle}>{data.qualityInstructions}</p>}

        {data.qualitySections.map((section) => (
          <div key={section.id} style={{ marginBottom: 22 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: TEXT, margin: "0 0 10px" }}>{section.title}</h3>
            <ol style={{ margin: 0, paddingLeft: 28 }}>
              {section.questions.map((q) => (
                <li key={q.id} style={{ marginBottom: 10 }}>
                  <p style={questionStyle}>{q.statement}</p>
                  <div style={{ paddingLeft: 20 }}>
                    {data.qualityScale.map((opt, oi) => (
                      <div key={oi} style={{ fontSize: 12, color: TEXT, lineHeight: 1.5, marginBottom: 2 }}>
                        <span style={{ fontWeight: 600 }}>{optionLetter(oi)}.</span>&nbsp;&nbsp;{opt}
                      </div>
                    ))}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main ────────────────────────────────────────────────────────────────────

export function VirtualEvaluationDocument({ data }: { data: VirtualEvaluationData }) {
  return (
    <div style={{ width: W, background: WHITE }}>
      <CoverPage data={data} />
      {data.showTableOfContents && <TocPage data={data} />}
      <ContentPages data={data} />
    </div>
  );
}
