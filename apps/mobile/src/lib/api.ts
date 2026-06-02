import type { CourseModality } from "@cursumi/shared";

/**
 * Base de la API. En dev puedes apuntar a tu local con EXPO_PUBLIC_API_URL
 * (las variables EXPO_PUBLIC_* se inyectan en el bundle). Por defecto usa producción.
 */
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "https://cursumi.vercel.app";

/**
 * Site key de Cloudflare Turnstile (CAPTCHA). Es un valor PÚBLICO (también viaja
 * en el bundle de la web). Se renderiza dentro de un WebView en el registro para
 * obtener el token `cf-turnstile-response` que el servidor exige en /sign-up/email.
 */
export const TURNSTILE_SITE_KEY =
  process.env.EXPO_PUBLIC_TURNSTILE_SITE_KEY ?? "0x4AAAAAACyo73SS8jWrE9tZ";

export type CourseSummary = {
  id: string;
  title: string;
  price: number;
  modality?: CourseModality;
  slug?: string | null;
  imageUrl?: string | null;
};

/** Trae los cursos publicados desde la API de la web (misma fuente que el sitio). */
export async function getCourses(): Promise<CourseSummary[]> {
  const res = await fetch(`${API_URL}/api/courses`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data: unknown = await res.json();
  // La API puede devolver un array o { courses: [...] } / { data: [...] } — normalizamos.
  const list = Array.isArray(data)
    ? data
    : ((data as { courses?: unknown; data?: unknown }).courses ??
       (data as { data?: unknown }).data ??
       []);
  return (Array.isArray(list) ? list : []) as CourseSummary[];
}
