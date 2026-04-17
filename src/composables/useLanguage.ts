import { useI18n } from 'vue-i18n'

const LOCALE_KEY = 'preferred-locale'
let restored = false

export function useLanguage() {
  const { t, locale } = useI18n()

  if (!restored) {
    restored = true
    const saved = localStorage.getItem(LOCALE_KEY)
    if (saved === 'en' || saved === 'ar') {
      locale.value = saved
      document.documentElement.dir = saved === 'ar' ? 'rtl' : 'ltr'
      document.documentElement.lang = saved
    }
  }

  const toggleLanguage = () => {
    const newLocale = locale.value === 'en' ? 'ar' : 'en'
    locale.value = newLocale
    document.documentElement.dir = newLocale === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = newLocale
    localStorage.setItem(LOCALE_KEY, newLocale)
  }

  return {
    t,
    locale,
    toggleLanguage
  }
}
