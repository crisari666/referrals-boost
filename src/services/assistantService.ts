import * as http from "@/lib/http";
import type { AssistantMessage } from "@/types/assistant";

/**
 * SEND_PROMPT
 * POST /api/assistant/chat
 * Body: { message: string }
 * Response: AssistantMessage
 */
export function sendPrompt(message: string) {
  return http.post<AssistantMessage>("/api/assistant/chat", { message });
}
