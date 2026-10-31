import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store";
import { setClientList } from "@/store/clientsSlice";
import { patchVentorScheduleCustomerRequest } from "@/features/schedule/store/scheduleSlice";
import { mapApiCustomerToClient } from "@/features/Clients/use-client";
import * as clientsService from "@/services/clientsService";
import { Link2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

type LinkCallCustomerDialogProps = {
  readonly eventId: string;
  readonly currentCustomerId: string;
  readonly disabled?: boolean;
};

export function LinkCallCustomerDialog({
  eventId,
  currentCustomerId,
  disabled = false,
}: LinkCallCustomerDialogProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const clients = useAppSelector((s) => s.clients.list);
  const listSort = useAppSelector((s) => s.clients.listSort);
  const patching = useAppSelector((s) => s.schedule.patchingById[eventId] ?? false);
  const [open, setOpen] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(currentCustomerId);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }
    setSelectedClientId(currentCustomerId);
    let cancelled = false;
    setLoadingList(true);
    void clientsService
      .getCustomersByCreator(listSort)
      .then((res) => {
        if (cancelled || res.error) {
          return;
        }
        dispatch(setClientList((res.result ?? []).map(mapApiCustomerToClient)));
      })
      .catch(() => {
        toast.error(t("schedule.relateClientFailed"));
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingList(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [open, currentCustomerId, dispatch, listSort, t]);

  const filteredClients = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((client) => {
      const name = (client.name ?? "").toLowerCase();
      const phone = (client.phone ?? "").toLowerCase();
      return name.includes(q) || phone.includes(q) || client.id.toLowerCase().includes(q);
    });
  }, [clients, filter]);

  const onSubmit = async (): Promise<void> => {
    if (!selectedClientId.trim()) {
      toast.error(t("schedule.requiredFields"));
      return;
    }
    const result = await dispatch(
      patchVentorScheduleCustomerRequest({
        eventId,
        customerId: selectedClientId,
      })
    );
    if (patchVentorScheduleCustomerRequest.rejected.match(result)) {
      toast.error(result.payload ?? t("schedule.relateClientFailed"));
      return;
    }
    toast.success(t("schedule.relateClientSuccess"));
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
          disabled={disabled || patching}
        >
          <Link2 className="w-3.5 h-3.5 mr-1" />
          {t("schedule.relateClient")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("schedule.relateClientTitle")}</DialogTitle>
          <DialogDescription>{t("schedule.relateClientDescription")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <input
            type="search"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder={t("schedule.selectClientPlaceholder")}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            disabled={loadingList}
          />
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            aria-label={t("schedule.clientLabel")}
            disabled={loadingList}
          >
            {filteredClients.length === 0 ? (
              <option value="">{t("schedule.selectClientPlaceholder")}</option>
            ) : null}
            {filteredClients.map((client) => {
              const label = client.name?.trim() || client.phone || client.id;
              return (
                <option key={client.id} value={client.id}>
                  {label}
                  {client.phone ? ` · ${client.phone}` : ""}
                </option>
              );
            })}
          </select>
          <Button
            type="button"
            className="w-full cursor-pointer"
            disabled={patching || loadingList || !selectedClientId}
            onClick={() => void onSubmit()}
          >
            {t("schedule.relateClient")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
