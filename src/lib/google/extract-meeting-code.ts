/**
 * Extracts a Google Meet meeting code from a join URL.
 */
export function extractGoogleMeetingCode(meetUrl: string): string | undefined {
  const trimmed = meetUrl.trim();
  if (!trimmed) {
    return undefined;
  }
  try {
    const url = new URL(trimmed);
    if (!url.hostname.includes("meet.google.com")) {
      return undefined;
    }
    const segment = url.pathname
      .split("/")
      .map((p) => p.trim())
      .find((p) => p.length > 0);
    return segment?.toLowerCase() || undefined;
  } catch {
    return undefined;
  }
}
