import { format, parseISO } from "date-fns";
import type { Project } from "@/data/mockData";
import type { VentorScheduleEventApi } from "@/services/scheduleService";
import type { ScheduleVisitRow } from "@/types/schedule";

export function mapVentorEventToVisitRow(
  ev: VentorScheduleEventApi,
  projects: Project[]
): ScheduleVisitRow {
  const dt = parseISO(ev.scheduledAt);
  const dateYmd = format(dt, "yyyy-MM-dd");
  const timeHm = format(dt, "HH:mm");
  const lastPid = ev.customer?.lastProjectId?.trim();
  const projectName =
    (lastPid && projects.find((p) => p.id === lastPid)?.title) ??
    (lastPid ? lastPid : "—");
  return {
    id: ev.id,
    customerId: ev.customerId,
    clientName: ev.customer?.displayName?.trim() || "Cliente",
    projectName,
    dateYmd,
    timeHm,
    eventType: ev.eventType,
    status: ev.status,
    note: ev.note,
  };
}
