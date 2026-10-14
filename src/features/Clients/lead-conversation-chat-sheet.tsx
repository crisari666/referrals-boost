import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchLeadConversationMessages } from './store/lead-conversation-slice';
import { LeadConversationMessageBubble } from './lead-conversation-message-bubble';

type LeadConversationChatSheetProps = {
  customerId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const SKELETON_ROWS = ['w-2/3 ml-auto', 'w-1/2', 'w-3/4 ml-auto', 'w-2/5'] as const;

function ChatSkeleton() {
  return (
    <div className="space-y-3 p-4" aria-hidden>
      {SKELETON_ROWS.map((widthClass) => (
        <Skeleton key={widthClass} className={`h-14 rounded-2xl ${widthClass}`} />
      ))}
    </div>
  );
}

function ChatMessages({ customerId }: { customerId: string }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const messages = useAppSelector((s) => s.leadConversation.messages);
  const status = useAppSelector((s) => s.leadConversation.messagesStatus);
  const error = useAppSelector((s) => s.leadConversation.messagesError);
  const nextBefore = useAppSelector((s) => s.leadConversation.messagesNextBefore);
  if (status === 'loading' && messages.length === 0) return <ChatSkeleton />;
  if (status === 'failed' && messages.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-destructive mb-3">{error}</p>
        <Button variant="outline" size="sm" onClick={() => void dispatch(fetchLeadConversationMessages({ customerId }))}>
          {t('clients.leadQualificationRetry')}
        </Button>
      </div>
    );
  }
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 p-10 text-center">
        <MessageCircle className="w-8 h-8 text-muted-foreground/60" aria-hidden />
        <p className="text-sm text-muted-foreground">{t('clients.leadChatEmpty')}</p>
      </div>
    );
  }
  return (
    <div className="px-4 py-3">
      {nextBefore ? (
        <div className="flex justify-center mb-3">
          <Button
            variant="ghost"
            size="sm"
            disabled={status === 'loading'}
            onClick={() => void dispatch(fetchLeadConversationMessages({ customerId, before: nextBefore }))}
          >
            {t('clients.leadChatLoadOlder')}
          </Button>
        </div>
      ) : null}
      {messages.map((message) => (
        <LeadConversationMessageBubble key={message.id} message={message} />
      ))}
    </div>
  );
}

/** Side panel with the assistant ↔ customer WhatsApp transcript (read-only context for the ventor). */
export function LeadConversationChatSheet({ customerId, open, onOpenChange }: LeadConversationChatSheetProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (!open) return;
    const req = dispatch(fetchLeadConversationMessages({ customerId }));
    return () => req.abort();
  }, [open, customerId, dispatch]);
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-5 py-4 text-left">
          <SheetTitle>{t('clients.leadChatTitle')}</SheetTitle>
          <SheetDescription>{t('clients.leadChatDescription')}</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto bg-muted/30">
          <ChatMessages customerId={customerId} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
