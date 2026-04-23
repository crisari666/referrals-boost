import { useEffect } from "react";
import { useAppDispatch } from "@/store";
import { websocketService } from "@/shared/services/websocket.service";
import { WHATSAPP_MS_ORIGIN } from "@/services/whatsappService";
import { qrReceived, sessionReady, sessionError, newIncomingMessage } from "@/store/whatsappSlice";

type WhatsappSocketListenerProps = {
  sessionId: string | null;
};

type QrEventPayload = {
  sessionId: string;
  qr: string;
  roomName: string;
};

type ReadyEventPayload = {
  sessionId: string;
};

type AuthFailurePayload = {
  sessionId: string;
  error: string;
};

type SessionClosedPayload = {
  sessionId: string;
  chatId?: string;
};

type NewMessagePayload = {
  sessionId: string;
  message: {
    messageId: string;
    chatId: string;
    fromMe: boolean;
    body?: string | null;
    type?: string | null;
    timestamp: number;
  };
};

function mapIncomingType(type?: string | null): "text" | "image" | "video" | "audio" | "voice" | "document" {
  const t = (type ?? "chat").toLowerCase();
  if (t === "chat" || t === "conversation") return "text";
  if (t === "image" || t === "video" || t === "audio" || t === "voice" || t === "document") return t;
  return "text";
}

const WhatsappSocketListener = ({ sessionId }: WhatsappSocketListenerProps) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!sessionId) return;

    if (!websocketService.isConnectedToServer()) {
      const base = WHATSAPP_MS_ORIGIN;
      if (!base) {
        return;
      }
      const namespace = import.meta.env.VITE_WHATSAPP_WS_NAMESPACE ?? "";
      const url = namespace
        ? `${base.replace(/\/$/, "")}${namespace.startsWith("/") ? namespace : `/${namespace}`}`
        : base;
      console.log('url', url);
      websocketService.connect(url, { query: { sessionId }, path: '/ws-socket' });
    } else {
      const roomName = `session:${sessionId}`;
      websocketService.joinRoom(roomName);
    }

    const unsubscribeQr = websocketService.on<QrEventPayload>("qr", (data) => {
      if (data.sessionId !== sessionId) return;
      dispatch(qrReceived({ qr: data.qr }));
    });

    const unsubscribeReady = websocketService.on<ReadyEventPayload>("ready", (data) => {
      if (data.sessionId !== sessionId) return;
      dispatch(sessionReady());
    });

    const unsubscribeAuthFailure = websocketService.on<AuthFailurePayload>("auth_failure", (data) => {
      if (data.sessionId !== sessionId) return;
      dispatch(sessionError({ message: data.error || "Error de autenticación en WhatsApp" }));
    });

    const unsubscribeSessionClosed = websocketService.on<SessionClosedPayload>("sessionClosed", (data) => {
      if (data.sessionId !== sessionId) return;
      dispatch(sessionError({ message: "Sesión de WhatsApp cerrada" }));
    });

    const unsubscribeNewMessage = websocketService.on<NewMessagePayload>("new_message", (data) => {
      console.log('new_message', data);
      if (data.sessionId !== sessionId) return;
      const msg = data.message;
      if (!msg?.messageId || !msg.chatId) return;

      dispatch(
        newIncomingMessage({
          id: msg.messageId,
          chatId: msg.chatId,
          sender: msg.fromMe ? "me" : "them",
          content: msg.body ?? "",
          type: mapIncomingType(msg.type),
          timestamp: new Date((msg.timestamp || Date.now() / 1000) * 1000).toISOString(),
          status: msg.fromMe ? "sent" : "read",
          isEdited: false,
          editHistory: [],
          isDeleted: false,
        }),
      );
    });

    return () => {
      unsubscribeQr();
      unsubscribeReady();
      unsubscribeAuthFailure();
      unsubscribeSessionClosed();
      unsubscribeNewMessage();
      const roomName = `session:${sessionId}`;
      if (websocketService.isConnectedToServer()) {
        websocketService.leaveRoom(roomName);
      }
    };
  }, [dispatch, sessionId]);

  return null;
};

export default WhatsappSocketListener;

