import { prisma } from "./prisma";
import { SOCIAL_LINK_DEFAULTS, type SocialLink } from "./social-links-config";

export type { SocialLink };
export { SOCIAL_LINK_DEFAULTS };

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
