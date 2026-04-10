/**
 * WhatsApp service — all requests go through the centralized http client.
 * REST base: {VITE_URL_WHATSAPP_MS}/whatsapp-web (global prefix ws-rest is included in env).
 */

import * as http from "@/lib/http";
import type { WhatsAppChat, WhatsAppMessage } from "@/store/whatsappSlice";

export const WHATSAPP_MS_ORIGIN = (import.meta.env.VITE_URL_WHATSAPP_MS ?? "").replace(
  /\/$/,
  "",
);

const WHATSAPP_WEB = `${WHATSAPP_MS_ORIGIN}/whatsapp-web`;

function mapSendResponseToMessage(
  chatId: string,
  content: string,
  type: WhatsAppMessage["type"],
  res: { success?: boolean; messageId: string; timestamp: number },
): WhatsAppMessage {
  return {
    id: res.messageId,
    chatId,
    sender: "me",
    content,
    type: type === "voice" ? "text" : type,
    timestamp: new Date(res.timestamp).toISOString(),
    status: "sent",
    isEdited: false,
    editHistory: [],
    isDeleted: false,
  };
}

export function requestQrCode(phone: string) {
  return http.post<{
    success: boolean;
    sessionId: string;
    message: string;
  }>("/session", undefined, {
    url: `${WHATSAPP_WEB}/session/${encodeURIComponent(phone)}`,
  });
}

export function syncConnection(sessionId: string) {
  return http.post<{ success: boolean; chatsProcessed?: number; message?: string }>(
    "/sync-chats",
    undefined,
    {
      url: `${WHATSAPP_WEB}/session/${encodeURIComponent(sessionId)}/sync-chats`,
    },
  );
}

export function disconnect(sessionId?: string) {
  return http.post<{
    success: boolean;
    sessionId?: string;
    disconnected?: string[];
    count?: number;
    message?: string;
  }>("/disconnect", sessionId ? { sessionId } : undefined, {
    url: `${WHATSAPP_WEB}/disconnect`,
  });
}

export function fetchChats(sessionId: string) {
  return http.get<WhatsAppChat[]>("/chats", {
    url: `${WHATSAPP_WEB}/chats`,
    params: { sessionId },
  });
}

export function fetchMessages(sessionId: string, chatId: string) {
  const enc = encodeURIComponent(chatId);
  return http.get<WhatsAppMessage[]>("/chats/messages", {
    url: `${WHATSAPP_WEB}/chats/${enc}/messages`,
    params: { sessionId },
  });
}

export function sendMessage(
  sessionId: string,
  payload: {
    chatId: string;
    content: string;
    type: WhatsAppMessage["type"];
    mediaFile?: File;
  },
) {
  if (payload.mediaFile) {
    return Promise.reject(
      new Error("El envío de archivos multimedia no está disponible aún"),
    );
  }
  const digits = payload.chatId.includes("@")
    ? (payload.chatId.split("@")[0] || "").replace(/\D/g, "")
    : payload.chatId.replace(/\D/g, "");
  if (!digits) {
    return Promise.reject(new Error("Destino inválido"));
  }
  return http
    .post<{ success: boolean; messageId: string; timestamp: number }>(
      "/send",
      { phone: digits, message: payload.content },
      {
        url: `${WHATSAPP_WEB}/send/${encodeURIComponent(sessionId)}`,
      },
    )
    .then((res) =>
      mapSendResponseToMessage(
        payload.chatId,
        payload.content,
        payload.type,
        res,
      ),
    );
}
