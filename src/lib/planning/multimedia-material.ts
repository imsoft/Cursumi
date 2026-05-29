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

export function emptyVideo(index: number): MultimediaVideo {
  return {
    id: crypto.randomUUID(),
    title: index === 0 ? "Video de bienvenida." : `Video del tema ${index}: `,
    imageUrl: "",
  };
}

export function createEmptyMultimediaMaterial(prefill?: {
  courseName?: string;
}): MultimediaMaterialData {
  return {
    courseName: prefill?.courseName ?? "",
    referenceStandard: "",
    showTableOfContents: true,
    presentation: "En este documento se presentan las pruebas del material multimedia generado para el curso.",
    videos: [emptyVideo(0), emptyVideo(1)],
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
