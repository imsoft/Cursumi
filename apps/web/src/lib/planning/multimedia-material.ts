import type { PlanningPrefill } from "./prefill";

export const MULTIMEDIA_MATERIAL_TYPE = "multimedia-material" as const;

export type MultimediaVideo = {
  id: string;
  title: string;
  imageUrl: string;
};

export type MultimediaMaterialData = {
  courseName: string;
  referenceStandard: string;
  showTableOfContents: boolean;
  presentation: string;
  videos: MultimediaVideo[];
};

export function emptyVideo(): MultimediaVideo {
  return {
    id: crypto.randomUUID(),
    title: "",
    imageUrl: "",
  };
}

export function createEmptyMultimediaMaterial(prefill?: Partial<PlanningPrefill>): MultimediaMaterialData {
  // Una entrada por lección del curso (el instructor ajusta la miniatura/URL)
  const videos: MultimediaVideo[] = (prefill?.units ?? [])
    .flatMap((u) => u.lessons.map((l) => l.title))
    .map((title) => ({ id: crypto.randomUUID(), title, imageUrl: "" }));

  return {
    courseName: prefill?.courseName ?? "",
    referenceStandard: "",
    showTableOfContents: true,
    presentation: "",
    videos: videos.length > 0 ? videos : [emptyVideo()],
  };
}

export function hydrateMultimediaMaterial(
  raw: unknown,
  prefill?: Parameters<typeof createEmptyMultimediaMaterial>[0],
): MultimediaMaterialData {
  const base = createEmptyMultimediaMaterial(prefill);
  if (!raw || typeof raw !== "object") return base;
  const data = raw as Partial<MultimediaMaterialData>;

  const videos =
    Array.isArray(data.videos) && data.videos.length > 0
      ? data.videos.map((v) => ({
          id: v.id || crypto.randomUUID(),
          title: v.title ?? "",
          imageUrl: v.imageUrl ?? "",
        }))
      : base.videos;

  return { ...base, ...data, videos };
}
