import { useRef, useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { sendPrompt } from "@/store/assistantSlice";
import AssistantHeader from "./AssistantHeader";
import AssistantMessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import SuggestedQuestions from "./SuggestedQuestions";
import ChatInput from "./ChatInput";

const Assistant = () => {
  const dispatch = useAppDispatch();
  const { messages, isTyping } = useAppSelector((s) => s.assistant);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 100);
  };

  const handleSend = (text: string) => {
    dispatch(sendPrompt(text));
  };

  return (
    <div className="flex flex-col h-[100dvh] md:h-screen">
      <AssistantHeader />

      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-4 md:px-8 py-4 space-y-4 relative">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <AssistantMessageBubble key={msg.id} message={msg} />
          ))}
        </AnimatePresence>
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      <AnimatePresence>
        {showScrollBtn && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-36 right-6 w-9 h-9 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center z-10"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
        )}
      </AnimatePresence>

      {messages.length <= 1 && <SuggestedQuestions onSelect={handleSend} />}

      <ChatInput onSend={handleSend} disabled={isTyping} />
    </div>
  );
};

export default Assistant;
