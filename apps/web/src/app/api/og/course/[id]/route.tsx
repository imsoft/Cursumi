import type { NextRequest } from "next/server";
import { formatPriceMXN } from "@cursumi/shared";
import { getPublishedCourse } from "@/lib/course-service-public";
import { OgBadge, OgGeneralHeadline, renderOgImage } from "@/lib/og";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const course = await getPublishedCourse(id).catch(() => null);

  // Sin curso (id inexistente o "preview"): la imagen general de marca.
  if (!course) {
    return renderOgImage(<OgGeneralHeadline />);
  }

  const modality = course.modality === "virtual" ? "Curso en video" : "Curso por evento";

  return renderOgImage(
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <OgBadge>{modality}</OgBadge>
      <div
        style={{
          display: "block",
          fontSize: 72,
          lineHeight: 1.1,
          fontWeight: 800,
          letterSpacing: "-0.025em",
          lineClamp: 2,
        }}
      >
        {course.title}
      </div>
    </div>,
    <div style={{ display: "flex", fontSize: 44, fontWeight: 800 }}>{formatPriceMXN(course.isFree ? 0 : course.price)}</div>,
  );
}
