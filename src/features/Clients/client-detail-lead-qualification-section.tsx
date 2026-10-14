import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarClock, MessageCircle, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { LeadConversationStatus } from '@/services/leadConversationService.types';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchLeadConversationSummary } from './store/lead-conversation-slice';
import { LeadConversationChatSheet } from './lead-conversation-chat-sheet';
import { LeadScoreMeter } from './lead-score-meter';

const STATUS_LABEL_KEYS: Record<LeadConversationStatus, string> = {
  active: 'clients.leadStatusActive',
  scheduled: 'clients.leadStatusScheduled',
  disqualified: 'clients.leadStatusDisqualified',
  abandoned: 'clients.leadStatusAbandoned',
};

const PRIORITY_LABEL_KEYS: Record<number, string> = {
  3: 'clients.leadPriorityHigh',
  2: 'clients.leadPriorityMedium',
  1: 'clients.leadPriorityLow',
};

const SCHEDULED_CALL_ITEM_KEY = 'fechaLlamada';

const callDateFormatter = new Intl.DateTimeFormat('es-CO', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  hour: 'numeric',
  minute: '2-digit',
  timeZone: 'America/Bogota',
});

const cardMotion = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: 0.06 },
} as const;

function SectionHeading() {
  const { t } = useTranslation();
  return (
    <div className="flex items-start gap-2">
      <Sparkles className="w-4 h-4 text-primary mt-1 shrink-0" aria-hidden />
      <div>
        <h3 className="font-bold text-foreground">{t('clients.leadQualificationTitle')}</h3>
        <p className="text-xs text-muted-foreground">{t('clients.leadQualificationSubtitle')}</p>
      </div>
    </div>
  );
}

function ScheduledCallCallout({ isoDate }: { isoDate: string }) {
  const { t } = useTranslation();
  return (
    <div className="mt-5 flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
      <CalendarClock className="w-5 h-5 text-primary shrink-0" aria-hidden />
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{t('clients.leadScheduledCallLabel')}</p>
        <p className="text-sm font-semibold text-foreground first-letter:uppercase">
          <time dateTime={isoDate}>{callDateFormatter.format(new Date(isoDate))}</time>
        </p>
      </div>
    </div>
  );
}

function QualificationSkeleton() {
  return (
    <motion.div {...cardMotion} className="bg-card rounded-2xl p-5 border border-border shadow-sm space-y-4">
      <SectionHeading />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
    </motion.div>
  );
}

/** AI WhatsApp qualification (score, answers) with access to the full assistant transcript. */
export function ClientDetailLeadQualificationSection() {
  const { t } = useTranslation();
  const { id: routeId } = useParams();
  const dispatch = useAppDispatch();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const status = useAppSelector((s) => s.leadConversation.summaryStatus);
  const error = useAppSelector((s) => s.leadConversation.summaryError);
  const summary = useAppSelector((s) =>
    routeId && s.leadConversation.customerId === routeId ? s.leadConversation.summary : null,
  );
  useEffect(() => {
    if (!routeId) return;
    const req = dispatch(fetchLeadConversationSummary(routeId));
    return () => req.abort();
  }, [routeId, dispatch]);
  if (!routeId) return null;
  if (status === 'loading' && summary === null) return <QualificationSkeleton />;
  if (status === 'failed' && summary === null) {
    return (
      <motion.div {...cardMotion} className="bg-card rounded-2xl p-5 border border-destructive/30 shadow-sm">
        <SectionHeading />
        <p className="text-sm text-destructive mt-3">{error}</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={() => void dispatch(fetchLeadConversationSummary(routeId))}>
          {t('clients.leadQualificationRetry')}
        </Button>
      </motion.div>
    );
  }
  if (!summary?.hasSession) {
    return (
      <motion.div {...cardMotion} className="bg-card rounded-2xl p-5 border border-dashed border-border shadow-sm">
        <SectionHeading />
        <p className="text-sm text-foreground mt-3">{t('clients.leadQualificationEmpty')}</p>
        <p className="text-xs text-muted-foreground mt-1">{t('clients.leadQualificationEmptyHint')}</p>
      </motion.div>
    );
  }
  const isDisqualified = summary.status === 'disqualified';
  const priorityKey = PRIORITY_LABEL_KEYS[summary.priority];
  const scheduledCallAt = summary.answers.fechaLlamada;
  const detailItems = summary.items.filter((item) => item.key !== SCHEDULED_CALL_ITEM_KEY);
  return (
    <motion.div {...cardMotion} className="bg-card rounded-2xl p-5 border border-border shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <SectionHeading />
        <div className="flex flex-wrap gap-1.5">
          {summary.status ? (
            <span
              className={cn(
                'rounded-full px-2.5 py-0.5 text-xs font-medium',
                summary.status === 'scheduled' && 'bg-primary/10 text-primary',
                summary.status === 'active' && 'bg-secondary text-secondary-foreground',
                isDisqualified && 'bg-destructive/10 text-destructive',
                summary.status === 'abandoned' && 'bg-muted text-muted-foreground',
              )}
            >
              {t(STATUS_LABEL_KEYS[summary.status])}
            </span>
          ) : null}
          {priorityKey ? (
            <span className="rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-foreground">
              {t(priorityKey)}
            </span>
          ) : null}
        </div>
      </div>
      <LeadScoreMeter score={summary.score} maxScore={summary.maxScore} answers={summary.answers} isMuted={isDisqualified} />
      {scheduledCallAt ? <ScheduledCallCallout isoDate={scheduledCallAt} /> : null}
      {detailItems.length > 0 ? (
        <dl className="mt-5 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
          {detailItems.map((item) => (
            <div key={item.key} className="border-b border-border/60 pb-3 sm:border-0 sm:pb-0">
              <dt className="text-xs font-medium text-muted-foreground">{item.label}</dt>
              <dd className="text-sm text-foreground mt-0.5 break-words">{item.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      <Button variant="outline" className="mt-5 w-full sm:w-auto gap-2" onClick={() => setIsChatOpen(true)}>
        <MessageCircle className="w-4 h-4" aria-hidden />
        {t('clients.leadViewConversation')}
      </Button>
      <LeadConversationChatSheet customerId={routeId} open={isChatOpen} onOpenChange={setIsChatOpen} />
    </motion.div>
  );
}
