import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { patchVentorScheduleOnLandAgentRequest } from "@/features/schedule/store/scheduleSlice";
import { useAppDispatch } from "@/store";
import * as usersOnLandService from "@/services/users-on-land-service";
import type { ActiveOnLandUser } from "@/services/users-on-land-service";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface AssignOnLandAgentDialogProps {
  eventId: string;
  currentOnLandAgentUserId: string | null;
  disabled?: boolean;
}

export function AssignOnLandAgentDialog({
  eventId,
  currentOnLandAgentUserId,
  disabled = false,
}: AssignOnLandAgentDialogProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [agents, setAgents] = useState<ActiveOnLandUser[]>([]);

  useEffect(() => {
    if (!open) {
      return;
    }
    let cancelled = false;
    setLoading(true);
    void usersOnLandService
      .listActiveOnLandUsers()
      .then((rows) => {
        if (!cancelled) {
          setAgents(rows);
        }
      })
      .catch((err: unknown) => {
        const message =
          err instanceof Error && err.message
            ? err.message
            : t("schedule.onLandAgentsLoadFailed");
        toast.error(message);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [open, t]);

  const assign = async (onLandAgentUserId: string | null) => {
    setSaving(true);
    const res = await dispatch(
      patchVentorScheduleOnLandAgentRequest({ eventId, onLandAgentUserId })
    );
    setSaving(false);
    if (patchVentorScheduleOnLandAgentRequest.rejected.match(res)) {
      toast.error(res.payload ?? t("schedule.assignOnLandFailed"));
      return;
    }
    toast.success(t("schedule.assignOnLandSuccess"));
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 text-xs cursor-pointer"
          disabled={disabled}
        >
          {currentOnLandAgentUserId
            ? t("schedule.reassignOnLand")
            : t("schedule.assignOnLand")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("schedule.assignOnLandTitle")}</DialogTitle>
          <DialogDescription>
            {t("schedule.assignOnLandDescription")}
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <p className="text-sm text-muted-foreground">
            {t("schedule.onLandAgentsLoading")}
          </p>
        ) : agents.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("schedule.onLandAgentsEmpty")}
          </p>
        ) : (
          <ul className="space-y-2 max-h-64 overflow-y-auto">
            {agents.map((agent) => (
              <li key={agent.id}>
                <button
                  type="button"
                  className="w-full text-left rounded-lg border border-border px-3 py-2 text-sm hover:bg-secondary/60 cursor-pointer disabled:opacity-50"
                  disabled={saving || agent.id === currentOnLandAgentUserId}
                  onClick={() => void assign(agent.id)}
                >
                  <span className="font-medium text-foreground">
                    {agent.displayName || `${agent.name} ${agent.lastName}`.trim()}
                  </span>
                  {agent.email ? (
                    <span className="block text-xs text-muted-foreground">
                      {agent.email}
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        )}
        {currentOnLandAgentUserId ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="cursor-pointer"
            disabled={saving}
            onClick={() => void assign(null)}
          >
            {t("schedule.clearOnLandAgent")}
          </Button>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
