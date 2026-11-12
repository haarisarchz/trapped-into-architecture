export interface SocialChannel {
  name: string;
  url: string;
  description?: string;
  badge?: string;
}

export const DEFAULT_TELEGRAM_CHANNELS: SocialChannel[] = [
  { name: "Telegram Main Hub", url: "https://t.me/ArchitectJobsTi2A", description: "National architectural job updates" },
  { name: "Tamil Nadu", url: "https://t.me/tamilnaduarchitectjobs", description: "Chennai & regional studio posts" },
  { name: "Kerala", url: "https://t.me/keralaarchitectjobs", description: "Internships & trainee updates" },
  { name: "Karnataka", url: "https://t.me/karnatakaarchitectjobs", description: "Bengaluru studio requirements" },
  { name: "AP & Telangana", url: "https://t.me/andhratelenganaarchitectjobs", description: "Hyderabad & AP architect jobs" },
];

export const DEFAULT_WHATSAPP_CHANNELS: SocialChannel[] = [
  { name: "Main All-India Hub", url: "https://whatsapp.com/channel/0029Vaz1p0kCRs1uBTCWpJ2X", description: "1,000+ followers. Curated top jobs & platform feature launches" }
];

export function parseChannels(raw?: string | null, fallback: SocialChannel[] = []): SocialChannel[] {
  if (!raw || typeof raw !== "string") return fallback;
  const trimmed = raw.trim();
  if (!trimmed) return fallback;

  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
          .filter((item) => item && typeof item === "object" && item.url)
          .map((item) => ({
            name: (item.name || "Channel").trim(),
            url: (item.url || "").trim(),
            description: item.description || "",
            badge: item.badge || ""
          }));
      }
    } catch {
      // Fall through to single URL handling
    }
  }

  // Single legacy URL
  return [
    {
      name: fallback[0]?.name || "Main Hub",
      url: trimmed,
      description: fallback[0]?.description || ""
    }
  ];
}

export function serializeChannels(channels: SocialChannel[]): string {
  const cleaned = channels
    .filter((c) => c && c.url && c.url.trim())
    .map((c) => ({
      name: (c.name || "Channel").trim(),
      url: c.url.trim()
    }));
  return JSON.stringify(cleaned);
}
