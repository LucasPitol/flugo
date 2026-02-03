/// <reference types="vite/client" />
/// <reference types="vitest/globals" />

interface ImportMetaEnv {
    readonly FIREBASE_API_KEY: string
    readonly FIREBASE_AUTH_DOMAIN: string
    readonly FIREBASE_PROJECT_ID: string
    readonly FIREBASE_STORAGE_BUCKET: string
    readonly FIREBASE_MESSAGING_SENDER_ID: string
    readonly FIREBASE_APP_ID: string
    readonly VITE_FIREBASE_API_KEY: string
    readonly VITE_FIREBASE_AUTH_DOMAIN: string
    readonly VITE_FIREBASE_PROJECT_ID: string
    readonly VITE_FIREBASE_STORAGE_BUCKET: string
    readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
    readonly VITE_FIREBASE_APP_ID: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
