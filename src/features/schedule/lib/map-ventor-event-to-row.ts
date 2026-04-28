import type { Project } from "@/data/mockData";
import type { VentorScheduleEventApi } from "@/services/scheduleService";
import type { ScheduleVisitRow } from "@/types/schedule";

type ScheduledAtParts = {
  dateYmd: string;
  timeHm: string;
};

function extractScheduledAtParts(isoDateTime: string): ScheduledAtParts {
  const [datePart = "", timeAndZone = ""] = isoDateTime.split("T");
  const timePart = timeAndZone.slice(0, 5);
  const isDateValid = /^\d{4}-\d{2}-\d{2}$/.test(datePart);
  const isTimeValid = /^\d{2}:\d{2}$/.test(timePart);
  return {
    dateYmd: isDateValid ? datePart : "",
    timeHm: isTimeValid ? timePart : "",
  };
}

export function mapVentorEventToVisitRow(
  ev: VentorScheduleEventApi,
  projects: Project[]
): ScheduleVisitRow {
  const { dateYmd, timeHm } = extractScheduledAtParts(ev.scheduledAt);
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
