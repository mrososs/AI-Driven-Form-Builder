import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import VueDevTools from 'vite-plugin-vue-devtools'
import { aiBridgePlugin } from './server/aiBridgePlugin'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Vite only exposes VITE_-prefixed vars to the client. Our AI bridge runs
  // server-side and needs the un-prefixed GEMINI_API_KEY in process.env.
  // loadEnv reads all .env files (including .env.local) without prefix filter.
  const env = loadEnv(mode, process.cwd(), '')
  const passthrough = [
    'GEMINI_API_KEY',
    'GEMINI_MODEL',
    'GOOGLE_API_KEY',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY',
  ]
  for (const key of passthrough) {
    if (env[key] && !process.env[key]) {
      process.env[key] = env[key]
    }
  }

  return {
    plugins: [
      VueDevTools(),
      vue(),
      tailwindcss(),
      aiBridgePlugin(),
    ],
  }
})
