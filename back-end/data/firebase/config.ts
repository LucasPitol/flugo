import { initializeApp, type FirebaseApp } from 'firebase/app'

// No Vite, só variáveis com prefixo VITE_ são expostas ao frontend
const env = import.meta.env
export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY ?? env.FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN ?? env.FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID ?? env.FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET ?? env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? env.FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID ?? env.FIREBASE_APP_ID,
}

// Não dispara erro na carga do módulo: evita tela preta / loading infinito quando
// as variáveis de ambiente não estão configuradas (ex.: Vercel sem env).
let app: FirebaseApp | null = null
try {
  app = initializeApp(firebaseConfig)
} catch {
  app = null
}
export const firebaseApp = app
