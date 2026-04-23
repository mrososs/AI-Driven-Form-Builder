import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { i18n } from './i18n'
import { useAuthStore } from './stores/auth'

import './assets/css/main.css'

// Default to dark mode on first visit so useDark() reads the preferred value
// from the same key it writes to. The inline script in index.html applies the
// `.dark` class pre-hydration to prevent a flash.
if (!localStorage.getItem('vueuse-color-scheme')) {
  localStorage.setItem('vueuse-color-scheme', 'dark')
}

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)

// Start Firebase auth listener before mount so router guards can await authReady
useAuthStore().init()

app.mount('#app')
