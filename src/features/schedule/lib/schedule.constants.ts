import type { VentorScheduleEventTypeApi, VentorScheduleStatusApi } from "@/services/scheduleService";

export const VENTOR_SCHEDULE_STATUS_FILTER_METAS: {
  value: VentorScheduleStatusApi | "all";
  labelKey: string;
}[] = [
  { value: "all", labelKey: "schedule.filterAll" },
  { value: "pending", labelKey: "schedule.filterPending" },
  { value: "done", labelKey: "schedule.filterDone" },
  { value: "cancelled", labelKey: "schedule.filterCancelled" },
];

export const VENTOR_SCHEDULE_STATUS_LABEL_KEYS: Record<VentorScheduleStatusApi, string> = {
  pending: "schedule.statusPending",
  done: "schedule.statusDone",
  cancelled: "schedule.statusCancelled",
};

export const VENTOR_SCHEDULE_TYPE_LABEL_KEYS: Record<VentorScheduleEventTypeApi, string> = {
  virtual: "schedule.typeVirtual",
  office: "schedule.typeOffice",
  on_land: "schedule.typeOnLand",
  call: "schedule.typeCall",
};

export const VENTOR_SCHEDULE_STATUS_BADGE_CLASS: Record<
  VentorScheduleStatusApi,
  string
> = {
  pending: "bg-info text-info-foreground",
  done: "bg-success text-success-foreground",
  cancelled: "bg-destructive text-destructive-foreground",
};
