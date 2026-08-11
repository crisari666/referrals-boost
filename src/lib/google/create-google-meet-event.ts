import {
  GOOGLE_CALENDAR_EVENTS_INSERT_URL,
  GOOGLE_CALENDAR_TIME_ZONE,
  GOOGLE_MEET_DEFAULT_DURATION_MINUTES,
} from "@/lib/google/google-calendar.constants";
import { clearGoogleCalendarAccessToken } from "@/lib/google/request-calendar-access-token";

export type CreateGoogleMeetEventInput = {
  accessToken: string;
  summary: string;
  dateYmd: string;
  timeHm: string;
  description?: string;
  durationMinutes?: number;
};

export type CreateGoogleMeetEventResult = {
  googleMeetUrl: string;
  googleCalendarEventId: string;
};

type CalendarEventResponse = {
  id?: string;
  hangoutLink?: string | null;
  conferenceData?: {
    entryPoints?: Array<{
      entryPointType?: string;
      uri?: string;
    }>;
  };
};

function addMinutesToDateTime(
  dateYmd: string,
  timeHm: string,
  minutes: number,
): { dateYmd: string; timeHm: string } {
  const [year, month, day] = dateYmd.split("-").map(Number);
  const [hour, minute] = timeHm.split(":").map(Number);
  const start = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  start.setUTCMinutes(start.getUTCMinutes() + minutes);
  const y = start.getUTCFullYear();
  const m = String(start.getUTCMonth() + 1).padStart(2, "0");
  const d = String(start.getUTCDate()).padStart(2, "0");
  const hh = String(start.getUTCHours()).padStart(2, "0");
  const mm = String(start.getUTCMinutes()).padStart(2, "0");
  return { dateYmd: `${y}-${m}-${d}`, timeHm: `${hh}:${mm}` };
}

function toLocalDateTimeIso(dateYmd: string, timeHm: string): string {
  return `${dateYmd}T${timeHm}:00`;
}

function extractMeetUrl(data: CalendarEventResponse): string | null {
  const hangout = data.hangoutLink?.trim();
  if (hangout) {
    return hangout;
  }
  const entryPoints = data.conferenceData?.entryPoints ?? [];
  for (const entry of entryPoints) {
    const uri = entry.uri?.trim();
    if (uri && (entry.entryPointType === "video" || uri.includes("meet.google.com"))) {
      return uri;
    }
  }
  return null;
}

/**
 * Creates a primary-calendar event with an attached Google Meet conference.
 */
export async function createGoogleMeetEvent(
  input: CreateGoogleMeetEventInput,
): Promise<CreateGoogleMeetEventResult> {
  const duration =
    input.durationMinutes ?? GOOGLE_MEET_DEFAULT_DURATION_MINUTES;
  const end = addMinutesToDateTime(input.dateYmd, input.timeHm, duration);
  const requestId = `ventor-virtual-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const requestBody = {
    summary: input.summary,
    description: input.description ?? "",
    start: {
      dateTime: toLocalDateTimeIso(input.dateYmd, input.timeHm),
      timeZone: GOOGLE_CALENDAR_TIME_ZONE,
    },
    end: {
      dateTime: toLocalDateTimeIso(end.dateYmd, end.timeHm),
      timeZone: GOOGLE_CALENDAR_TIME_ZONE,
    },
    conferenceData: {
      createRequest: {
        requestId,
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    },
  };
  const url = `${GOOGLE_CALENDAR_EVENTS_INSERT_URL}?conferenceDataVersion=1`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });
  if (response.status === 401) {
    clearGoogleCalendarAccessToken();
    throw new Error("Google session expired. Sign in with Google and try again.");
  }
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      detail
        ? `Could not create Google Meet: ${detail}`
        : "Could not create Google Meet event.",
    );
  }
  const data = (await response.json()) as CalendarEventResponse;
  const eventId = data.id?.trim();
  if (!eventId) {
    throw new Error("Google Calendar did not return an event id.");
  }
  const meetUrl = extractMeetUrl(data);
  if (!meetUrl) {
    throw new Error("Google Calendar did not return a Meet link.");
  }
  return {
    googleMeetUrl: meetUrl,
    googleCalendarEventId: eventId,
  };
}
