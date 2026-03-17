/**
 * WhatsApp service — all requests go through the centralized http client.
 */

import * as http from "@/lib/http";
import type { WhatsAppChat, WhatsAppMessage } from "@/store/whatsappSlice";

const WHATSAPP_BASE = (import.meta.env.VITE_URL_WHATSAPP_MS ?? "").replace(/\/$/, "");

// ─── Session, QR & connection ──────────────────────────────────────────

/** POST /session/:id — create session for given phone */
export function requestQrCode(phone: string) {
  return http.post<{
    success: boolean;
    sessionId: string;
    message: string;
  }>("/session", undefined, {
    url: `${WHATSAPP_BASE}/whatsapp-web/session/${phone}`,
  });
}

/** POST /sync */
export function syncConnection() {
  return http.post<{ connected: boolean }>("/sync", undefined, {
    url: `${WHATSAPP_BASE}/sync`,
  });
}

/** POST /disconnect */
export function disconnect() {
  return http.post<void>("/disconnect", undefined, {
    url: `${WHATSAPP_BASE}/disconnect`,
  });
}

// ─── Chats ─────────────────────────────────────────────────────────────

/** GET /chats */
export function fetchChats() {
  return http.get<WhatsAppChat[]>("/chats", {
    url: `${WHATSAPP_BASE}/chats`,
  });
}

/** GET /chats/:chatId/messages */
export function fetchMessages(chatId: string) {
  return http.get<WhatsAppMessage[]>("/chats/messages", {
    url: `${WHATSAPP_BASE}/chats/${chatId}/messages`,
  });
}

/** POST /chats/:chatId/messages */
export function sendMessage(payload: {
  chatId: string;
  content: string;
  type: WhatsAppMessage["type"];
  mediaFile?: File;
}) {
  const { chatId, content, type, mediaFile } = payload;
  const body = mediaFile
    ? (() => {
        const form = new FormData();
        form.append("content", content);
        form.append("type", type);
        form.append("media", mediaFile);
        return form;
      })()
    : { content, type };
  return http.post<WhatsAppMessage>("/chats/messages", body, {
    url: `${WHATSAPP_BASE}/chats/${chatId}/messages`,
  });
}
