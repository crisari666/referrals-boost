import type { VentorScheduleEventTypeApi, VentorScheduleStatusApi } from "@/services/scheduleService";

export const VENTOR_SCHEDULE_STATUS_FILTERS: {
  value: VentorScheduleStatusApi | "all";
  label: string;
}[] = [
  { value: "all", label: "Todas" },
  { value: "pending", label: "Pendientes" },
  { value: "done", label: "Hechas" },
  { value: "cancelled", label: "Canceladas" },
];

export const VENTOR_SCHEDULE_STATUS_LABELS: Record<VentorScheduleStatusApi, string> =
  {
    pending: "Pendiente",
    done: "Hecha",
    cancelled: "Cancelada",
  };

export const VENTOR_SCHEDULE_TYPE_LABELS: Record<VentorScheduleEventTypeApi, string> =
  {
    virtual: "Virtual",
    office: "Oficina",
    on_land: "En terreno",
    call: "Llamada",
  };

export const VENTOR_SCHEDULE_STATUS_BADGE_CLASS: Record<
  VentorScheduleStatusApi,
  string
> = {
  pending: "bg-info text-info-foreground",
  done: "bg-success text-success-foreground",
  cancelled: "bg-destructive text-destructive-foreground",
};
