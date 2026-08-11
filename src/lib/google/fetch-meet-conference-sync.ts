import { GOOGLE_MEET_CONFERENCE_RECORDS_URL } from "@/lib/google/google-calendar.constants";
import { extractGoogleMeetingCode } from "@/lib/google/extract-meeting-code";
import { clearGoogleCalendarAccessToken } from "@/lib/google/request-calendar-access-token";

export type MeetSyncAttendance = "attended" | "no_answer";

export type MeetSyncUtterance = {
  speaker?: string;
  text: string;
  start?: number;
  end?: number;
};

export type MeetConferenceSyncResult = {
  attendance: MeetSyncAttendance;
  conferenceRecordName?: string;
  durationSeconds?: number;
  endedAt?: string;
  transcript?: string;
  text?: string;
  utterances?: MeetSyncUtterance[];
};

type ConferenceRecord = {
  name?: string;
  startTime?: string;
  endTime?: string;
  space?: string;
};

type TranscriptResource = {
  name?: string;
  state?: string;
  startTime?: string;
  endTime?: string;
};

type TranscriptEntry = {
  name?: string;
  participant?: string;
  text?: string;
  languageCode?: string;
  startTime?: string;
  endTime?: string;
};

function durationSecondsBetween(
  startIso?: string,
  endIso?: string,
): number | undefined {
  if (!startIso || !endIso) {
    return undefined;
  }
  const startMs = Date.parse(startIso);
  const endMs = Date.parse(endIso);
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs < startMs) {
    return undefined;
  }
  return Math.round((endMs - startMs) / 1000);
}

async function googleMeetGet<T>(
  url: string,
  accessToken: string,
): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (response.status === 401) {
    clearGoogleCalendarAccessToken();
    throw new Error("Google session expired. Sign in with Google and try again.");
  }
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      detail
        ? `Google Meet API error: ${detail}`
        : `Google Meet API error (${response.status}).`,
    );
  }
  return (await response.json()) as T;
}

/**
 * Loads conference attendance + optional transcript for a Meet URL via Meet REST API.
 */
export async function fetchMeetConferenceSync(args: {
  accessToken: string;
  googleMeetUrl: string;
}): Promise<MeetConferenceSyncResult> {
  const meetingCode = extractGoogleMeetingCode(args.googleMeetUrl);
  if (!meetingCode) {
    throw new Error("Could not parse Google Meet meeting code from URL.");
  }
  const filter = encodeURIComponent(`space.meeting_code="${meetingCode}"`);
  const listUrl = `${GOOGLE_MEET_CONFERENCE_RECORDS_URL}?filter=${filter}`;
  const list = await googleMeetGet<{ conferenceRecords?: ConferenceRecord[] }>(
    listUrl,
    args.accessToken,
  );
  const conference = list.conferenceRecords?.[0];
  if (!conference?.name) {
    return { attendance: "no_answer" };
  }
  const durationSeconds = durationSecondsBetween(
    conference.startTime,
    conference.endTime,
  );
  const base: MeetConferenceSyncResult = {
    attendance: "attended",
    conferenceRecordName: conference.name,
    durationSeconds,
    endedAt: conference.endTime,
  };
  try {
    const transcriptsUrl = `https://meet.googleapis.com/v2/${conference.name}/transcripts`;
    const transcripts = await googleMeetGet<{
      transcripts?: TranscriptResource[];
    }>(transcriptsUrl, args.accessToken);
    const generated =
      transcripts.transcripts?.find((t) => t.state === "FILE_GENERATED") ??
      transcripts.transcripts?.[0];
    if (!generated?.name) {
      return base;
    }
    const entriesUrl = `https://meet.googleapis.com/v2/${generated.name}/entries`;
    const entriesRes = await googleMeetGet<{
      transcriptEntries?: TranscriptEntry[];
    }>(entriesUrl, args.accessToken);
    const entries = entriesRes.transcriptEntries ?? [];
    if (entries.length === 0) {
      return base;
    }
    const utterances: MeetSyncUtterance[] = entries
      .map((e) => {
        const text = e.text?.trim() ?? "";
        if (!text) {
          return null;
        }
        return {
          speaker: e.participant,
          text,
          start: e.startTime ? Date.parse(e.startTime) : undefined,
          end: e.endTime ? Date.parse(e.endTime) : undefined,
        };
      })
      .filter((u): u is MeetSyncUtterance => u != null);
    const transcript = utterances
      .map((u) => (u.speaker ? `${u.speaker}: ${u.text}` : u.text))
      .join("\n");
    return {
      ...base,
      transcript,
      text: transcript,
      utterances,
    };
  } catch {
    return base;
  }
}
