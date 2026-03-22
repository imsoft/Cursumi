import { prisma } from "./prisma";

export interface SocialLink {
  key: string;
  label: string;
  url: string;
  visible: boolean;
}

export const SOCIAL_LINK_DEFAULTS: SocialLink[] = [
  { key: "facebook", label: "Facebook", url: "https://www.facebook.com/cursumi/", visible: true },
  { key: "instagram", label: "Instagram", url: "https://www.instagram.com/cursumi/", visible: true },
  { key: "x", label: "X", url: "https://x.com/cursumi_", visible: true },
  { key: "youtube", label: "YouTube", url: "https://www.youtube.com/@cursumi", visible: true },
  { key: "tiktok", label: "TikTok", url: "https://www.tiktok.com/@cursumi", visible: true },
  { key: "threads", label: "Threads", url: "https://www.threads.net/@cursumi", visible: true },
  { key: "twitch", label: "Twitch", url: "https://www.twitch.tv/cursumi", visible: true },
  { key: "email", label: "Correo Electrónico", url: "mailto:cursumi.com@gmail.com", visible: true },
];

const SETTING_KEY = "social_links";

export async function getSocialLinks(): Promise<SocialLink[]> {
  const setting = await prisma.siteSetting.findUnique({ where: { key: SETTING_KEY } });
  if (!setting) return SOCIAL_LINK_DEFAULTS;
  return setting.value as unknown as SocialLink[];
}

export async function getVisibleSocialLinks(): Promise<SocialLink[]> {
  const links = await getSocialLinks();
  return links.filter((l) => l.visible);
}

export async function updateSocialLinks(links: SocialLink[]): Promise<SocialLink[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jsonValue = JSON.parse(JSON.stringify(links)) as any;
  const result = await prisma.siteSetting.upsert({
    where: { key: SETTING_KEY },
    create: { key: SETTING_KEY, value: jsonValue },
    update: { value: jsonValue },
  });
  return result.value as unknown as SocialLink[];
}
