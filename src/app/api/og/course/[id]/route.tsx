import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { getPublishedCourse } from "@/lib/course-service";

export const runtime = "nodejs";
export const alt = "Imagen social para curso en Cursumi";
export const size = {
  width: 1200,
  height: 630,
};

const ogWidth = 1200;
const ogHeight = 630;
const bgGradient =
  "linear-gradient(135deg, #0f172a 0%, #1d4ed8 50%, #7c3aed 100%)";

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const course = await getPublishedCourse(id);

  const title = course?.title || "Curso en Cursumi";
  const category = course?.category || "Curso";
  const modality = course?.modality === "virtual" ? "Virtual" : "Presencial";
  const instructor = course?.instructor?.name || "Instructor de Cursumi";

  return new ImageResponse(
    (
      <div
        style={{
          width: ogWidth,
          height: ogHeight,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundImage: bgGradient,
          color: "#f8fafc",
          padding: "48px",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 16px",
              backgroundColor: "rgba(255,255,255,0.12)",
              borderRadius: "9999px",
              fontSize: "22px",
              fontWeight: 600,
            }}
          >
            <div
              style={{
                width: "14px",
                height: "14px",
                borderRadius: "9999px",
                backgroundColor: "#22d3ee",
              }}
            />
            Cursumi
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "18px", maxWidth: "1000px" }}>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <span
              style={{
                padding: "8px 14px",
                borderRadius: "10px",
                backgroundColor: "rgba(255,255,255,0.14)",
                fontSize: "22px",
                fontWeight: 600,
              }}
            >
              {category}
            </span>
            <span
              style={{
                padding: "8px 14px",
                borderRadius: "10px",
                backgroundColor: "rgba(255,255,255,0.14)",
                fontSize: "22px",
                fontWeight: 600,
              }}
            >
              {modality}
            </span>
          </div>
          <h1
            style={{
              fontSize: "64px",
              lineHeight: 1.05,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "#f8fafc",
            }}
          >
            {title}
          </h1>
          <p
            style={{
              fontSize: "28px",
              color: "rgba(241,245,249,0.9)",
              maxWidth: "90%",
            }}
          >
            Aprende con instructores verificados y obtén certificación al completar.
          </p>
          <div style={{ display: "flex", gap: "14px", alignItems: "center", fontSize: "24px" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "9999px",
                backgroundColor: "rgba(255,255,255,0.18)",
                display: "grid",
                placeItems: "center",
                fontWeight: 700,
              }}
            >
              {instructor
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <span style={{ fontWeight: 600 }}>{instructor}</span>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "24px", fontWeight: 600, color: "#c7d2fe" }}>
            cursumi.com
          </div>
          <div
            style={{
              padding: "10px 16px",
              borderRadius: "12px",
              backgroundColor: "rgba(255,255,255,0.16)",
              fontSize: "22px",
              fontWeight: 700,
            }}
          >
            Cursos virtuales y presenciales
          </div>
        </div>
      </div>
    ),
    {
      width: ogWidth,
      height: ogHeight,
    },
  );
}
