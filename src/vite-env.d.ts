/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_URL: string;
  readonly VITE_CONTRACT_SIGN_QUERY_PARAM?: string;
  /** CRM Socket.IO origin (http(s) or ws(s); ws is normalized for socket.io-client) */
  readonly VITE_URL_SOCKET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
