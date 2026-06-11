import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

// GET /api/cron/publish-blog
// Publica al instante los artículos programados: la visibilidad ya la controla
// el filtro `publishedAt <= now` en las lecturas, pero las páginas del blog usan
// ISR (revalidate=300), así que sin esto un post programado tarda hasta 5 min en
// aparecer. Este cron revalida /blog y las páginas de los posts que acaban de
// entrar en vigor, para que se publiquen a la hora exacta.
// Protegido con CRON_SECRET (Vercel envía `Authorization: Bearer <CRON_SECRET>`).
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  // Posts que pasaron a "publicado" recientemente. Ventana amplia (15 min) para
  // tolerar retrasos del cron y que no se escape ninguno entre corridas.
  const since = new Date(now.getTime() - 15 * 60 * 1000);

  const due = await prisma.blogPost.findMany({
    where: { published: true, publishedAt: { lte: now, gt: since } },
    select: { slug: true },
  });

  if (due.length > 0) {
    revalidatePath("/blog");
    for (const { slug } of due) {
      revalidatePath(`/blog/${slug}`);
    }
  }

  return NextResponse.json({ revalidated: due.length, at: now.toISOString() });
}
