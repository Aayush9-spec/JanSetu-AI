/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DATA_MODE?: 'mock' | 'real' | 'hybrid';
  readonly VITE_DATA_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
