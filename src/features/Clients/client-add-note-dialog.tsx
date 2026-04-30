import { useState, type FormEvent } from 'react';
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
import { addCustomerNoteRequest } from '@/store/clientsSlice';

type ClientAddNoteDialogProps = {
  customerId: string;
};

export function ClientAddNoteDialog({ customerId }: ClientAddNoteDialogProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = noteText.trim();
    if (!trimmed) {
      toast.error(t('clients.noteRequiredToast'));
      return;
    }
    setSubmitting(true);
    try {
      await dispatch(addCustomerNoteRequest({ customerId, note: trimmed })).unwrap();
      setNoteText('');
      setOpen(false);
      toast.success(t('clients.noteAddedToast'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t('clients.storeNoteAddFailed');
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
        {t('clients.addNoteTitle')}
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('clients.addNoteTitle')}</DialogTitle>
          <DialogDescription>{t('clients.addNoteDescription')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder={t('clients.addNotePlaceholder')}
            rows={5}
            maxLength={1500}
            disabled={submitting}
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" className="gradient-commission text-primary-foreground" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('common.saving')}
                </>
              ) : (
                t('clients.saveNote')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
