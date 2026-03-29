import AssistantMessageList from './assistant-message-list';
import AssistantScrollDownFab from './assistant-scroll-down-fab';
import ChatInput from './ChatInput';
import SuggestedQuestions from './SuggestedQuestions';
import { useAgentChat } from './use-agent-chat';

const AssistantChatExperience = () => {
  const {
    messages,
    isPending,
    showScrollBtn,
    scrollRef,
    messagesEndRef,
    onScroll,
    scrollToBottom,
    send,
  } = useAgentChat();

  return (
    <>
      <AssistantMessageList
        scrollRef={scrollRef}
        messagesEndRef={messagesEndRef}
        messages={messages}
        isTyping={isPending}
        onScroll={onScroll}
      />
      <AssistantScrollDownFab visible={showScrollBtn} onClick={scrollToBottom} />
      {messages.length <= 1 && <SuggestedQuestions onSelect={send} />}
      <ChatInput onSend={send} disabled={isPending} />
    </>
  );
};

export default AssistantChatExperience;
