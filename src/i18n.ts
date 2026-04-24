import { createI18n } from 'vue-i18n'
import { watch } from 'vue'

const LOCALE_KEY = 'preferred-locale'
type Locale = 'en' | 'ar'

function readSavedLocale(): Locale {
  const saved = localStorage.getItem(LOCALE_KEY)
  return saved === 'ar' ? 'ar' : 'en'
}

const initialLocale = readSavedLocale()
document.documentElement.dir = initialLocale === 'ar' ? 'rtl' : 'ltr'
document.documentElement.lang = initialLocale

const messages = {
  en: {
    nav: {
      docs: 'Docs',
      api: 'API',
      examples: 'Examples',
      blog: 'Blog',
      startBtn: 'Start Building Free',
      logout: 'Sign out',
    },
    hero: {
      badge: "What's new",
      badgeText: 'Just shipped Generative Forms',
      titleP1: 'The AI Framework for ',
      titleGradient: 'Generative Forms',
      description: 'Embed intelligence into your product\'s data collection by integrating LLMs with your form components and client-side logic. Intelligence where it helps. Nowhere it doesn\'t.',
      cta: 'Start Building Free',
      learnMore: 'Learn more'
    },
    features: {
      title: 'Full Control',
      subtitle: 'Predictable, high quality, and ready to ship',
      ai: {
        title: 'Generative Forms',
        description: 'Expose your form requirements and let FormAI use an LLM to serve dynamic inputs. You stay in control of the ingredients.'
      },
      drag: {
        title: 'Structured Data',
        description: 'FormAI converts natural language into strongly typed schemas that ensure data integrity and structured outputs every time.'
      },
      layout: {
        title: 'Streaming Validation',
        description: 'Use web standards to stream real-time validation feedback. Keep interactions fast, responsive, and type-safe for your users.'
      }
    },
    builder: {
      nav: {
        builder: 'Builder',
        forms: 'Forms',
      },
      navbar: {
        themeToggle: {
          toDark: 'Switch to dark mode',
          toLight: 'Switch to light mode',
        },
        profileMenu: 'Profile menu',
        logout: 'Sign out',
      },
      toolbar: {
        clear: 'Clear',
        preview: 'Preview',
        export: 'Export',
        save: 'Save',
        saving: 'Saving...',
      },
      export: {
        title: 'Export form as component',
        description: 'Pick a framework. Copy or download a ready-to-paste component styled with Tailwind.',
        frameworkLabel: 'Framework',
        vue: 'Vue 3',
        react: 'React',
        angular: 'Angular',
        filenameLabel: 'Filename',
        copy: 'Copy',
        copied: 'Copied',
        download: 'Download',
        empty: 'Add fields to your form before exporting.',
        close: 'Close',
      },
    },
    auth: {
      login: {
        title: 'Welcome back',
        subtitle: 'Sign in to your account',
        emailLabel: 'Email address',
        emailPlaceholder: "you{'@'}example.com",
        passwordLabel: 'Password',
        passwordPlaceholder: '••••••••',
        forgotPassword: 'Forgot password?',
        submit: 'Sign in',
        loading: 'Signing in...',
        noAccount: "Don't have an account?",
        signUp: 'Sign up',
      },
      register: {
        title: 'Create account',
        subtitle: 'Start building forms for free',
        nameLabel: 'Full name',
        namePlaceholder: 'Your name',
        emailLabel: 'Email address',
        emailPlaceholder: "you{'@'}example.com",
        passwordLabel: 'Password',
        passwordPlaceholder: 'Min. 8 characters',
        confirmPasswordLabel: 'Confirm password',
        confirmPasswordPlaceholder: 'Repeat password',
        submit: 'Create account',
        loading: 'Creating account...',
        hasAccount: 'Already have an account?',
        signIn: 'Sign in',
      },
      verifyEmail: {
        title: 'Verify your email',
        subtitle: 'We sent a verification link to',
        emailSentTo: '{email}',
        description: 'Please click the link in the email to verify your account. If you don\'t see it, check your spam folder.',
        checkStatus: 'Check verification status',
        resend: 'Resend verification email',
        resendCooldown: 'Resend in {s}s',
        resendSuccess: 'Verification email sent!',
        backToLogin: 'Back to sign in',
        verifiedSuccess: 'Email verified! Redirecting...',
      },
      forgotPassword: {
        title: 'Reset password',
        subtitle: "We'll send you a reset link",
        emailLabel: 'Email address',
        emailPlaceholder: "you{'@'}example.com",
        submit: 'Send reset link',
        loading: 'Sending...',
        back: 'Back to sign in',
        success: {
          title: 'Check your inbox',
          message: 'We sent a password reset link to {email}',
          back: 'Back to sign in',
        },
      },
      errors: {
        userNotFound: 'No account found with this email',
        wrongPassword: 'Incorrect password',
        invalidCredential: 'Invalid email or password',
        emailInUse: 'An account with this email already exists',
        weakPassword: 'Password must be at least 6 characters',
        invalidEmail: 'Please enter a valid email address',
        tooManyRequests: 'Too many attempts. Please try again later',
        networkError: 'Network error. Check your connection',
        generic: 'Something went wrong. Please try again',
        passwordMismatch: 'Passwords do not match',
      },
      validation: {
        emailRequired: 'Email is required',
        passwordRequired: 'Password is required',
        nameRequired: 'Name is required',
        passwordMinLength: 'Password must be at least 8 characters',
        confirmPasswordRequired: 'Please confirm your password',
      },
    },
  },
  ar: {
    nav: {
      docs: 'المستندات',
      api: 'واجهة المبرمجين',
      examples: 'أمثلة',
      blog: 'المدونة',
      startBtn: 'ابدأ البناء مجاناً',
      logout: 'تسجيل الخروج',
    },
    hero: {
      badge: 'الجديد',
      badgeText: 'تم إطلاق النماذج التوليدية',
      titleP1: 'إطار الذكاء الاصطناعي لـ ',
      titleGradient: 'النماذج التوليدية',
      description: 'قم بتضمين الذكاء الاصطناعي في جمع البيانات الخاصة بمنتجك عن طريق دمج النماذج اللغوية الضخمة (LLMs) مع مكونات النماذج ومنطق واجهة المستخدم.',
      cta: 'ابدأ البناء مجاناً',
      learnMore: 'اعرف المزيد'
    },
    features: {
      title: 'تحكم كامل',
      subtitle: 'جودة عالية وموثوقة، جاهزة للإطلاق',
      ai: {
        title: 'نماذج توليدية',
        description: 'حدد متطلبات النماذج الخاصة بك ودع FormAI يستخدم الذكاء الاصطناعي لتوفير إدخالات ديناميكية. أنت من يتحكم بالكامل.'
      },
      drag: {
        title: 'بيانات مهيكلة',
        description: 'يحول FormAI اللغة الطبيعية إلى مخططات بيانات صارمة تضمن سلامة البيانات والمخرجات المهيكلة في كل مرة.'
      },
      layout: {
        title: 'تحقق مباشر وتدفق سريع',
        description: 'استخدم معايير الويب لتدفق ملاحظات التحقق في الوقت الفعلي. حافظ على سرعة الاستجابة والدقة العالية للمستخدمين.'
      }
    },
    builder: {
      nav: {
        builder: 'المنشئ',
        forms: 'النماذج',
      },
      navbar: {
        themeToggle: {
          toDark: 'التبديل إلى الوضع الداكن',
          toLight: 'التبديل إلى الوضع الفاتح',
        },
        profileMenu: 'قائمة الملف الشخصي',
        logout: 'تسجيل الخروج',
      },
      toolbar: {
        clear: 'مسح',
        preview: 'معاينة',
        export: 'تصدير',
        save: 'حفظ',
        saving: 'جارٍ الحفظ...',
      },
      export: {
        title: 'تصدير النموذج كمكوّن',
        description: 'اختر إطار العمل. انسخ أو نزّل مكوّناً جاهزاً مصمماً بـ Tailwind.',
        frameworkLabel: 'إطار العمل',
        vue: 'Vue 3',
        react: 'React',
        angular: 'Angular',
        filenameLabel: 'اسم الملف',
        copy: 'نسخ',
        copied: 'تم النسخ',
        download: 'تنزيل',
        empty: 'أضف حقولاً إلى النموذج قبل التصدير.',
        close: 'إغلاق',
      },
    },
    auth: {
      login: {
        title: 'مرحباً بعودتك',
        subtitle: 'سجّل دخولك إلى حسابك',
        emailLabel: 'البريد الإلكتروني',
        emailPlaceholder: "you{'@'}example.com",
        passwordLabel: 'كلمة المرور',
        passwordPlaceholder: '••••••••',
        forgotPassword: 'نسيت كلمة المرور؟',
        submit: 'تسجيل الدخول',
        loading: 'جارٍ تسجيل الدخول...',
        noAccount: 'ليس لديك حساب؟',
        signUp: 'إنشاء حساب',
      },
      register: {
        title: 'إنشاء حساب',
        subtitle: 'ابدأ بناء النماذج مجاناً',
        nameLabel: 'الاسم الكامل',
        namePlaceholder: 'اسمك',
        emailLabel: 'البريد الإلكتروني',
        emailPlaceholder: "you{'@'}example.com",
        passwordLabel: 'كلمة المرور',
        passwordPlaceholder: '٨ أحرف على الأقل',
        confirmPasswordLabel: 'تأكيد كلمة المرور',
        confirmPasswordPlaceholder: 'أعد كتابة كلمة المرور',
        submit: 'إنشاء الحساب',
        loading: 'جارٍ إنشاء الحساب...',
        hasAccount: 'لديك حساب بالفعل؟',
        signIn: 'تسجيل الدخول',
      },
      verifyEmail: {
        title: 'تحقق من بريدك الإلكتروني',
        subtitle: 'أرسلنا رابط التحقق إلى',
        emailSentTo: '{email}',
        description: 'يرجى النقر فوق الرابط الموجود في البريد الإلكتروني للتحقق من حسابك. إذا لم تره، فافحص مجلد البريد العشوائي.',
        checkStatus: 'التحقق من حالة الحساب',
        resend: 'إعادة إرسال بريد التحقق',
        resendCooldown: 'إعادة الإرسال خلال {s} ثانية',
        resendSuccess: 'تم إرسال بريد التحقق!',
        backToLogin: 'العودة لتسجيل الدخول',
        verifiedSuccess: 'تم التحقق من البريد! جاري التحويل...',
      },
      forgotPassword: {
        title: 'إعادة تعيين كلمة المرور',
        subtitle: 'سنرسل لك رابط الإعادة',
        emailLabel: 'البريد الإلكتروني',
        emailPlaceholder: "you{'@'}example.com",
        submit: 'إرسال رابط الإعادة',
        loading: 'جارٍ الإرسال...',
        back: 'العودة لتسجيل الدخول',
        success: {
          title: 'تحقق من بريدك الوارد',
          message: 'أرسلنا رابط إعادة تعيين كلمة المرور إلى {email}',
          back: 'العودة لتسجيل الدخول',
        },
      },
      errors: {
        userNotFound: 'لا يوجد حساب بهذا البريد الإلكتروني',
        wrongPassword: 'كلمة مرور غير صحيحة',
        invalidCredential: 'البريد أو كلمة المرور غير صحيحة',
        emailInUse: 'يوجد حساب بهذا البريد الإلكتروني مسبقاً',
        weakPassword: 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل',
        invalidEmail: 'الرجاء إدخال بريد إلكتروني صحيح',
        tooManyRequests: 'محاولات كثيرة جداً. الرجاء المحاولة لاحقاً',
        networkError: 'خطأ في الشبكة. تحقق من اتصالك',
        generic: 'حدث خطأ ما. الرجاء المحاولة مجدداً',
        passwordMismatch: 'كلمتا المرور غير متطابقتين',
      },
      validation: {
        emailRequired: 'البريد الإلكتروني مطلوب',
        passwordRequired: 'كلمة المرور مطلوبة',
        nameRequired: 'الاسم مطلوب',
        passwordMinLength: 'يجب أن تكون كلمة المرور 8 أحرف على الأقل',
        confirmPasswordRequired: 'الرجاء تأكيد كلمة المرور',
      },
    },
  }
}

export const i18n = createI18n({
  legacy: false, // use Composition API
  locale: initialLocale,
  fallbackLocale: 'en',
  messages,
})

// Single source of truth for locale side effects: whoever sets locale,
// DOM direction/lang and localStorage stay in sync.
watch(
  () => i18n.global.locale.value,
  (next) => {
    document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = next
    localStorage.setItem(LOCALE_KEY, next)
  }
)
