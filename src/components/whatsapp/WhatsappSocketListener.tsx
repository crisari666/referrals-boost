import { useEffect } from "react";
import { useAppDispatch } from "@/store";
import { websocketService } from "@/shared/services/websocket.service";
import { WHATSAPP_MS_ORIGIN } from "@/services/whatsappService";
import { qrReceived, sessionReady, sessionError } from "@/store/whatsappSlice";

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
      websocketService.connect(url, { query: { sessionId } });
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

    return () => {
      unsubscribeQr();
      unsubscribeReady();
      unsubscribeAuthFailure();
      unsubscribeSessionClosed();
      const roomName = `session:${sessionId}`;
      if (websocketService.isConnectedToServer()) {
        websocketService.leaveRoom(roomName);
      }
    };
  }, [dispatch, sessionId]);

  return null;
};

export default WhatsappSocketListener;

