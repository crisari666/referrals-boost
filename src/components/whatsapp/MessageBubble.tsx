import { useState } from 'react';
import { format } from 'date-fns';
import { Check, CheckCheck, Clock, FileText, Image, Mic } from 'lucide-react';

import { MessageDeletedIndicator } from '@/components/whatsapp/message-deleted-indicator';
import { MessageEditedHistoryDialog } from '@/components/whatsapp/message-edited-history-dialog';
import type { WhatsAppMessage } from '@/store/whatsappSlice';

interface MessageBubbleProps {
  message: WhatsAppMessage;
}

const StatusIcon = ({ status }: { status: WhatsAppMessage['status'] }) => {
  switch (status) {
    case 'sending':
      return <Clock className='w-3 h-3 text-muted-foreground' />;
    case 'sent':
      return <Check className='w-3 h-3 text-muted-foreground' />;
    case 'delivered':
      return <CheckCheck className='w-3 h-3 text-muted-foreground' />;
    case 'read':
      return <CheckCheck className='w-3 h-3 text-info' />;
  }
};

const MediaContent = ({ message }: { message: WhatsAppMessage }) => {
  switch (message.type) {
    case 'image':
      return (
        <div className='mb-1'>
          <img src={message.mediaUrl} alt={message.content} className='rounded-lg max-w-[240px] w-full' />
        </div>
      );
    case 'video':
      return (
        <div className='mb-1 flex items-center gap-2 bg-secondary/50 rounded-lg p-3'>
          <Image className='w-5 h-5 text-primary' />
          <span className='text-sm'>Video</span>
        </div>
      );
    case 'document':
      return (
        <div className='mb-1 flex items-center gap-2 bg-secondary/50 rounded-lg p-3'>
          <FileText className='w-5 h-5 text-primary' />
          <span className='text-sm truncate'>{message.mediaName || 'Documento'}</span>
        </div>
      );
    case 'voice':
    case 'audio':
      return (
        <div className='mb-1 flex items-center gap-2 bg-secondary/50 rounded-lg p-3'>
          <Mic className='w-5 h-5 text-primary' />
          <div className='flex-1 h-1 bg-muted rounded-full'>
            <div className='h-1 bg-primary rounded-full w-2/3' />
          </div>
          <span className='text-xs text-muted-foreground'>0:12</span>
        </div>
      );
    default:
      return null;
  }
};

const MessageBubble = ({ message }: MessageBubbleProps) => {
  const [showOriginal, setShowOriginal] = useState(false);
  const isMe = message.sender === 'me';

  return (
    <div className={`flex min-w-0 ${isMe ? 'justify-end' : 'justify-start'} mb-2 px-4`}>
      <div
        className={`min-w-0 max-w-[min(90%)] rounded-2xl px-4 py-2 ${
          message.isDeleted
            ? 'bg-destructive/10 border border-destructive/20'
            : isMe
              ? 'bg-primary text-primary-foreground'
              : 'bg-card border border-border'
        }`}
      >
        {message.isDeleted === true && (
          <MessageDeletedIndicator message={message} />
        )}

        <MediaContent message={message} />

        <p
          className={`text-sm min-w-0 max-w-full break-all [overflow-wrap:anywhere] ${
            message.isDeleted ? 'italic text-muted-foreground' : ''
          }`}
        >
          {showOriginal && message.editHistory.length > 0
            ? message.editHistory[message.editHistory.length - 1].content
            : message.content}
        </p>

        <div className={`flex items-center gap-1.5 mt-1 ${isMe ? 'justify-end' : ''}`}>
          {message.isEdited && !message.isDeleted && (
            <MessageEditedHistoryDialog message={message} isMe={isMe} />
          )}

          <span className={`text-[10px] ${isMe ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
            {format(new Date(message.timestamp), 'HH:mm')}
          </span>
          {isMe && <StatusIcon status={message.status} />}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
