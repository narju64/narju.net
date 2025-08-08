/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ACCESS_CODE: string
  readonly VITE_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 