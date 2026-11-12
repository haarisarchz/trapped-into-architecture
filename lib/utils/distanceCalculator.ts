// Distance Calculation & Geocoding Utilities
// Trapped Into Architecture (TI2A)

/**
 * Calculates Great-Circle (Straight-Line) distance in kilometers between two GPS coordinates using the Haversine formula.
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Calculates estimated road driving/transit distance based on standard Indian highway & urban routing winding factors.
 * Road travel in India is typically 22% - 35% longer than straight aerial lines.
 */
export function estimateRoadDistanceKm(straightKm: number): number {
  if (straightKm <= 0) return 0;
  if (straightKm <= 5) return Math.round(straightKm * 1.4);
  if (straightKm <= 30) return Math.round(straightKm * 1.3);
  if (straightKm <= 100) return Math.round(straightKm * 1.25);
  return Math.round(straightKm * 1.22);
}

/**
 * Estimates realistic transit or driving travel time for Indian national highways, state routes, and rail corridors.
 */
export function estimateTravelTime(roadKm: number): string {
  if (roadKm <= 0) return "0 mins";
  if (roadKm <= 15) return "~30 - 45 mins";
  if (roadKm <= 40) return "~1 - 1.5 hrs";
  if (roadKm <= 100) return "~2 - 2.5 hrs";
  if (roadKm <= 200) return "~3.5 - 4.5 hrs";
  if (roadKm <= 400) return "~6 - 8 hrs (or express train)";
  if (roadKm <= 800) return `~${Math.round(roadKm / 55)} hrs (or overnight train)`;
  return `~${Math.round(roadKm / 60)} hrs (or direct flight)`;
}

/**
 * Generates an official Google Maps transit directions URL.
 */
export function getDirectionsUrl(
  lat: number,
  lng: number,
  homeLat?: number,
  homeLng?: number
): string {
  if (typeof homeLat === "number" && typeof homeLng === "number") {
    return `https://www.google.com/maps/dir/?api=1&origin=${homeLat},${homeLng}&destination=${lat},${lng}&travelmode=transit`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

/**
 * Free geocoding for Indian cities and PIN codes using OpenStreetMap Nominatim.
 * Safe, requires no API key, and caches results in sessionStorage.
 */
export async function geocodeLocation(
  query: string
): Promise<{ name: string; lat: number; lng: number } | null> {
  const clean = query.trim();
  if (!clean || clean.length < 2) return null;

  const cacheKey = `ti2a_geo_${clean.toLowerCase()}`;
  if (typeof window !== "undefined") {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {}
    }
  }

  try {
    const isPinCode = /^\d{6}$/.test(clean);
    const searchQuery = isPinCode ? `${clean}, India` : `${clean}, India`;

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        searchQuery
      )}&countrycodes=in&limit=1`,
      {
        headers: {
          "Accept-Language": "en",
        },
      }
    );

    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      const match = data[0];
      const result = {
        name: isPinCode
          ? `PIN ${clean}`
          : match.display_name.split(",")[0].trim() || clean,
        lat: parseFloat(match.lat),
        lng: parseFloat(match.lon),
      };
      if (typeof window !== "undefined") {
        sessionStorage.setItem(cacheKey, JSON.stringify(result));
      }
      return result;
    }
  } catch (err) {
    console.warn("Geocoding notice:", err);
  }

  return null;
}
