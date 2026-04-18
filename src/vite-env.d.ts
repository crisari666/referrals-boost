/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_URL: string;
  readonly VITE_CONTRACT_SIGN_QUERY_PARAM?: string;
  /** WhatsApp MS HTTP + Socket.IO base (e.g. https://host/ws-rest), no trailing slash */
  readonly VITE_URL_WHATSAPP_MS?: string;
  /** Optional Socket.IO path suffix if namespace differs from VITE_URL_WHATSAPP_MS */
  readonly VITE_WHATSAPP_WS_NAMESPACE?: string;
  /** CRM Socket.IO origin (http(s) or ws(s); ws is normalized for socket.io-client) */
  readonly VITE_URL_SOCKET?: string;
  /** Quantum VoIP server base URL, e.g. https://host/voip (global prefix is voip; path continues with /token/...) */
  readonly VITE_URL_VOIP_SERVER?: string;
  /** Customers microservice REST origin, e.g. http://localhost:4000/customers-rest/ */
  readonly VITE_URL_CUSTOMERS_MS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
