import { NextRequest, NextResponse } from "next/server";
import { requireSession, requireRole, handleApiError } from "@/lib/api-helpers";
import { getSocialLinks, updateSocialLinks, type SocialLink } from "@/lib/social-links";
import { z } from "zod";

const socialLinkSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  url: z.string().min(1),
  visible: z.boolean(),
});

const updateSchema = z.array(socialLinkSchema);

export async function GET() {
  try {
    const session = await requireSession();
    await requireRole(session.user.id, ["admin"]);
    const links = await getSocialLinks();
    return NextResponse.json(links);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await requireSession();
    await requireRole(session.user.id, ["admin"]);
    const body = await req.json();
    const links = updateSchema.parse(body) as SocialLink[];
    const updated = await updateSocialLinks(links);
    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
