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
