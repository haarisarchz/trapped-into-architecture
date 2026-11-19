// Centralized Analytics Event Tracking Helper for Google Analytics
export function trackEvent(eventName: string, params: Record<string, any> = {}) {
  if (typeof window !== "undefined") {
    try {
      if ((window as any).gtag) {
        (window as any).gtag("event", eventName, params);
      }
    } catch (e) {
      console.warn("Analytics event error:", e);
    }
  }
}
