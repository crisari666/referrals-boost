/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_URL: string;
  readonly VITE_CONTRACT_SIGN_QUERY_PARAM?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
