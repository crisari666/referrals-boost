import { useMemo, useState, type FormEvent } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useAppDispatch } from '@/store';
import { addCustomerEventRequest } from '@/store/clientsSlice';
import type { CustomerEventType } from '@/services/clientsService.types';

type ClientAddEventDialogProps = {
  customerId: string;
};

const EVENT_TYPE_KEYS: Partial<Record<CustomerEventType, string>> = {
  WHATSAPP_CALL: 'clients.eventTypeWhatsappCall',
  WHATSAPP_MESSAGE: 'clients.eventTypeWhatsappMessage',
  PHONE_CALL: 'clients.eventTypePhoneCall',
  VIDEO_CALL: 'clients.eventTypeVideoCall',
  CALL_CRM: 'clients.eventTypeCallCrm',
  CUSTOM_SENT_LAND: 'clients.eventTypeCustomSentLand',
  CUSTOMER_CANCELLED_VISIT_LAND: 'clients.eventTypeCustomerCancelledVisitLand',
  CUSTOMER_VISIT_LAND: 'clients.eventTypeCustomerVisitLand',
};

export function ClientAddEventDialog({ customerId }: ClientAddEventDialogProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [eventType, setEventType] = useState<CustomerEventType>('WHATSAPP_MESSAGE');
  const [description, setDescription] = useState('');
  const [score, setScore] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const eventTypeOptions = useMemo(() => {
    const entries = Object.entries(EVENT_TYPE_KEYS) as [CustomerEventType, string][];
    return entries.map(([value, key]) => ({
      value,
      label: t(key),
    }));
  }, [t]);

  const submitDisabled = useMemo(
    () => submitting || description.trim() === '' || score.trim() === '',
    [description, score, submitting],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedDescription = description.trim();
    if (!trimmedDescription) {
      toast.error(t('clients.eventDescRequired'));
      return;
    }
    if (score.trim() === '') {
      toast.error(t('clients.eventScoreRequired'));
      return;
    }
    const parsedScore = Number(score);
    if (!Number.isFinite(parsedScore) || parsedScore < 0 || parsedScore > 100) {
      toast.error(t('clients.eventScoreRange'));
      return;
    }
    setSubmitting(true);
    try {
      await dispatch(
        addCustomerEventRequest({
          customerId,
          payload: {
            eventType,
            description: trimmedDescription,
            score: parsedScore,
          },
        }),
      ).unwrap();
      setDescription('');
      setScore('');
      setEventType('WHATSAPP_MESSAGE');
      setOpen(false);
      toast.success(t('clients.eventCreatedToast'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t('clients.eventCreateFailed');
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        size="sm"
        className="gap-1.5 gradient-commission text-primary-foreground"
        onClick={() => setOpen(true)}
      >
        <Plus className="w-4 h-4" />
        {t('clients.addEventButton')}
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('clients.addEventTitle')}</DialogTitle>
          <DialogDescription>{t('clients.addEventDialogDescription')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            value={eventType}
            onChange={(e) => setEventType(e.target.value as CustomerEventType)}
            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
            required
            disabled={submitting}
          >
            {eventTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <input
            type="number"
            min={0}
            max={100}
            step={1}
            value={score}
            onChange={(e) => setScore(e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
            placeholder={t('clients.scorePlaceholder')}
            disabled={submitting}
            required
          />
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('clients.descriptionShortLabel')}
            rows={3}
            maxLength={5000}
            disabled={submitting}
            required
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" className="gradient-commission text-primary-foreground" disabled={submitDisabled}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('common.saving')}
                </>
              ) : (
                t('clients.saveEvent')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
