import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { i18n } from './i18n'

import './assets/css/main.css'

// Default to dark mode on first visit (respects any saved preference)
if (!localStorage.getItem('vueuse-color-scheme')) {
  localStorage.setItem('vueuse-color-scheme', 'dark')
  document.documentElement.classList.add('dark')
}

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)

app.mount('#app')
