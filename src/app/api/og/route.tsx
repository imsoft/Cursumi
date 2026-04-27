import { ImageResponse } from "next/og";

export const runtime = "nodejs";

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundImage: "linear-gradient(135deg, #0f172a 0%, #1d4ed8 50%, #7c3aed 100%)",
          color: "#f8fafc",
          padding: "64px",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 20px",
              backgroundColor: "rgba(255,255,255,0.12)",
              borderRadius: "9999px",
              fontSize: "24px",
              fontWeight: 700,
            }}
          >
            <div
              style={{
                width: "16px",
                height: "16px",
                borderRadius: "9999px",
                backgroundColor: "#22d3ee",
              }}
            />
            Cursumi
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "960px" }}>
          <h1
            style={{
              fontSize: "72px",
              lineHeight: 1.05,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "#f8fafc",
              margin: 0,
            }}
          >
            Formación presencial y online
          </h1>
          <p
            style={{
              fontSize: "32px",
              color: "rgba(241,245,249,0.85)",
              margin: 0,
              maxWidth: "80%",
            }}
          >
            Aprende con instructores verificados y obtén certificación al completar.
          </p>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "26px", fontWeight: 600, color: "#c7d2fe" }}>cursumi.com</div>
          <div
            style={{
              padding: "12px 20px",
              borderRadius: "12px",
              backgroundColor: "rgba(255,255,255,0.16)",
              fontSize: "22px",
              fontWeight: 700,
            }}
          >
            Cursos virtuales · presenciales · en vivo
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
