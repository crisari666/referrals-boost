import AssistantHeader from './AssistantHeader';
import AssistantChatExperience from './assistant-chat-experience';

const Assistant = () => (
  <div className="relative flex flex-col h-[100dvh] md:h-screen">
    <AssistantHeader />
    <AssistantChatExperience />
  </div>
);

export default Assistant;
