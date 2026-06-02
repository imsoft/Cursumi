import { type CourseInfoDocumentData, totalHours } from "@/lib/planning/course-info-document";

const NAVY = "#1a2744";
const BG = "#faf5eb";
const RULE_COLOR = "#1a2744";

const doc: React.CSSProperties = {
  width: 794,
  background: BG,
  fontFamily: "Georgia, 'Times New Roman', serif",
  color: NAVY,
  padding: "48px 56px 56px",
  boxSizing: "border-box",
};

const title: React.CSSProperties = {
  fontSize: 30,
  fontWeight: 700,
  color: NAVY,
  textAlign: "center",
  lineHeight: 1.25,
  marginBottom: 8,
};

const subtitle: React.CSSProperties = {
  fontSize: 13,
  textAlign: "center",
  color: NAVY,
  marginBottom: 28,
  lineHeight: 1.4,
};

const sectionTitle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  color: NAVY,
  textAlign: "center",
  marginBottom: 6,
  marginTop: 28,
};

const rule: React.CSSProperties = {
  borderTop: `2px solid ${RULE_COLOR}`,
  marginBottom: 12,
};

const bodyText: React.CSSProperties = {
  fontSize: 12,
  color: NAVY,
  lineHeight: 1.65,
  margin: 0,
  whiteSpace: "pre-wrap",
};

function SectionBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 style={sectionTitle}>{title}</h2>
      <hr style={rule} />
      {children}
    </div>
  );
}

export function CourseInfoDocumentDocument({ data }: { data: CourseInfoDocumentData }) {
  const hours = totalHours(data.topics);

  return (
    <div style={doc}>
      {/* ── Title ── */}
      <h1 style={title}>Documento de información general del curso en línea</h1>
      {data.courseName && <p style={subtitle}>{data.courseName}</p>}

      {/* ── Objetivo general ── */}
      <SectionBlock title="Objetivo General">
        <p style={bodyText}>{data.generalObjective}</p>
      </SectionBlock>

      {/* ── Temas ── */}
      <div style={{ marginTop: 20, marginBottom: 4 }}>
        {data.topics.map((topic) => (
          <div
            key={topic.id}
            style={{
              borderLeft: `4px solid ${NAVY}`,
              paddingLeft: 16,
              marginBottom: 20,
            }}
          >
            <h3 style={{ fontSize: 14, fontWeight: 700, color: NAVY, margin: "0 0 6px" }}>
              {topic.title}
            </h3>
            <p style={{ ...bodyText, fontSize: 11, marginBottom: 6 }}>
              {topic.objective}
            </p>
            <p style={{ fontSize: 11, color: NAVY, fontWeight: 600 }}>
              Horas: {topic.hours}
            </p>
          </div>
        ))}
      </div>

      {/* ── Total horas ── */}
      <p style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 24 }}>
        Total de horas: {hours}
      </p>

      {/* ── Introducción ── */}
      {data.introduction && (
        <SectionBlock title="Introducción al curso">
          <p style={bodyText}>{data.introduction}</p>
        </SectionBlock>
      )}

      {/* ── Metodología ── */}
      {data.methodology && (
        <SectionBlock title="Metodología de trabajo">
          <p style={bodyText}>{data.methodology}</p>
        </SectionBlock>
      )}

      {/* ── Guía visual ── */}
      {data.visualGuide && (
        <SectionBlock title="Guía Visual">
          <p style={bodyText}>{data.visualGuide}</p>
        </SectionBlock>
      )}

      {/* ── Perfil de ingreso ── */}
      <SectionBlock title="Perfil de ingreso">
        {data.targetAudience && (
          <p style={{ ...bodyText, marginBottom: 10 }}>{data.targetAudience}</p>
        )}
        {data.noPriorKnowledge && (
          <p style={{ ...bodyText, marginBottom: 10 }}>{data.noPriorKnowledge}</p>
        )}
        {data.requiredSkills && (
          <>
            <p style={{ ...bodyText, fontWeight: 700, marginBottom: 2 }}>Habilidades requeridas:</p>
            <p style={{ ...bodyText, marginBottom: 10 }}>{data.requiredSkills}</p>
          </>
        )}
        {data.requiredMaterials && (
          <>
            <p style={{ ...bodyText, fontWeight: 700, marginBottom: 2 }}>Material necesario:</p>
            <p style={bodyText}>{data.requiredMaterials}</p>
          </>
        )}
      </SectionBlock>

      {/* ── Evaluación ── */}
      <SectionBlock title="Evaluación">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {data.evaluationItems.map((item) => (
            <li key={item.id} style={{ ...bodyText, marginBottom: 4 }}>
              {item.text}
            </li>
          ))}
        </ul>
      </SectionBlock>

      {/* ── Duración ── */}
      <SectionBlock title="Duración del curso">
        <p style={{ ...bodyText, textAlign: "center", fontWeight: 600, fontSize: 13 }}>
          Horas:&nbsp;&nbsp;{hours}&nbsp;&nbsp;&nbsp;&nbsp;Días: {data.durationDays}
        </p>
      </SectionBlock>

      {/* ── Firma ── */}
      <div style={{ textAlign: "center", marginTop: 48 }}>
        <div
          style={{
            width: 180,
            borderTop: `2px solid ${NAVY}`,
            margin: "0 auto",
            paddingTop: 8,
          }}
        >
          <p style={{ fontSize: 11, fontWeight: 700, color: NAVY, margin: 0, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            {data.developerName}
          </p>
          <p style={{ fontSize: 11, fontWeight: 700, color: NAVY, margin: "2px 0 0", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            {data.developerRole}
          </p>
        </div>
      </div>
    </div>
  );
}
