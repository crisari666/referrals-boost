# WhatsApp Integration — Events Documentation

This document describes all events (actions/thunks) used in the WhatsApp module. Each event maps to a backend API endpoint.

---

## Connection Events

### `REQUEST_QR_CODE`
- **Type:** Async Thunk
- **Endpoint:** `POST /api/whatsapp/qr`
- **Description:** Requests a new QR code from the backend to initiate WhatsApp Web pairing.
- **Request Body:** None
- **Response:** `{ qrCode: string }` — Base64 or URL of the QR image.
- **Redux States:** `qr_loading` → `qr_ready` | `error`

### `SYNC_CONNECTION`
- **Type:** Async Thunk
- **Endpoint:** `POST /api/whatsapp/sync`
- **Description:** Called after the user scans the QR code. Backend verifies the WhatsApp session is established.
- **Request Body:** None
- **Response:** `{ connected: boolean }`
- **Redux States:** `connecting` → `connected` | `error`

### `DISCONNECT`
- **Type:** Async Thunk
- **Endpoint:** `POST /api/whatsapp/disconnect`
- **Description:** Terminates the WhatsApp session and resets state.
- **Request Body:** None
- **Response:** `void`
- **Redux States:** Resets to `disconnected`

### `SET_SCANNING`
- **Type:** Sync Action
- **Description:** Sets state to `scanning` when user indicates they started scanning the QR.
- **Payload:** None

### `CLEAR_ERROR`
- **Type:** Sync Action
- **Description:** Clears error message and resets error state.
- **Payload:** None

---

## Chat Events

### `FETCH_CHATS`
- **Type:** Async Thunk
- **Endpoint:** `GET /api/whatsapp/chats`
- **Description:** Fetches the list of all WhatsApp conversations after connection is established.
- **Request Body:** None
- **Response:** `WhatsAppChat[]`
  ```typescript
  interface WhatsAppChat {
    id: string;
    contactName: string;
    contactPhone: string;
    contactAvatar?: string;
    lastMessage: string;
    lastMessageTime: string; // ISO 8601
    unreadCount: number;
  }
  ```

### `SET_ACTIVE_CHAT`
- **Type:** Sync Action
- **Description:** Sets the currently viewed chat.
- **Payload:** `string | null` — Chat ID or null to deselect.

---

## Message Events

### `FETCH_MESSAGES`
- **Type:** Async Thunk
- **Endpoint:** `GET /api/whatsapp/chats/:chatId/messages`
- **Description:** Loads message history for a specific chat.
- **Request Params:** `chatId: string`
- **Response:** `WhatsAppMessage[]`
  ```typescript
  interface WhatsAppMessage {
    id: string;
    chatId: string;
    sender: "me" | "them";
    senderName?: string;
    content: string;
    type: "text" | "image" | "video" | "audio" | "voice" | "document";
    mediaUrl?: string;
    mediaName?: string;
    timestamp: string; // ISO 8601
    status: "sending" | "sent" | "delivered" | "read";
    isEdited: boolean;
    editHistory: MessageEdit[];
    isDeleted: boolean;
    deletedAt?: string;
    originalContent?: string;
  }

  interface MessageEdit {
    content: string;
    editedAt: string; // ISO 8601
  }
  ```

### `SEND_MESSAGE`
- **Type:** Async Thunk
- **Endpoint:** `POST /api/whatsapp/chats/:chatId/messages`
- **Description:** Sends a message (text, image, video, audio, voice, or document).
- **Request Body:**
  ```typescript
  {
    content: string;
    type: "text" | "image" | "video" | "audio" | "voice" | "document";
    mediaFile?: File; // Multipart form data for media
  }
  ```
- **Response:** `WhatsAppMessage` — The sent message with server-assigned ID and timestamp.

---

## Real-time Events (WebSocket / Server-Sent Events)

These events are dispatched by the frontend when receiving real-time updates from the backend.

### `MESSAGE_UPDATED`
- **Type:** Sync Action
- **Description:** Fired when a message is edited in WhatsApp. The original content is preserved in edit history for vendor tracking.
- **Payload:**
  ```typescript
  {
    chatId: string;
    messageId: string;
    newContent: string;
    editedAt: string; // ISO 8601
  }
  ```
- **Backend WebSocket Event:** `message:updated`

### `MESSAGE_DELETED`
- **Type:** Sync Action
- **Description:** Fired when a message is deleted in WhatsApp. The original content is preserved in `originalContent` for vendor tracking purposes.
- **Payload:**
  ```typescript
  {
    chatId: string;
    messageId: string;
    deletedAt: string; // ISO 8601
  }
  ```
- **Backend WebSocket Event:** `message:deleted`
- **Important:** Deleted messages are stored in the database to track vendor behavior. The UI shows a "deleted" indicator with an option to view the original content.

### `NEW_INCOMING_MESSAGE`
- **Type:** Sync Action
- **Description:** Fired when a new message is received from a contact.
- **Payload:** `WhatsAppMessage` — The full message object.
- **Backend WebSocket Event:** `message:new`

---

## State Machine

```
disconnected
  ↓ REQUEST_QR_CODE
qr_loading
  ↓ success
qr_ready
  ↓ SET_SCANNING (user clicks "Ya escaneé")
scanning
  ↓ SYNC_CONNECTION
connecting
  ↓ success          ↓ failure
connected           error
  ↓ FETCH_CHATS       ↓ REQUEST_QR_CODE (retry)
chatsLoading        qr_loading
  ↓ success
chats loaded → SET_ACTIVE_CHAT → FETCH_MESSAGES → messagesLoading → messages loaded
```

---

## Backend Requirements

1. **WhatsApp Web API:** Use a library like `whatsapp-web.js` or `baileys` for the WhatsApp Web protocol.
2. **QR Code Generation:** Generate QR codes server-side and send as base64/URL.
3. **Session Persistence:** Store WhatsApp sessions to avoid re-scanning on page reload.
4. **Message Storage:** All messages (including edited/deleted) must be stored in the database.
5. **Real-time Updates:** Use WebSocket or SSE to push message updates to the frontend.
6. **Media Handling:** Store media files in object storage (S3, etc.) and return URLs.
7. **Deleted Message Tracking:** When a message is deleted on WhatsApp, preserve the original content in the database and mark as deleted.
8. **Edit History:** When a message is edited, store previous versions for audit trail.
