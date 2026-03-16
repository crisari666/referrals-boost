/**
 * WhatsApp service — all requests go through the centralized http client.
 */

import * as http from "@/lib/http";
import type { WhatsAppChat, WhatsAppMessage } from "@/store/whatsappSlice";

const BASE = "/api/whatsapp";

// ─── QR & connection ───────────────────────────────────────────────────

/** POST /api/whatsapp/qr */
export function requestQrCode() {
  return http.post<{ qrCode: string }>(`${BASE}/qr`);
}

/** POST /api/whatsapp/sync */
export function syncConnection() {
  return http.post<{ connected: boolean }>(`${BASE}/sync`);
}

/** POST /api/whatsapp/disconnect */
export function disconnect() {
  return http.post<void>(`${BASE}/disconnect`);
}

// ─── Chats ─────────────────────────────────────────────────────────────

/** GET /api/whatsapp/chats */
export function fetchChats() {
  return http.get<WhatsAppChat[]>(`${BASE}/chats`);
}

/** GET /api/whatsapp/chats/:chatId/messages */
export function fetchMessages(chatId: string) {
  return http.get<WhatsAppMessage[]>(`${BASE}/chats/${chatId}/messages`);
}

/** POST /api/whatsapp/chats/:chatId/messages */
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
  return http.post<WhatsAppMessage>(`${BASE}/chats/${chatId}/messages`, body);
}
