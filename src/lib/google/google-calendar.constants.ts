export const GOOGLE_CALENDAR_EVENTS_SCOPE =
  "https://www.googleapis.com/auth/calendar.events" as const;

export const GOOGLE_MEETINGS_SPACE_READONLY_SCOPE =
  "https://www.googleapis.com/auth/meetings.space.readonly" as const;

/** Combined scopes for creating Meet events and reading conference transcripts. */
export const GOOGLE_CALENDAR_AND_MEET_SCOPES = [
  GOOGLE_CALENDAR_EVENTS_SCOPE,
  GOOGLE_MEETINGS_SPACE_READONLY_SCOPE,
].join(" ");

export const GOOGLE_GIS_SCRIPT_SRC =
  "https://accounts.google.com/gsi/client" as const;

export const GOOGLE_CALENDAR_TIME_ZONE = "America/Bogota" as const;

/** Default Meet duration when creating a virtual schedule event. */
export const GOOGLE_MEET_DEFAULT_DURATION_MINUTES = 30 as const;

export const GOOGLE_CALENDAR_EVENTS_INSERT_URL =
  "https://www.googleapis.com/calendar/v3/calendars/primary/events" as const;

export const GOOGLE_MEET_CONFERENCE_RECORDS_URL =
  "https://meet.googleapis.com/v2/conferenceRecords" as const;
