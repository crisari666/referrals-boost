/**
 * WhatsApp Service — Mock implementation
 * 
 * All functions simulate backend API calls.
 * Replace the body of each function with actual HTTP requests
 * when the backend is ready.
 */

import type { WhatsAppChat, WhatsAppMessage } from "@/store/whatsappSlice";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ─── QR Code ─────────────────────────────────────────────────────────

/**
 * REQUEST_QR_CODE
 * POST /api/whatsapp/qr
 * Returns a QR code string (base64 or data URL) for the user to scan.
 */
export async function requestQrCode(): Promise<{ qrCode: string }> {
  await delay(1500);
  // Mock: Generate a fake QR code data URL (in production this comes from the backend)
  const qrData = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=whatsapp-sync-${Date.now()}`;
  return { qrCode: qrData };
}

/**
 * SYNC_CONNECTION
 * POST /api/whatsapp/sync
 * Called after user scans QR. Backend verifies the WhatsApp session.
 */
export async function syncConnection(): Promise<{ connected: boolean }> {
  await delay(3000);
  // Mock: 90% success rate
  return { connected: Math.random() > 0.1 };
}

/**
 * DISCONNECT
 * POST /api/whatsapp/disconnect
 */
export async function disconnect(): Promise<void> {
  await delay(500);
}

// ─── Chats ───────────────────────────────────────────────────────────

/**
 * FETCH_CHATS
 * GET /api/whatsapp/chats
 */
export async function fetchChats(): Promise<WhatsAppChat[]> {
  await delay(2000);
  return [
    {
      id: "chat-1",
      contactName: "María García López",
      contactPhone: "+52 999 123 4567",
      lastMessage: "Me interesa el lote A-12",
      lastMessageTime: "2026-03-11T10:30:00",
      unreadCount: 3,
    },
    {
      id: "chat-2",
      contactName: "Roberto Sánchez",
      contactPhone: "+52 999 987 6543",
      lastMessage: "¿Cuándo podemos agendar una visita?",
      lastMessageTime: "2026-03-11T09:15:00",
      unreadCount: 1,
    },
    {
      id: "chat-3",
      contactName: "Ana Martínez Ruiz",
      contactPhone: "+52 333 456 7890",
      lastMessage: "Gracias por la información 👍",
      lastMessageTime: "2026-03-10T18:45:00",
      unreadCount: 0,
    },
    {
      id: "chat-4",
      contactName: "José Hernández",
      contactPhone: "+52 999 111 2233",
      lastMessage: "Necesito los planos actualizados",
      lastMessageTime: "2026-03-10T14:20:00",
      unreadCount: 0,
    },
    {
      id: "chat-5",
      contactName: "Laura Díaz Pérez",
      contactPhone: "+52 333 222 3344",
      lastMessage: "¡Perfecto! Nos vemos el sábado",
      lastMessageTime: "2026-03-09T20:00:00",
      unreadCount: 0,
    },
  ];
}

// ─── Messages ────────────────────────────────────────────────────────

/**
 * FETCH_MESSAGES
 * GET /api/whatsapp/chats/:chatId/messages
 */
export async function fetchMessages(chatId: string): Promise<WhatsAppMessage[]> {
  await delay(1500);

  const mockMessages: Record<string, WhatsAppMessage[]> = {
    "chat-1": [
      {
        id: "msg-1-1",
        chatId: "chat-1",
        sender: "them",
        senderName: "María García",
        content: "Hola, vi el proyecto Residencial Las Palmas",
        type: "text",
        timestamp: "2026-03-11T09:00:00",
        status: "read",
        isEdited: false,
        editHistory: [],
        isDeleted: false,
      },
      {
        id: "msg-1-2",
        chatId: "chat-1",
        sender: "me",
        content: "¡Hola María! Claro, es un excelente proyecto. ¿Te gustaría recibir más información?",
        type: "text",
        timestamp: "2026-03-11T09:05:00",
        status: "read",
        isEdited: false,
        editHistory: [],
        isDeleted: false,
      },
      {
        id: "msg-1-3",
        chatId: "chat-1",
        sender: "them",
        senderName: "María García",
        content: "Sí, por favor. Me interesa el lote A-12",
        type: "text",
        timestamp: "2026-03-11T09:10:00",
        status: "read",
        isEdited: false,
        editHistory: [],
        isDeleted: false,
      },
      {
        id: "msg-1-4",
        chatId: "chat-1",
        sender: "me",
        content: "Plano del lote A-12",
        type: "image",
        mediaUrl: "https://placehold.co/600x400/e2e8f0/64748b?text=Plano+Lote+A-12",
        timestamp: "2026-03-11T09:15:00",
        status: "read",
        isEdited: false,
        editHistory: [],
        isDeleted: false,
      },
      {
        id: "msg-1-5",
        chatId: "chat-1",
        sender: "them",
        senderName: "María García",
        content: "¡Se ve genial! ¿Cuál es el precio exacto?",
        type: "text",
        timestamp: "2026-03-11T10:00:00",
        status: "read",
        isEdited: true,
        editHistory: [
          { content: "¿Cuánto cuesta?", editedAt: "2026-03-11T10:01:00" },
        ],
        isDeleted: false,
      },
      {
        id: "msg-1-6",
        chatId: "chat-1",
        sender: "me",
        content: "El lote A-12 tiene un precio de COP 350.000.000 con financiamiento directo.",
        type: "text",
        timestamp: "2026-03-11T10:15:00",
        status: "delivered",
        isEdited: false,
        editHistory: [],
        isDeleted: false,
      },
      {
        id: "msg-1-7",
        chatId: "chat-1",
        sender: "them",
        senderName: "María García",
        content: "Este mensaje fue eliminado",
        type: "text",
        timestamp: "2026-03-11T10:20:00",
        status: "read",
        isEdited: false,
        editHistory: [],
        isDeleted: true,
        deletedAt: "2026-03-11T10:22:00",
        originalContent: "No me convence, está muy caro y creo que hay mejores opciones",
      },
      {
        id: "msg-1-8",
        chatId: "chat-1",
        sender: "them",
        senderName: "María García",
        content: "Me interesa el lote A-12, voy a revisarlo con mi esposo",
        type: "text",
        timestamp: "2026-03-11T10:30:00",
        status: "read",
        isEdited: false,
        editHistory: [],
        isDeleted: false,
      },
    ],
    "chat-2": [
      {
        id: "msg-2-1",
        chatId: "chat-2",
        sender: "them",
        senderName: "Roberto Sánchez",
        content: "Buenos días, me interesa Costa Esmeralda",
        type: "text",
        timestamp: "2026-03-11T08:00:00",
        status: "read",
        isEdited: false,
        editHistory: [],
        isDeleted: false,
      },
      {
        id: "msg-2-2",
        chatId: "chat-2",
        sender: "me",
        content: "¡Hola Roberto! Costa Esmeralda es nuestra joya. ¿Buscas para inversión o vivienda?",
        type: "text",
        timestamp: "2026-03-11T08:30:00",
        status: "read",
        isEdited: false,
        editHistory: [],
        isDeleted: false,
      },
      {
        id: "msg-2-3",
        chatId: "chat-2",
        sender: "them",
        senderName: "Roberto Sánchez",
        content: "¿Cuándo podemos agendar una visita?",
        type: "text",
        timestamp: "2026-03-11T09:15:00",
        status: "read",
        isEdited: false,
        editHistory: [],
        isDeleted: false,
      },
    ],
  };

  return mockMessages[chatId] || [
    {
      id: `msg-${chatId}-1`,
      chatId,
      sender: "them",
      content: "Hola, necesito información",
      type: "text",
      timestamp: "2026-03-10T12:00:00",
      status: "read",
      isEdited: false,
      editHistory: [],
      isDeleted: false,
    },
  ];
}

// ─── Send Message ────────────────────────────────────────────────────

/**
 * SEND_MESSAGE
 * POST /api/whatsapp/chats/:chatId/messages
 * Body: { content, type, mediaFile? }
 */
export async function sendMessage(payload: {
  chatId: string;
  content: string;
  type: WhatsAppMessage["type"];
  mediaFile?: File;
}): Promise<WhatsAppMessage> {
  await delay(800);
  return {
    id: `msg-${Date.now()}`,
    chatId: payload.chatId,
    sender: "me",
    content: payload.content,
    type: payload.type,
    mediaUrl: payload.mediaFile ? URL.createObjectURL(payload.mediaFile) : undefined,
    mediaName: payload.mediaFile?.name,
    timestamp: new Date().toISOString(),
    status: "sent",
    isEdited: false,
    editHistory: [],
    isDeleted: false,
  };
}
