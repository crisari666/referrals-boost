/**
 * Ventor agenda — customers-ms `ventor-schedule` REST API.
 */

import * as http from "@/lib/http";
import { customersMsUrl, withCustomersMsAuth } from "@/services/clientsService";

/** Query `view` for GET `ventor-schedule/by-day` (customers-ms). */
export const VENTOR_SCHEDULE_BY_DAY_VIEW = {
  Self: "self",
  MainLeadOnLand: "main_lead_on_land",
} as const;

export type VentorScheduleEventTypeApi =
  | "virtual"
  | "office"
  | "on_land"
  | "call";

export type VentorScheduleStatusApi = "pending" | "done" | "cancelled";

export type VentorScheduleCustomerEmbed = {
  id: string;
  displayName: string;
  lastProjectId?: string;
} | null;

export type VentorScheduleEventApi = {
  id: string;
  userId: string;
  onLandAgentUserId?: string | null;
  customerId: string;
  scheduledAt: string;
  eventType: VentorScheduleEventTypeApi;
  note?: string;
  googleMeetUrl?: string;
  googleCalendarEventId?: string;
  customerEmail?: string;
  ventorEmail?: string;
  meetSpaceId?: string;
  organizerEmail?: string;
  meetSubscriptionStatus?: string;
  recordingDriveFileId?: string;
  transcriptDriveDocId?: string;
  status: VentorScheduleStatusApi;
  createdAt?: string;
  updatedAt?: string;
  customer?: VentorScheduleCustomerEmbed;
};

export type CreateVentorSchedulePayload = {
  customerId: string;
  date: string;
  time: string;
  eventType: VentorScheduleEventTypeApi;
  note?: string;
  customerEmail?: string;
  ventorEmail?: string;
};

export async function listVentorScheduleByCustomer(
  customerId: string
): Promise<VentorScheduleEventApi[]> {
  return http.get<VentorScheduleEventApi[]>("", {
    ...withCustomersMsAuth(),
    url: customersMsUrl(
      `ventor-schedule/by-customer/${encodeURIComponent(customerId)}`
    ),
  });
}

export async function listVentorScheduleByDay(
  dateYmd: string
): Promise<VentorScheduleEventApi[]> {
  return http.get<VentorScheduleEventApi[]>("", {
    ...withCustomersMsAuth(),
    url: customersMsUrl("ventor-schedule/by-day"),
    params: { date: dateYmd },
  });
}

export async function listMainLeadOnLandScheduleByDay(
  dateYmd: string
): Promise<VentorScheduleEventApi[]> {
  return http.get<VentorScheduleEventApi[]>("", {
    ...withCustomersMsAuth(),
    url: customersMsUrl("ventor-schedule/by-day"),
    params: { date: dateYmd, view: VENTOR_SCHEDULE_BY_DAY_VIEW.MainLeadOnLand },
  });
}

export async function createVentorScheduleEvent(
  payload: CreateVentorSchedulePayload
): Promise<VentorScheduleEventApi> {
  return http.post<VentorScheduleEventApi>("", payload, {
    ...withCustomersMsAuth(),
    url: customersMsUrl("ventor-schedule"),
  });
}

export async function patchVentorScheduleStatus(
  eventId: string,
  status: VentorScheduleStatusApi
): Promise<VentorScheduleEventApi> {
  return http.patch<VentorScheduleEventApi>(
    "",
    { status },
    {
      ...withCustomersMsAuth(),
      url: customersMsUrl(
        `ventor-schedule/${encodeURIComponent(eventId)}/status`
      ),
    }
  );
}

export async function patchVentorScheduleOnLandAgent(
  eventId: string,
  onLandAgentUserId: string | null
): Promise<VentorScheduleEventApi> {
  return http.patch<VentorScheduleEventApi>(
    "",
    { onLandAgentUserId },
    {
      ...withCustomersMsAuth(),
      url: customersMsUrl(
        `ventor-schedule/${encodeURIComponent(eventId)}/on-land-agent`
      ),
    }
  );
}

export type SyncVentorMeetCallPayload = {
  attendance: "attended" | "no_answer";
  conferenceRecordName?: string;
  durationSeconds?: number;
  transcript?: string;
  text?: string;
  utterances?: Array<{
    speaker?: string;
    text: string;
    start?: number;
    end?: number;
  }>;
  endedAt?: string;
};

export async function syncVentorMeetCall(
  eventId: string,
  payload: SyncVentorMeetCallPayload
): Promise<unknown> {
  return http.post("", payload, {
    ...withCustomersMsAuth(),
    url: customersMsUrl(
      `ventor-schedule/${encodeURIComponent(eventId)}/meet-sync`
    ),
  });
}

export type RefreshVentorMeetArtifactsResult = {
  schedule: VentorScheduleEventApi;
  callLog: unknown;
};

export async function refreshVentorMeetArtifacts(
  eventId: string
): Promise<RefreshVentorMeetArtifactsResult> {
  return http.post("", {}, {
    ...withCustomersMsAuth(),
    url: customersMsUrl(
      `ventor-schedule/${encodeURIComponent(eventId)}/meet-artifacts/refresh`
    ),
  });
}
