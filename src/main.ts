import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import { i18n } from "./i18n";
import { useAuthStore } from "./stores/auth";
import * as Sentry from "@sentry/vue";

import "./assets/css/main.css";

// Default to dark mode on first visit so useDark() reads the preferred value
// from the same key it writes to. The inline script in index.html applies the
// `.dark` class pre-hydration to prevent a flash.
if (!localStorage.getItem("vueuse-color-scheme")) {
  localStorage.setItem("vueuse-color-scheme", "dark");
}

const app = createApp(App);
Sentry.init({
  app,
  dsn: "https://8bbf38ccbf1ce7675ea88650f3b4de64@o4510713609060352.ingest.us.sentry.io/4511330475311104",
  sendDefaultPii: true,
  debug: import.meta.env.DEV,
  integrations: [
    Sentry.browserTracingIntegration({ router }),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: import.meta.env.DEV ? 1.0 : 0.2,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  environment: import.meta.env.MODE,
});

app.use(createPinia());
app.use(router);
app.use(i18n);

// Start Firebase auth listener before mount so router guards can await authReady
useAuthStore().init();

app.mount("#app");
