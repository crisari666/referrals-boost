import { post } from '@/lib/http';
import type { AskAgentRequestBody, AskAgentResponseBody } from '@/types/agent-chat';

function resolveAskUrl(): string {
  const base = (import.meta.env.VITE_URL_RAG_AGENT as string | undefined)?.replace(/\/$/, '') ?? '';
  if (!base) {
    throw new Error('VITE_URL_RAG_AGENT is not configured');
  }
  return `${base}/agent-chat/ask`;
}

export function askAgent(body: AskAgentRequestBody): Promise<AskAgentResponseBody> {
  return post<AskAgentResponseBody>('', body, {
    url: resolveAskUrl(),
    headers: { 'Content-Type': 'application/json' },
  });
}
