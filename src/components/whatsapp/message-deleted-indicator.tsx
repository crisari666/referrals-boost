import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { getDateFnsLocale } from '@/i18n/date-locale';
import type { WhatsAppMessage } from '@/store/whatsappSlice';

interface MessageDeletedIndicatorProps {
  message: WhatsAppMessage;
}

export function MessageDeletedIndicator({ message }: MessageDeletedIndicatorProps) {
  const { t } = useTranslation();
  const dateLocale = getDateFnsLocale();
  const deletedAtFormatted =
    message.deletedAt != null
      ? format(new Date(message.deletedAt), 'dd/MM/yyyy HH:mm', { locale: dateLocale })
      : '';
  return (
    <div className='flex items-center gap-1.5 mb-1'>
      <Trash2 className='w-3 h-3 text-destructive' />
      <span className='text-xs font-medium text-destructive'>{t('whatsapp.deletedMessage')}</span>
      {message.originalContent && <Dialog>
        <DialogTrigger asChild>
          <Button variant='ghost' size='sm' className='h-5 px-1.5 text-xs text-destructive hover:text-destructive'>
            <Eye className='w-3 h-3 mr-1' />
            {t('whatsapp.viewOriginal')}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Trash2 className='w-4 h-4 text-destructive' />
              {t('whatsapp.deletedDialogTitle')}
            </DialogTitle>
          </DialogHeader>
          <div className='space-y-3'>
            <div>
              <p className='text-xs text-muted-foreground mb-1'>{t('whatsapp.originalContentLabel')}</p>
              <p className='bg-secondary p-3 rounded-lg text-sm'>{message.originalContent}</p>
            </div>
            <p className='text-xs text-muted-foreground'>
              {t('whatsapp.deletedAtPrefix')} {deletedAtFormatted}
            </p>
          </div>
        </DialogContent>
      </Dialog>}
    </div>
  );
}
