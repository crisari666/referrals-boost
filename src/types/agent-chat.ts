export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatHistoryMessage {
  role: ChatRole;
  content: string;
}

export interface AskAgentRequestBody {
  question: string;
  chatHistory?: ChatHistoryMessage[];
}

export interface AskAgentResponseBody {
  output: string;
  sources: string[];
}
