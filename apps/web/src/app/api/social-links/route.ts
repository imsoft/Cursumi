import { NextResponse } from "next/server";
import { getVisibleSocialLinks } from "@/lib/social-links";

export async function GET() {
  try {
    const links = await getVisibleSocialLinks();
    return NextResponse.json(links);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
