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

// Core Metro Cities that always have active individual landing pages
export const CORE_METRO_CITIES: string[] = [
  "delhi",
  "new delhi",
  "mumbai",
  "bengaluru",
  "bangalore",
  "chennai",
  "hyderabad",
  "kolkata",
  "pune",
  "ahmedabad",
];

export const CORE_METRO_STATES: string[] = [
  "delhi",
  "maharashtra",
  "karnataka",
  "tamil nadu",
  "telangana",
  "west bengal",
  "gujarat",
];

export function isCoreMetro(name?: string | null): boolean {
  if (!name) return false;
  const clean = name.trim().toLowerCase().replace(/-/g, " ");
  return CORE_METRO_CITIES.some(
    (m) => clean === m || clean.includes(m) || m.includes(clean)
  );
}

export function isCoreState(name?: string | null): boolean {
  if (!name) return false;
  const clean = name.trim().toLowerCase().replace(/-/g, " ");
  return CORE_METRO_STATES.some(
    (s) => clean === s || clean.includes(s) || s.includes(clean)
  );
}

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

/**
 * Returns location-specific WhatsApp channel if available (e.g. state or city match in settings),
 * otherwise falls back gracefully to the official General All-India WhatsApp Channel.
 */
export function getWhatsAppChannelForLocation(
  locationName?: string,
  rawSetting?: string | null
): { name: string; url: string; isSpecific: boolean } {
  const channels = parseChannels(rawSetting, DEFAULT_WHATSAPP_CHANNELS);

  if (locationName && locationName.trim()) {
    const locClean = locationName.trim().toLowerCase();
    const match = channels.find((c) => {
      const cName = (c.name || "").toLowerCase();
      return cName.includes(locClean) || locClean.includes(cName);
    });
    if (match && match.url) {
      return {
        name: match.name,
        url: match.url,
        isSpecific: true,
      };
    }
  }

  // Fallback to the main general channel
  const fallback = channels[0] || DEFAULT_WHATSAPP_CHANNELS[0];
  return {
    name: fallback.name || "Official WhatsApp Channel",
    url: fallback.url || "https://whatsapp.com/channel/0029Vaz1p0kCRs1uBTCWpJ2X",
    isSpecific: false,
  };
}
