import ProjectResourceShareSheet from '@/features/Projects/project-resource-share-sheet';
import AssistantMessageList from './assistant-message-list';
import AssistantScrollDownFab from './assistant-scroll-down-fab';
import ChatInput from './ChatInput';
import SuggestedQuestions from './SuggestedQuestions';
import { useAssistantResourceShareSheet } from './hooks/use-assistant-resource-share-sheet';
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

  const {
    shareSheetOpen,
    shareResource,
    openShare,
    onShareSheetOpenChange,
    authHeaders,
  } = useAssistantResourceShareSheet();

  return (
    <>
      <ProjectResourceShareSheet
        open={shareSheetOpen}
        onOpenChange={onShareSheetOpenChange}
        resource={shareResource}
        authHeaders={authHeaders}
      />
      <AssistantMessageList
        scrollRef={scrollRef}
        messagesEndRef={messagesEndRef}
        messages={messages}
        isTyping={isPending}
        onScroll={onScroll}
        onAssistantResourceShare={openShare}
      />
      <AssistantScrollDownFab visible={showScrollBtn} onClick={scrollToBottom} />
      {messages.length <= 1 && <SuggestedQuestions onSelect={send} />}
      <ChatInput onSend={send} disabled={isPending} />
    </>
  );
};

export default AssistantChatExperience;
