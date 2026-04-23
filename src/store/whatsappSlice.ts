import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import * as whatsappService from "@/services/whatsappService";

// ─── Types ───────────────────────────────────────────────────────────
export type ConnectionStatus = "disconnected" | "qr_loading" | "qr_ready" | "scanning" | "connecting" | "connected" | "error";

export interface MessageEdit {
  content: string;
  editedAt: string;
}

export interface WhatsAppMessage {
  id: string;
  chatId: string;
  sender: "me" | "them";
  senderName?: string;
  content: string;
  type: "text" | "image" | "video" | "audio" | "voice" | "document";
  mediaUrl?: string;
  mediaName?: string;
  timestamp: string;
  status: "sending" | "sent" | "delivered" | "read";
  isEdited: boolean;
  editHistory: MessageEdit[];
  isDeleted: boolean;
  deletedAt?: string;
  originalContent?: string;
}

export interface WhatsAppChat {
  id: string;
  contactName: string;
  contactPhone: string;
  contactAvatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface WhatsAppState {
  connectionStatus: ConnectionStatus;
  qrCode: string | null;
  errorMessage: string | null;
  chats: WhatsAppChat[];
  chatsLoading: boolean;
  activeChat: string | null;
  messages: Record<string, WhatsAppMessage[]>;
  messagesLoading: boolean;
  sendingMessage: boolean;
}

const initialState: WhatsAppState = {
  connectionStatus: "disconnected",
  qrCode: null,
  errorMessage: null,
  chats: [],
  chatsLoading: false,
  activeChat: null,
  messages: {},
  messagesLoading: false,
  sendingMessage: false,
};

function isSessionAlreadyConnectedResponse(
  payload: { success: boolean; message?: string } | undefined,
): boolean {
  if (!payload?.success) return false;
  return /already active/i.test(payload.message ?? "");
}

function isSessionRestoreStartedResponse(
  payload: { success: boolean; message?: string } | undefined,
): boolean {
  if (!payload?.success) return false;
  return /restore started/i.test(payload.message ?? "");
}

function isLegacyAlreadyAuthErrorResponse(
  payload: { success: boolean; message?: string } | undefined,
): boolean {
  if (!payload || payload.success !== false) return false;
  return /already exists and authenticated|already authenticated/i.test(
    payload.message ?? "",
  );
}

// ─── Async Thunks (Events) ──────────────────────────────────────────

/** EVENT: REQUEST_QR_CODE — Ask backend for a new QR code */
export const requestQrCode = createAsyncThunk(
  "whatsapp/requestQrCode",
  async (phone: string) => {
    const result = await whatsappService.requestQrCode(phone);
    return result;
  }
);

/** EVENT: SYNC_CONNECTION — Trigger manual sync after scanning */
export const syncConnection = createAsyncThunk(
  "whatsapp/syncConnection",
  async (sessionId: string) => {
    return whatsappService.syncConnection(sessionId);
  }
);

/** EVENT: FETCH_CHATS — Load chat list after connection */
export const fetchChats = createAsyncThunk(
  "whatsapp/fetchChats",
  async (sessionId: string) => {
    return whatsappService.fetchChats(sessionId);
  }
);

/** EVENT: FETCH_MESSAGES — Load messages for a specific chat */
export const fetchMessages = createAsyncThunk(
  "whatsapp/fetchMessages",
  async (payload: { chatId: string; sessionId: string }) => {
    const messages = await whatsappService.fetchMessages(
      payload.sessionId,
      payload.chatId
    );
    return { chatId: payload.chatId, messages };
  }
);

/** EVENT: SEND_MESSAGE — Send a text or media message */
export const sendMessage = createAsyncThunk(
  "whatsapp/sendMessage",
  async (payload: {
    sessionId: string;
    chatId: string;
    content: string;
    type: WhatsAppMessage["type"];
    mediaFile?: File;
  }) => {
    return whatsappService.sendMessage(payload.sessionId, payload);
  }
);

/** EVENT: DISCONNECT — Disconnect WhatsApp session */
export const disconnect = createAsyncThunk(
  "whatsapp/disconnect",
  async (sessionId: string) => {
    await whatsappService.disconnect(sessionId);
  }
);

// ─── Slice ───────────────────────────────────────────────────────────
const whatsappSlice = createSlice({
  name: "whatsapp",
  initialState,
  reducers: {
    /** EVENT: SET_ACTIVE_CHAT */
    setActiveChat(state, action: PayloadAction<string | null>) {
      state.activeChat = action.payload;
    },
    /** EVENT: SET_SCANNING — User started scanning QR */
    setScanning(state) {
      state.connectionStatus = "scanning";
    },
    /** EVENT: QR_RECEIVED — WebSocket: new QR for this session */
    qrReceived(state, action: PayloadAction<{ qr: string }>) {
      state.qrCode = action.payload.qr;
      state.connectionStatus = "qr_ready";
      state.errorMessage = null;
    },
    /** EVENT: SESSION_READY — WebSocket: WhatsApp session is ready */
    sessionReady(state) {
      state.connectionStatus = "connected";
      state.qrCode = null;
      state.errorMessage = null;
    },
    /** EVENT: SESSION_ERROR — WebSocket: auth failure / closed */
    sessionError(state, action: PayloadAction<{ message: string }>) {
      state.connectionStatus = "error";
      state.errorMessage = action.payload.message;
    },
    /** EVENT: CLEAR_ERROR */
    clearError(state) {
      state.errorMessage = null;
    },
    /** EVENT: MESSAGE_UPDATED — Real-time: a message was edited */
    messageUpdated(state, action: PayloadAction<{ chatId: string; messageId: string; newContent: string; editedAt: string }>) {
      const { chatId, messageId, newContent, editedAt } = action.payload;
      const msgs = state.messages[chatId];
      if (msgs) {
        const msg = msgs.find((m) => m.id === messageId);
        if (msg) {
          msg.editHistory.push({ content: msg.content, editedAt });
          msg.content = newContent;
          msg.isEdited = true;
        }
      }
    },
    /** EVENT: MESSAGE_DELETED — Real-time: a message was deleted */
    messageDeleted(state, action: PayloadAction<{ chatId: string; messageId: string; deletedAt: string }>) {
      const { chatId, messageId, deletedAt } = action.payload;
      const msgs = state.messages[chatId];
      if (msgs) {
        const msg = msgs.find((m) => m.id === messageId);
        if (msg) {
          msg.originalContent = msg.content;
          msg.isDeleted = true;
          msg.deletedAt = deletedAt;
          msg.content = "Este mensaje fue eliminado";
        }
      }
    },
    /** EVENT: NEW_INCOMING_MESSAGE — Real-time: new message received */
    newIncomingMessage(state, action: PayloadAction<WhatsAppMessage>) {
      const msg = action.payload;
      if (!state.messages[msg.chatId]) {
        state.messages[msg.chatId] = [];
      }
      state.messages[msg.chatId].push(msg);
      // Update chat preview
      const chat = state.chats.find((c) => c.id === msg.chatId);
      if (chat) {
        chat.lastMessage = msg.content;
        chat.lastMessageTime = msg.timestamp;
        if (state.activeChat !== msg.chatId) {
          chat.unreadCount += 1;
        }
      }
    },
  },
  extraReducers: (builder) => {
    // REQUEST QR
    builder.addCase(requestQrCode.pending, (state) => {
      state.connectionStatus = "qr_loading";
      state.errorMessage = null;
    });
    builder.addCase(requestQrCode.fulfilled, (state, action) => {
      if (isSessionRestoreStartedResponse(action.payload)) {
        state.connectionStatus = "connecting";
        state.qrCode = null;
        state.errorMessage = null;
        return;
      }
      if (
        isSessionAlreadyConnectedResponse(action.payload) ||
        isLegacyAlreadyAuthErrorResponse(action.payload)
      ) {
        state.connectionStatus = "connected";
        state.qrCode = null;
        state.errorMessage = null;
        return;
      }
      if (!state.qrCode) {
        state.connectionStatus = "qr_loading";
      }
    });
    builder.addCase(requestQrCode.rejected, (state, action) => {
      state.connectionStatus = "error";
      state.errorMessage = action.error.message || "Error al solicitar código QR";
    });

    // SYNC CONNECTION
    builder.addCase(syncConnection.pending, (state) => {
      state.connectionStatus = "connecting";
    });
    builder.addCase(syncConnection.fulfilled, (state, action) => {
      if (action.payload.success) {
        state.connectionStatus = "connected";
      } else {
        state.connectionStatus = "error";
        state.errorMessage = "No se pudo sincronizar. Intente escanear de nuevo.";
      }
    });
    builder.addCase(syncConnection.rejected, (state, action) => {
      state.connectionStatus = "error";
      state.errorMessage = action.error.message || "Error de sincronización";
    });

    // FETCH CHATS
    builder.addCase(fetchChats.pending, (state) => {
      state.chatsLoading = true;
    });
    builder.addCase(fetchChats.fulfilled, (state, action) => {
      state.chats = action.payload;
      state.chatsLoading = false;
    });
    builder.addCase(fetchChats.rejected, (state) => {
      state.chatsLoading = false;
    });

    // FETCH MESSAGES
    builder.addCase(fetchMessages.pending, (state) => {
      state.messagesLoading = true;
    });
    builder.addCase(fetchMessages.fulfilled, (state, action) => {
      state.messages[action.payload.chatId] = action.payload.messages;
      state.messagesLoading = false;
    });
    builder.addCase(fetchMessages.rejected, (state) => {
      state.messagesLoading = false;
    });

    // SEND MESSAGE
    builder.addCase(sendMessage.pending, (state) => {
      state.sendingMessage = true;
    });
    builder.addCase(sendMessage.fulfilled, (state, action) => {
      const msg = action.payload;
      if (!state.messages[msg.chatId]) {
        state.messages[msg.chatId] = [];
      }
      state.messages[msg.chatId].push(msg);
      state.sendingMessage = false;
    });
    builder.addCase(sendMessage.rejected, (state) => {
      state.sendingMessage = false;
    });

    // DISCONNECT
    builder.addCase(disconnect.fulfilled, () => initialState);
  },
});

export const {
  setActiveChat,
  setScanning,
  clearError,
  messageUpdated,
  messageDeleted,
  newIncomingMessage,
  qrReceived,
  sessionReady,
  sessionError,
} = whatsappSlice.actions;

export default whatsappSlice.reducer;
