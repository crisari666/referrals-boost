export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatHistoryMessage {
  role: ChatRole;
  content: string;
}

export type AgentChatMediaKind =
  | 'image'
  | 'horizontalImage'
  | 'cardProject'
  | 'verticalVideo'
  | 'reelVideo'
  | 'plane'
  | 'brochure';

export interface AgentChatMediaFile {
  kind: AgentChatMediaKind;
  filename: string;
}

export interface AgentChatMediaProject {
  projectId: string;
  title: string;
  location: string;
  files: AgentChatMediaFile[];
}

export interface AskAgentRequestBody {
  question: string;
  chatHistory?: ChatHistoryMessage[];
}

export interface AskAgentResponseBody {
  output: string;
  sources: string[];
  media: AgentChatMediaProject[];
}
