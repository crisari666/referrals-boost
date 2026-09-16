import { useCallback, useEffect, useMemo, useState } from 'react';
import { PieChart as PieChartIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  fetchMineEventsSummaryRequest,
  selectFilteredClients,
} from '@/store/clientsSlice';
import type { CustomerEventType } from '@/services/clientsService.types';
import {
  ClientsStatsPie,
  type ClientsStatsPieSlice,
} from './clients-stats-pie';

const WITHOUT_STEP_KEY = '__without_step__';
const EXCLUDED_STEPS_STORAGE_KEY = 'clients.stats.excludedSteps';
const EXCLUDED_EVENTS_STORAGE_KEY = 'clients.stats.excludedEvents';

const FALLBACK_COLORS = [
  '#2563eb',
  '#16a34a',
  '#f97316',
  '#dc2626',
  '#9333ea',
  '#0ea5e9',
  '#64748b',
  '#ca8a04',
  '#db2777',
  '#0891b2',
] as const;

const EVENT_TYPE_I18N: Partial<Record<CustomerEventType, string>> = {
  WHATSAPP_CALL: 'clients.eventTypeWhatsappCall',
  WHATSAPP_MESSAGE: 'clients.eventTypeWhatsappMessage',
  PHONE_CALL: 'clients.eventTypePhoneCall',
  VIDEO_CALL: 'clients.eventTypeVideoCall',
  CALL_CRM: 'clients.eventTypeCallCrm',
  CUSTOM_SENT_LAND: 'clients.eventTypeCustomSentLand',
  CUSTOMER_CANCELLED_VISIT_LAND: 'clients.eventTypeCustomerCancelledVisitLand',
  CUSTOMER_VISIT_LAND: 'clients.eventTypeCustomerVisitLand',
  CUSTOMER_ON_LAND_AGENT_ASSIGNED: 'clients.eventTypeCustomerOnLandAgentAssigned',
};

function readExcludedSet(storageKey: string): Set<string> {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((item): item is string => typeof item === 'string'));
  } catch {
    return new Set();
  }
}

function writeExcludedSet(storageKey: string, keys: Set<string>): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify([...keys]));
  } catch {
    /* ignore quota / private mode */
  }
}

function colorForIndex(index: number): string {
  return FALLBACK_COLORS[index % FALLBACK_COLORS.length] ?? '#64748b';
}

export function ClientsStatsReport() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [excludedSteps, setExcludedSteps] = useState<Set<string>>(() =>
    readExcludedSet(EXCLUDED_STEPS_STORAGE_KEY),
  );
  const [excludedEvents, setExcludedEvents] = useState<Set<string>>(() =>
    readExcludedSet(EXCLUDED_EVENTS_STORAGE_KEY),
  );
  const filteredClients = useAppSelector(selectFilteredClients);
  const catalog = useAppSelector((s) => s.clients.vendorStepCatalog);
  const eventsSummary = useAppSelector((s) => s.clients.mineEventsSummary);
  const eventsStatus = useAppSelector((s) => s.clients.mineEventsSummaryStatus);
  const eventsError = useAppSelector((s) => s.clients.mineEventsSummaryError);

  useEffect(() => {
    if (!open) return;
    const ids = filteredClients.map((c) => c.id).filter((id) => id.length > 0);
    void dispatch(fetchMineEventsSummaryRequest(ids));
  }, [open, filteredClients, dispatch]);

  const stepSlices = useMemo((): ClientsStatsPieSlice[] => {
    const counts = new Map<string, number>();
    for (const client of filteredClients) {
      const stepId = (client.customerStepId ?? '').trim();
      const key = stepId.length > 0 ? stepId : WITHOUT_STEP_KEY;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    const activeCatalog = [...catalog]
      .filter((s) => s.isActive)
      .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
    const slices: ClientsStatsPieSlice[] = [];
    let colorIndex = 0;
    for (const step of activeCatalog) {
      const count = counts.get(step.id) ?? 0;
      if (count === 0) continue;
      slices.push({
        key: step.id,
        label: step.name,
        count,
        color: step.color?.trim() || colorForIndex(colorIndex),
      });
      colorIndex += 1;
      counts.delete(step.id);
    }
    const withoutCount = counts.get(WITHOUT_STEP_KEY) ?? 0;
    if (withoutCount > 0) {
      slices.push({
        key: WITHOUT_STEP_KEY,
        label: t('clients.statsNoStep'),
        count: withoutCount,
        color: colorForIndex(colorIndex),
      });
      colorIndex += 1;
      counts.delete(WITHOUT_STEP_KEY);
    }
    for (const [key, count] of counts) {
      if (count <= 0) continue;
      const orphan = catalog.find((s) => s.id === key);
      slices.push({
        key,
        label: orphan?.name ?? key,
        count,
        color: orphan?.color?.trim() || colorForIndex(colorIndex),
      });
      colorIndex += 1;
    }
    return slices.sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  }, [filteredClients, catalog, t]);

  const eventSlices = useMemo((): ClientsStatsPieSlice[] => {
    return eventsSummary.map((row, index) => {
      const i18nKey = EVENT_TYPE_I18N[row.eventType];
      return {
        key: row.eventType,
        label: i18nKey ? t(i18nKey) : row.eventType,
        count: row.count,
        color: colorForIndex(index),
      };
    });
  }, [eventsSummary, t]);

  const toggleStep = useCallback((key: string) => {
    setExcludedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      writeExcludedSet(EXCLUDED_STEPS_STORAGE_KEY, next);
      return next;
    });
  }, []);

  const toggleEvent = useCallback((key: string) => {
    setExcludedEvents((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      writeExcludedSet(EXCLUDED_EVENTS_STORAGE_KEY, next);
      return next;
    });
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t('clients.statsOpenAria')}
        className="w-10 h-10 rounded-xl border border-border bg-card flex items-center justify-center shadow-sm cursor-pointer transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
      >
        <PieChartIcon className="w-5 h-5 text-foreground" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('clients.statsTitle')}</DialogTitle>
            <DialogDescription>
              {t('clients.statsBasedOnCount', { count: filteredClients.length })}
            </DialogDescription>
          </DialogHeader>

          {filteredClients.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">
              {t('clients.statsEmptyClients')}
            </p>
          ) : (
            <Tabs defaultValue="steps" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="steps" className="cursor-pointer">
                  {t('clients.statsTabSteps')}
                </TabsTrigger>
                <TabsTrigger value="events" className="cursor-pointer">
                  {t('clients.statsTabEvents')}
                </TabsTrigger>
              </TabsList>
              <p className="mt-3 text-xs text-muted-foreground">{t('clients.statsExcludeHint')}</p>
              <TabsContent value="steps" className="mt-3">
                <ClientsStatsPie
                  slices={stepSlices}
                  excludedKeys={excludedSteps}
                  onToggleKey={toggleStep}
                  emptyLabel={t('clients.statsEmptyClients')}
                />
              </TabsContent>
              <TabsContent value="events" className="mt-3 space-y-2">
                <p className="text-xs text-muted-foreground">{t('clients.statsEventsSubtitle')}</p>
                {eventsStatus === 'loading' ? (
                  <p className="text-sm text-muted-foreground text-center py-10">
                    {t('clients.statsLoadingEvents')}
                  </p>
                ) : eventsStatus === 'failed' ? (
                  <p className="text-sm text-destructive text-center py-10">
                    {eventsError ?? t('clients.statsEventsLoadFailed')}
                  </p>
                ) : (
                  <ClientsStatsPie
                    slices={eventSlices}
                    excludedKeys={excludedEvents}
                    onToggleKey={toggleEvent}
                    emptyLabel={t('clients.statsEmptyEvents')}
                  />
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
