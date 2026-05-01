import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarClock } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchVendorScheduleByCustomer } from '@/store/clientsSlice';
import type { VentorScheduleEventApi } from '@/services/scheduleService';
import { formatDetailDate } from './client-detail-formatters';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export type ClientDetailScheduleDialogProps = {
  readonly customerId: string;
  readonly isMock: boolean;
};

function scheduleTypeLabel(
  t: (k: string) => string,
  eventType: VentorScheduleEventApi['eventType']
): string {
  if (eventType === 'virtual') return t('clients.scheduleTypeVirtual');
  if (eventType === 'office') return t('clients.scheduleTypeOffice');
  if (eventType === 'on_land') return t('clients.scheduleTypeOnLand');
  return t('clients.scheduleTypeCall');
}

function scheduleStatusLabel(
  t: (k: string) => string,
  status: VentorScheduleEventApi['status']
): string {
  if (status === 'pending') return t('clients.scheduleStatusPending');
  if (status === 'done') return t('clients.scheduleStatusDone');
  return t('clients.scheduleStatusCancelled');
}

function statusBadgeClass(status: VentorScheduleEventApi['status']): string {
  if (status === 'done') return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400';
  if (status === 'cancelled') return 'bg-muted text-muted-foreground';
  return 'bg-amber-500/15 text-amber-800 dark:text-amber-300';
}

export function ClientDetailScheduleDialog({
  customerId,
  isMock,
}: ClientDetailScheduleDialogProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const status = useAppSelector((s) => s.clients.vendorScheduleEventsStatus);
  const error = useAppSelector((s) => s.clients.vendorScheduleEventsError);
  const events = useAppSelector((s) => {
    if (s.clients.vendorScheduleEventsCustomerId !== customerId) return [];
    return s.clients.vendorScheduleEvents;
  });

  useEffect(() => {
    if (isMock || !customerId) return;
    const task = dispatch(fetchVendorScheduleByCustomer(customerId));
    return () => {
      task.abort();
    };
  }, [customerId, isMock, dispatch]);

  const pendingCount = useMemo(
    () => events.filter((ev) => ev.status === 'pending').length,
    [events]
  );

  const pendingLabel =
    pendingCount > 99 ? '99+' : pendingCount > 0 ? String(pendingCount) : null;

  const triggerAriaLabel = useMemo(() => {
    if (pendingCount <= 0) {
      return t('clients.scheduleDialogTriggerAria');
    }
    const n = pendingCount > 99 ? 99 : pendingCount;
    return t('clients.scheduleDialogTriggerAriaPending', { count: n });
  }, [pendingCount, t]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="relative h-9 w-9 shrink-0 rounded-full border-border bg-card cursor-pointer transition-colors hover:bg-accent"
          aria-label={triggerAriaLabel}
        >
          <CalendarClock className="h-4 w-4 text-foreground" aria-hidden />
          {pendingLabel ? (
            <span
              className="absolute -right-0.5 -top-0.5 flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-none text-destructive-foreground shadow-sm"
              aria-hidden
            >
              {pendingLabel}
            </span>
          ) : null}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-md gap-0 overflow-hidden p-0 sm:rounded-xl">
        <DialogHeader className="border-b border-border px-6 py-4 text-left">
          <DialogTitle className="flex items-center gap-2 pr-8 text-base">
            <CalendarClock className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            {t('clients.scheduleSectionTitle')}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {isMock ? t('clients.scheduleMockHint') : t('clients.scheduleDialogDescription')}
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[min(60vh,28rem)] overflow-y-auto px-6 py-4">
          {isMock ? (
            <p className="text-sm text-muted-foreground">{t('clients.scheduleMockHint')}</p>
          ) : null}
          {!isMock && status === 'loading' ? (
            <p className="text-sm text-muted-foreground">{t('clients.scheduleLoading')}</p>
          ) : null}
          {!isMock && status === 'failed' && error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : null}
          {!isMock && status === 'succeeded' && events.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('clients.scheduleEmpty')}</p>
          ) : null}
          {!isMock && events.length > 0 ? (
            <ul className="space-y-3">
              {events.map((ev) => (
                <li
                  key={ev.id}
                  className="flex flex-col gap-1 rounded-xl border border-border/80 bg-muted/30 px-3 py-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-medium text-foreground">
                      {formatDetailDate(ev.scheduledAt)}
                    </span>
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-md ${statusBadgeClass(ev.status)}`}
                    >
                      {scheduleStatusLabel(t, ev.status)}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {scheduleTypeLabel(t, ev.eventType)}
                  </div>
                  {ev.note?.trim() ? (
                    <p className="text-xs text-foreground/90 line-clamp-2">{ev.note.trim()}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
