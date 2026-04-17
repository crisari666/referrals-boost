import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Pencil } from 'lucide-react';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { WhatsAppMessage } from '@/store/whatsappSlice';

interface MessageEditedHistoryDialogProps {
  message: WhatsAppMessage;
  isMe: boolean;
}

export function MessageEditedHistoryDialog({ message, isMe }: MessageEditedHistoryDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className='flex items-center gap-0.5 hover:opacity-80'>
          <Pencil className={`w-2.5 h-2.5 ${isMe ? 'text-primary-foreground/60' : 'text-muted-foreground'}`} />
          <span className={`text-[10px] ${isMe ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
            editado
          </span>
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Pencil className='w-4 h-4 text-primary' />
            Historial de ediciones
          </DialogTitle>
        </DialogHeader>
        <div className='space-y-3'>
          {message.editHistory.map((edit, i) => (
            <div key={i} className='bg-secondary p-3 rounded-lg'>
              <p className='text-sm'>{edit.content}</p>
              <p className='text-xs text-muted-foreground mt-1'>
                {format(new Date(edit.editedAt), 'dd/MM/yyyy HH:mm', { locale: es })}
              </p>
            </div>
          ))}
          <div className='bg-primary/10 p-3 rounded-lg border border-primary/20'>
            <p className='text-sm font-medium'>{message.content}</p>
            <p className='text-xs text-muted-foreground mt-1'>Versión actual</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
