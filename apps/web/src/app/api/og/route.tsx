import { OgGeneralHeadline, renderOgImage } from "@/lib/og";

export const runtime = "nodejs";

export function GET() {
  return renderOgImage(<OgGeneralHeadline />);
}
