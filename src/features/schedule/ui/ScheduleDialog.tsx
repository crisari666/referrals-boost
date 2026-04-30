import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  createVentorScheduleEventRequest,
  fetchVentorScheduleByDay,
} from "@/features/schedule/store/scheduleSlice";
import { CalendarPlus, Building2, MapPin, MonitorSmartphone, Phone } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import type { VentorScheduleEventTypeApi } from "@/services/scheduleService";
import { VENTOR_SCHEDULE_TYPE_LABEL_KEYS } from "@/features/schedule/lib/schedule.constants";
import { useTranslation } from "react-i18next";

interface ScheduleDialogProps {
  clientId?: string;
  trigger?: React.ReactNode;
}

const ScheduleDialog = ({ clientId, trigger }: ScheduleDialogProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const clients = useAppSelector((s) => s.clients.list);
  const projects = useAppSelector((s) => s.projects.list);
  const creating = useAppSelector((s) => s.schedule.creating);
  const [open, setOpen] = useState(false);

  const [selectedClient, setSelectedClient] = useState(clientId ?? "");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [type, setType] = useState<VentorScheduleEventTypeApi>("office");
  const [notes, setNotes] = useState("");

  const eventTypes = useMemo(
    (): { value: VentorScheduleEventTypeApi; label: string; Icon: LucideIcon }[] => [
      { value: "office", label: t(VENTOR_SCHEDULE_TYPE_LABEL_KEYS.office), Icon: Building2 },
      { value: "on_land", label: t(VENTOR_SCHEDULE_TYPE_LABEL_KEYS.on_land), Icon: MapPin },
      { value: "virtual", label: t(VENTOR_SCHEDULE_TYPE_LABEL_KEYS.virtual), Icon: MonitorSmartphone },
      { value: "call", label: t(VENTOR_SCHEDULE_TYPE_LABEL_KEYS.call), Icon: Phone },
    ],
    [t],
  );

  const client = clients.find((c) => c.id === selectedClient);
  const project = client
    ? projects.find((p) => p.id === client.projectInterest)
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !date || !time) {
      toast.error(t("schedule.requiredFields"));
      return;
    }

    const resultAction = await dispatch(
      createVentorScheduleEventRequest({
        customerId: selectedClient,
        date,
        time,
        eventType: type,
        ...(notes.trim() ? { note: notes.trim() } : {}),
      })
    );

    if (createVentorScheduleEventRequest.rejected.match(resultAction)) {
      toast.error(resultAction.payload ?? t("schedule.scheduleFailed"));
      return;
    }

    toast.success(t("schedule.scheduleSuccess"));
    void dispatch(fetchVentorScheduleByDay(date));
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    if (!clientId) setSelectedClient("");
    setDate("");
    setTime("10:00");
    setType("office");
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" className="gap-2 cursor-pointer">
            <CalendarPlus className="w-4 h-4" />
            {t("schedule.scheduleVisit")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("schedule.dialogTitle")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 mt-2">
          {!clientId && (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                {t("schedule.clientLabel")}
              </label>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="form-input cursor-pointer"
                required
              >
                <option value="">{t("schedule.selectClientPlaceholder")}</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {client && (
            <div className="bg-secondary/30 rounded-xl px-4 py-3 text-sm">
              <p className="font-semibold text-foreground">{client.name}</p>
              <p className="text-xs text-muted-foreground">{project?.title}</p>
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">
              {t("schedule.eventTypeLabel")}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {eventTypes.map((vt) => (
                <button
                  key={vt.value}
                  type="button"
                  onClick={() => setType(vt.value)}
                  className={`flex flex-col items-center gap-1 rounded-xl py-3 border transition-all cursor-pointer ${
                    type === vt.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-muted-foreground hover:bg-secondary/40"
                  }`}
                >
                  <vt.Icon className="w-5 h-5" />
                  <span className="text-[11px] font-medium">{vt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                {t("schedule.visitDateLabel")}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="form-input"
                required
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                {t("schedule.visitTimeLabel")}
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="form-input"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              {t("schedule.visitNotesLabel")}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("schedule.visitNotesPlaceholder")}
              className="form-input min-h-[80px] resize-none"
            />
          </div>

          <Button type="submit" className="w-full cursor-pointer" disabled={creating}>
            {creating ? t("common.saving") : t("schedule.confirmVisit")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleDialog;
