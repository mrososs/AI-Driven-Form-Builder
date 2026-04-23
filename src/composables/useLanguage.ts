import { useI18n } from 'vue-i18n'

export function useLanguage() {
  const { t, locale } = useI18n()

  function toggleLanguage() {
    locale.value = locale.value === 'en' ? 'ar' : 'en'
  }

  return { t, locale, toggleLanguage }
}
