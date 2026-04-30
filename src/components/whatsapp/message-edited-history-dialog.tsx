import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { Pencil } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { getDateFnsLocale } from '@/i18n/date-locale';
import type { WhatsAppMessage } from '@/store/whatsappSlice';

interface MessageEditedHistoryDialogProps {
  message: WhatsAppMessage;
  isMe: boolean;
}

export function MessageEditedHistoryDialog({ message, isMe }: MessageEditedHistoryDialogProps) {
  const { t } = useTranslation();
  const dateLocale = getDateFnsLocale();
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className='flex items-center gap-0.5 hover:opacity-80'>
          <Pencil className={`w-2.5 h-2.5 ${isMe ? 'text-primary-foreground/60' : 'text-muted-foreground'}`} />
          <span className={`text-[10px] ${isMe ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
            {t('whatsapp.editedBadge')}
          </span>
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Pencil className='w-4 h-4 text-primary' />
            {t('whatsapp.editHistoryTitle')}
          </DialogTitle>
        </DialogHeader>
        <div className='space-y-3'>
          {message.editHistory.map((edit, i) => (
            <div key={i} className='bg-secondary p-3 rounded-lg'>
              <p className='text-sm'>{edit.content}</p>
              <p className='text-xs text-muted-foreground mt-1'>
                {format(new Date(edit.editedAt), 'dd/MM/yyyy HH:mm', { locale: dateLocale })}
              </p>
            </div>
          ))}
          <div className='bg-primary/10 p-3 rounded-lg border border-primary/20'>
            <p className='text-sm font-medium'>{message.content}</p>
            <p className='text-xs text-muted-foreground mt-1'>{t('whatsapp.currentVersion')}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
