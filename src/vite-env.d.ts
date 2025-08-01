/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SECRET_PASSWORD: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 