/**
 * Ventor agenda — customers-ms `ventor-schedule` REST API.
 */

import * as http from "@/lib/http";
import { customersMsUrl, withCustomersMsAuth } from "@/services/clientsService";

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
  customerId: string;
  scheduledAt: string;
  eventType: VentorScheduleEventTypeApi;
  note?: string;
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
};

export async function listVentorScheduleByDay(
  dateYmd: string
): Promise<VentorScheduleEventApi[]> {
  return http.get<VentorScheduleEventApi[]>("", {
    ...withCustomersMsAuth(),
    url: customersMsUrl("ventor-schedule/by-day"),
    params: { date: dateYmd },
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
