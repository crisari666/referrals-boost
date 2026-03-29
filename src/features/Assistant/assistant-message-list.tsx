import { AnimatePresence } from 'framer-motion';
import type { RefObject } from 'react';
import type { AssistantMessage } from '@/types/assistant';
import AssistantMessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

interface AssistantMessageListProps {
  scrollRef: RefObject<HTMLDivElement | null>;
  messagesEndRef: RefObject<HTMLDivElement | null>;
  messages: AssistantMessage[];
  isTyping: boolean;
  onScroll: () => void;
}

const AssistantMessageList = ({
  scrollRef,
  messagesEndRef,
  messages,
  isTyping,
  onScroll,
}: AssistantMessageListProps) => (
  <div
    ref={scrollRef}
    onScroll={onScroll}
    className="flex-1 overflow-y-auto px-4 md:px-8 py-4 space-y-4 relative"
  >
    <AnimatePresence initial={false}>
      {messages.map((msg) => (
        <AssistantMessageBubble key={msg.id} message={msg} />
      ))}
    </AnimatePresence>
    {isTyping && <TypingIndicator />}
    <div ref={messagesEndRef} />
  </div>
);

export default AssistantMessageList;
