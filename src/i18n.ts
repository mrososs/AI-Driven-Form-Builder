import { createI18n } from 'vue-i18n'

const messages = {
  en: {
    nav: {
      docs: 'Docs',
      api: 'API',
      examples: 'Examples',
      blog: 'Blog',
      startBtn: 'Start Building Free',
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
    }
  },
  ar: {
    nav: {
      docs: 'المستندات',
      api: 'واجهة المبرمجين',
      examples: 'أمثلة',
      blog: 'المدونة',
      startBtn: 'ابدأ البناء مجاناً',
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
    }
  }
}

export const i18n = createI18n({
  legacy: false, // use Composition API
  locale: 'en', // default locale
  fallbackLocale: 'en',
  messages,
})
