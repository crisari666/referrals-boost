import {
  VENTOR_SCHEDULE_STATUS_BADGE_CLASS,
  VENTOR_SCHEDULE_STATUS_LABELS,
  VENTOR_SCHEDULE_TYPE_LABELS,
} from "@/features/schedule/lib/schedule.constants";
import { patchVentorScheduleStatusRequest } from "@/features/schedule/store/scheduleSlice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppDispatch, useAppSelector } from "@/store";
import type { ScheduleVisitRow } from "@/types/schedule";
import type { VentorScheduleEventTypeApi, VentorScheduleStatusApi } from "@/services/scheduleService";
import {
  Building2,
  Clock,
  MapPin,
  MonitorSmartphone,
  Phone,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface VisitCardProps {
  visit: ScheduleVisitRow;
}

function EventTypeIcon({ type }: { type: VentorScheduleEventTypeApi }) {
  const cls = "w-5 h-5 shrink-0 text-primary";
  switch (type) {
    case "office":
      return <Building2 className={cls} />;
    case "on_land":
      return <MapPin className={cls} />;
    case "virtual":
      return <MonitorSmartphone className={cls} />;
    case "call":
      return <Phone className={cls} />;
    default:
      return <MapPin className={cls} />;
  }
}

const VisitCard = ({ visit }: VisitCardProps) => {
  const dispatch = useAppDispatch();
  const patching = useAppSelector((s) => s.schedule.patchingById[visit.id] ?? false);

  const onStatusChange = async (value: string) => {
    const status = value as VentorScheduleStatusApi;
    const res = await dispatch(
      patchVentorScheduleStatusRequest({ eventId: visit.id, status })
    );
    if (patchVentorScheduleStatusRequest.rejected.match(res)) {
      toast.error(res.payload ?? "No se pudo actualizar");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl p-4 border border-border shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <EventTypeIcon type={visit.eventType} />
          <div className="min-w-0">
            <Link
              to={`/clients/${visit.customerId}`}
              className="font-semibold text-foreground text-sm hover:text-primary transition-colors cursor-pointer"
            >
              {visit.clientName}
            </Link>
            <p className="text-xs text-muted-foreground truncate">{visit.projectName}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${VENTOR_SCHEDULE_STATUS_BADGE_CLASS[visit.status]}`}
          >
            {VENTOR_SCHEDULE_STATUS_LABELS[visit.status]}
          </span>
          <Select
            value={visit.status}
            onValueChange={(v) => void onStatusChange(v)}
            disabled={patching}
          >
            <SelectTrigger
              className="h-8 w-[140px] text-xs cursor-pointer"
              aria-label="Cambiar estado de la visita"
            >
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(VENTOR_SCHEDULE_STATUS_LABELS) as VentorScheduleStatusApi[]).map(
                (st) => (
                  <SelectItem key={st} value={st} className="text-xs cursor-pointer">
                    {VENTOR_SCHEDULE_STATUS_LABELS[st]}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 shrink-0" />
          {visit.timeHm}
        </span>
        <span className="flex items-center gap-1 min-w-0">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{VENTOR_SCHEDULE_TYPE_LABELS[visit.eventType]}</span>
        </span>
      </div>

      {visit.note ? (
        <p className="mt-2 text-xs text-muted-foreground bg-secondary/50 rounded-lg px-3 py-2">
          {visit.note}
        </p>
      ) : null}
    </motion.div>
  );
};

export default VisitCard;
