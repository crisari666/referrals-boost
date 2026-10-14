import { format } from 'date-fns';
import { AlertCircle, Bot, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { LeadConversationMessageItem } from '@/services/leadConversationService.types';

type LeadConversationMessageBubbleProps = {
  message: LeadConversationMessageItem;
};

function MessageMedia({ message }: LeadConversationMessageBubbleProps) {
  const { t } = useTranslation();
  if (!message.mediaUrl) return null;
  if (message.kind === 'image') {
    return (
      <a href={message.mediaUrl} target="_blank" rel="noreferrer" className="block mb-1.5">
        <img src={message.mediaUrl} alt={message.body || t('clients.leadChatAttachment')} className="rounded-lg max-w-[220px] w-full" />
      </a>
    );
  }
  return (
    <a
      href={message.mediaUrl}
      target="_blank"
      rel="noreferrer"
      className="mb-1.5 flex items-center gap-2 rounded-lg bg-background/20 p-2 text-sm underline-offset-2 hover:underline"
    >
      <FileText className="w-4 h-4 shrink-0" />
      {t('clients.leadChatAttachment')}
    </a>
  );
}

/** Read-only bubble: assistant messages on the right (with offered options), customer on the left. */
export function LeadConversationMessageBubble({ message }: LeadConversationMessageBubbleProps) {
  const { t } = useTranslation();
  const isBot = message.direction === 'outbound';
  return (
    <div className={cn('flex min-w-0 mb-2.5', isBot ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'min-w-0 max-w-[85%] rounded-2xl px-3.5 py-2',
          isBot ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-card border border-border rounded-bl-md',
        )}
      >
        {isBot ? (
          <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide opacity-70 mb-0.5">
            <Bot className="w-3 h-3" aria-hidden />
            {t('clients.leadChatBot')}
          </p>
        ) : null}
        <MessageMedia message={message} />
        {message.body ? (
          <p className="text-sm whitespace-pre-line [overflow-wrap:anywhere]">{message.body}</p>
        ) : null}
        {message.options.length > 0 ? (
          <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="options">
            {message.options.map((option) => (
              <li key={option} className="rounded-full border border-primary-foreground/30 px-2.5 py-0.5 text-xs">
                {option}
              </li>
            ))}
          </ul>
        ) : null}
        <div className={cn('mt-1 flex items-center gap-1 text-[10px]', isBot ? 'justify-end opacity-70' : 'text-muted-foreground')}>
          {!message.delivered ? (
            <span className="flex items-center gap-0.5">
              <AlertCircle className="w-3 h-3" aria-hidden />
              {t('clients.leadChatNotDelivered')}
            </span>
          ) : null}
          <time dateTime={message.timestamp}>{format(new Date(message.timestamp), 'dd/MM HH:mm')}</time>
        </div>
      </div>
    </div>
  );
}
