import type {
  VentorScheduleEventTypeApi,
  VentorScheduleStatusApi,
} from "@/services/scheduleService";

/** Row used by schedule list cards (mapped from API + project catalog). */
export interface ScheduleVisitRow {
  id: string;
  /** Schedule row owner (source agent office user id). */
  scheduleOwnerUserId: string;
  /** Assigned on-land attending agent (nullable). */
  onLandAgentUserId: string | null;
  customerId: string;
  clientName: string;
  projectName: string;
  dateYmd: string;
  timeHm: string;
  eventType: VentorScheduleEventTypeApi;
  status: VentorScheduleStatusApi;
  note?: string;
  googleMeetUrl?: string;
  recordingDriveFileId?: string;
  transcriptDriveDocId?: string;
}

export type { VentorScheduleEventTypeApi as ScheduleEventType } from "@/services/scheduleService";
export type { VentorScheduleStatusApi as ScheduleEventStatus } from "@/services/scheduleService";
