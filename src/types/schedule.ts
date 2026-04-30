import type {
  VentorScheduleEventTypeApi,
  VentorScheduleStatusApi,
} from "@/services/scheduleService";

/** Row used by schedule list cards (mapped from API + project catalog). */
export interface ScheduleVisitRow {
  id: string;
  /** Schedule row owner (ventor office user id). */
  scheduleOwnerUserId: string;
  customerId: string;
  clientName: string;
  projectName: string;
  dateYmd: string;
  timeHm: string;
  eventType: VentorScheduleEventTypeApi;
  status: VentorScheduleStatusApi;
  note?: string;
}

export type { VentorScheduleEventTypeApi as ScheduleEventType } from "@/services/scheduleService";
export type { VentorScheduleStatusApi as ScheduleEventStatus } from "@/services/scheduleService";
