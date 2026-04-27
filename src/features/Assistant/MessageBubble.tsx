import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Bot, User } from 'lucide-react';
import type { ProjectResourceShareSheetResource } from '@/features/Projects/project-resource-share-sheet';
import type { AssistantMessage } from '@/types/assistant';
import AssistantMessageResources from './components/assistant-message-resources.cp';

interface MessageBubbleProps {
  message: AssistantMessage;
  onAssistantResourceShare: (payload: ProjectResourceShareSheetResource) => void;
}

const RichText = ({ text }: { text: string }) => (
  <>
    {text.split(/(\*\*.*?\*\*)/g).map((part, i) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={i}>{part.slice(2, -2)}</strong>
      ) : part.startsWith("*") && part.endsWith("*") ? (
        <em key={i}>{part.slice(1, -1)}</em>
      ) : (
        <span key={i}>{part}</span>
      )
    )}
  </>
);

const AssistantMessageBubble = ({ message, onAssistantResourceShare }: MessageBubbleProps) => {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-lg gradient-commission flex items-center justify-center mt-1">
          <Bot className="w-4 h-4 text-primary-foreground" />
        </div>
      )}

      <div
        className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 ${
          isUser
            ? "gradient-commission text-primary-foreground rounded-br-md"
            : "bg-card border border-border rounded-bl-md"
        }`}
      >
        <div className={`text-sm leading-relaxed whitespace-pre-line ${!isUser ? "text-foreground" : ""}`}>
          <RichText text={message.content} />
        </div>

        {message.resources && message.resources.length > 0 ? (
          <AssistantMessageResources
            resources={message.resources}
            onOpenShare={onAssistantResourceShare}
          />
        ) : null}

        <p className={`text-[10px] mt-2 ${isUser ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
          {format(new Date(message.timestamp), "HH:mm")}
        </p>
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-secondary flex items-center justify-center mt-1">
          <User className="w-4 h-4 text-muted-foreground" />
        </div>
      )}
    </motion.div>
  );
};

export default AssistantMessageBubble;
