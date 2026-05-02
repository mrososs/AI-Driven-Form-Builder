<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  KeyRound, Sparkles, Code2, LayoutList, FileText,
  Layers, FileStack, Copy, Check, Plug, Terminal,
  ChevronRight, Cpu,
} from 'lucide-vue-next'

const { t } = useI18n()

const ENDPOINT = 'https://ai-driven-form-builder.vercel.app/api/mcp'

const copiedEndpoint = ref(false)
const copiedClient = ref<string | null>(null)
const activeClient = ref<'claude' | 'cursor' | 'claudeCode'>('claude')

async function copyEndpoint() {
  await navigator.clipboard.writeText(ENDPOINT)
  copiedEndpoint.value = true
  setTimeout(() => { copiedEndpoint.value = false }, 2000)
}

async function copyConfig(clientKey: string, text: string) {
  await navigator.clipboard.writeText(text)
  copiedClient.value = clientKey
  setTimeout(() => { copiedClient.value = null }, 2000)
}

const configs: Record<string, string> = {
  claude: `{\n  "mcpServers": {\n    "ai-form-builder": {\n      "url": "${ENDPOINT}"\n    }\n  }\n}`,
  cursor: `{\n  "mcpServers": {\n    "ai-form-builder": {\n      "url": "${ENDPOINT}"\n    }\n  }\n}`,
  claudeCode: `{\n  "mcpServers": {\n    "ai-form-builder": {\n      "type": "http",\n      "url": "${ENDPOINT}"\n    }\n  }\n}`,
}

const configMeta = [
  { key: 'claude',     label: 'Claude Desktop', file: 'claude_desktop_config.json' },
  { key: 'cursor',     label: 'Cursor',          file: '.cursor/mcp.json' },
  { key: 'claudeCode', label: 'Claude Code',     file: '~/.claude/settings.json' },
] as const

type ToolColor = 'violet' | 'indigo' | 'sky' | 'emerald' | 'amber'

const TOOLS: { name: string; icon: typeof KeyRound; color: ToolColor; params: string[] }[] = [
  { name: 'authenticate',       icon: KeyRound,    color: 'violet',  params: ['email', 'password'] },
  { name: 'generate_form',      icon: Sparkles,    color: 'indigo',  params: ['prompt', 'token', 'mode?'] },
  { name: 'generate_code',      icon: Code2,       color: 'sky',     params: ['elements', 'title', 'framework'] },
  { name: 'list_forms',         icon: LayoutList,  color: 'emerald', params: ['token'] },
  { name: 'get_form',           icon: FileText,    color: 'emerald', params: ['form_id', 'token'] },
  { name: 'list_multistep_forms', icon: Layers,    color: 'amber',   params: ['token'] },
  { name: 'get_multistep_form', icon: FileStack,   color: 'amber',   params: ['form_id', 'token'] },
]

const colorMap: Record<ToolColor, { icon: string; badge: string; border: string; bg: string }> = {
  violet:  { icon: 'text-violet-500 dark:text-violet-400',  badge: 'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-200/70 dark:border-violet-500/20',  border: 'border-violet-200/80 dark:border-violet-500/20',  bg: 'bg-violet-50 dark:bg-violet-500/10' },
  indigo:  { icon: 'text-indigo-500 dark:text-indigo-400',  badge: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-200/70 dark:border-indigo-500/20',   border: 'border-indigo-200/80 dark:border-indigo-500/20',  bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
  sky:     { icon: 'text-sky-500 dark:text-sky-400',        badge: 'bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-200/70 dark:border-sky-500/20',                     border: 'border-sky-200/80 dark:border-sky-500/20',        bg: 'bg-sky-50 dark:bg-sky-500/10' },
  emerald: { icon: 'text-emerald-500 dark:text-emerald-400',badge: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200/70 dark:border-emerald-500/20', border: 'border-emerald-200/80 dark:border-emerald-500/20', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
  amber:   { icon: 'text-amber-500 dark:text-amber-400',    badge: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200/70 dark:border-amber-500/20',         border: 'border-amber-200/80 dark:border-amber-500/20',    bg: 'bg-amber-50 dark:bg-amber-500/10' },
}
</script>

<template>
  <section id="mcp" class="relative w-full py-24 sm:py-32 scroll-mt-16">

    <!-- Subtle top separator -->
    <div class="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-white/10 to-transparent pointer-events-none" aria-hidden="true" />

    <!-- ── SECTION HEADER ─────────────────────────────────────────── -->
    <div class="mx-auto max-w-3xl px-6 text-center">
      <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
        bg-emerald-50 dark:bg-emerald-500/10
        border border-emerald-200/70 dark:border-emerald-500/20
        text-emerald-700 dark:text-emerald-300
        text-[11px] font-semibold uppercase tracking-widest mb-4">
        <Plug class="h-3.5 w-3.5" aria-hidden="true" />
        {{ t('mcp.eyebrow') }}
      </div>
      <h2 class="font-heading font-bold tracking-tight text-3xl sm:text-4xl text-slate-900 dark:text-white">
        {{ t('mcp.title') }}
      </h2>
      <p class="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
        {{ t('mcp.subtitle') }}
      </p>
    </div>

    <!-- ── ENDPOINT URL ──────────────────────────────────────────── -->
    <div class="mx-auto mt-10 max-w-2xl px-6">
      <p class="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2 text-center">
        {{ t('mcp.endpointLabel') }}
      </p>
      <div class="flex items-center gap-3 px-4 py-3 rounded-xl
        bg-slate-50 dark:bg-white/[0.04]
        border border-slate-200 dark:border-white/[0.10]
        shadow-sm">
        <span class="flex-1 font-mono text-sm text-indigo-600 dark:text-indigo-400 truncate" dir="ltr">
          {{ ENDPOINT }}
        </span>
        <button
          @click="copyEndpoint"
          class="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
            transition-all duration-200
            bg-white dark:bg-white/[0.06]
            border border-slate-200 dark:border-white/[0.10]
            text-slate-600 dark:text-slate-300
            hover:border-indigo-300 dark:hover:border-indigo-500/40
            hover:text-indigo-600 dark:hover:text-indigo-400"
          :aria-label="t('mcp.copy')"
        >
          <Check v-if="copiedEndpoint" class="h-3.5 w-3.5 text-emerald-500" />
          <Copy v-else class="h-3.5 w-3.5" />
          {{ copiedEndpoint ? t('mcp.copied') : t('mcp.copy') }}
        </button>
      </div>
    </div>

    <!-- ── CLIENT SETUP ──────────────────────────────────────────── -->
    <div class="mx-auto mt-16 max-w-7xl px-6 lg:px-8">
      <div class="text-center mb-10">
        <p class="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
          {{ t('mcp.setup.eyebrow') }}
        </p>
        <h3 class="font-heading font-bold text-2xl text-slate-900 dark:text-white">
          {{ t('mcp.setup.title') }}
        </h3>
        <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {{ t('mcp.setup.subtitle') }}
        </p>
      </div>

      <!-- Client tabs -->
      <div class="flex items-center justify-center gap-2 mb-6 flex-wrap">
        <button
          v-for="cm in configMeta"
          :key="cm.key"
          @click="activeClient = cm.key"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
            activeClient === cm.key
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
              : 'bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.08]'
          ]"
        >
          {{ cm.label }}
        </button>
      </div>

      <!-- Active client config card -->
      <div class="mx-auto max-w-2xl">
        <div
          v-for="cm in configMeta"
          v-show="activeClient === cm.key"
          :key="cm.key"
          class="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/[0.09] shadow-lg shadow-black/5 dark:shadow-black/30"
        >
          <!-- Header bar -->
          <div class="flex items-center justify-between px-4 py-2.5
            bg-slate-100 dark:bg-white/[0.04]
            border-b border-slate-200 dark:border-white/[0.07]">
            <div class="flex items-center gap-2">
              <Terminal class="h-3.5 w-3.5 text-slate-400 dark:text-white/40" />
              <span class="font-mono text-xs text-slate-500 dark:text-slate-400" dir="ltr">{{ cm.file }}</span>
            </div>
            <button
              @click="copyConfig(cm.key, configs[cm.key])"
              class="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium
                transition-all duration-200
                bg-white dark:bg-white/[0.05]
                border border-slate-200 dark:border-white/[0.10]
                text-slate-500 dark:text-slate-400
                hover:text-indigo-600 dark:hover:text-indigo-400
                hover:border-indigo-300 dark:hover:border-indigo-500/40"
            >
              <Check v-if="copiedClient === cm.key" class="h-3 w-3 text-emerald-500" />
              <Copy v-else class="h-3 w-3" />
              {{ copiedClient === cm.key ? t('mcp.copied') : t('mcp.copy') }}
            </button>
          </div>
          <!-- Code block -->
          <pre class="p-5 text-sm leading-relaxed overflow-x-auto
            bg-white dark:bg-[#0c0c18]
            text-slate-700 dark:text-slate-200
            font-mono" dir="ltr"><code>{{ configs[cm.key] }}</code></pre>
        </div>
      </div>

      <!-- Setup steps below the code block -->
      <ol class="mx-auto mt-8 max-w-2xl space-y-3">
        <li
          v-for="(step, i) in [t('mcp.setup.step1'), t('mcp.setup.step2'), t('mcp.setup.step3')]"
          :key="i"
          class="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400"
        >
          <span class="shrink-0 flex items-center justify-center w-5 h-5 rounded-full
            bg-indigo-100 dark:bg-indigo-500/20
            text-indigo-600 dark:text-indigo-300
            text-[11px] font-bold ring-1 ring-indigo-200/60 dark:ring-indigo-500/30 mt-0.5">
            {{ i + 1 }}
          </span>
          <span>{{ step }}</span>
        </li>
      </ol>
    </div>

    <!-- ── TOOLS REFERENCE ───────────────────────────────────────── -->
    <div class="mx-auto mt-24 max-w-7xl px-6 lg:px-8">
      <div class="text-center mb-12">
        <p class="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
          {{ t('mcp.tools.eyebrow') }}
        </p>
        <h3 class="font-heading font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white">
          {{ t('mcp.tools.title') }}
        </h3>
        <p class="mt-3 text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          {{ t('mcp.tools.subtitle') }}
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div
          v-for="tool in TOOLS"
          :key="tool.name"
          class="group relative flex flex-col gap-3 p-5 rounded-2xl
            bg-white dark:bg-white/[0.03]
            border border-slate-200 dark:border-white/[0.07]
            hover:shadow-lg dark:hover:shadow-black/30
            transition-all duration-300"
          :class="`hover:border-current`"
          :style="''"
        >
          <!-- Icon -->
          <div class="flex items-center justify-between">
            <div
              class="flex items-center justify-center w-10 h-10 rounded-xl border transition-transform duration-300 group-hover:scale-105"
              :class="[colorMap[tool.color].bg, colorMap[tool.color].border]"
            >
              <component :is="tool.icon" class="h-5 w-5" :class="colorMap[tool.color].icon" aria-hidden="true" />
            </div>
          </div>

          <!-- Tool name -->
          <div>
            <code class="text-sm font-semibold font-mono text-slate-800 dark:text-white">
              {{ tool.name }}
            </code>
            <p class="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              {{ t(`mcp.tools.items.${tool.name}`) }}
            </p>
          </div>

          <!-- Params -->
          <div class="flex flex-wrap gap-1 mt-auto">
            <span
              v-for="param in tool.params"
              :key="param"
              class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium border"
              :class="param.endsWith('?')
                ? 'bg-slate-50 dark:bg-white/[0.04] text-slate-400 dark:text-slate-500 border-slate-200/70 dark:border-white/[0.07]'
                : colorMap[tool.color].badge"
            >
              {{ param }}
            </span>
          </div>
        </div>
      </div>

      <!-- Legend -->
      <p class="mt-5 text-center text-xs text-slate-400 dark:text-slate-500">
        {{ t('mcp.tools.legend') }}
      </p>
    </div>

    <!-- ── USAGE FLOW ─────────────────────────────────────────────── -->
    <div class="mx-auto mt-24 max-w-7xl px-6 lg:px-8">
      <div class="text-center mb-12">
        <h3 class="font-heading font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white">
          {{ t('mcp.flow.title') }}
        </h3>
        <p class="mt-3 text-sm text-slate-500 dark:text-slate-400">
          {{ t('mcp.flow.subtitle') }}
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">

        <!-- Step 1: Authenticate -->
        <div class="relative flex flex-col gap-4 p-7 rounded-2xl
          bg-violet-50 dark:bg-violet-500/[0.07]
          border border-violet-200/70 dark:border-violet-500/20">
          <div class="flex items-center gap-3">
            <div class="flex items-center justify-center w-10 h-10 rounded-xl
              bg-white dark:bg-violet-500/20
              border border-violet-200/80 dark:border-violet-500/30 shadow-sm">
              <KeyRound class="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            <span class="text-xs font-semibold uppercase tracking-wider text-violet-500 dark:text-violet-400">
              {{ t('mcp.flow.step') }} 1
            </span>
          </div>
          <div>
            <h4 class="font-semibold text-slate-900 dark:text-white mb-1">{{ t('mcp.flow.auth.title') }}</h4>
            <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{{ t('mcp.flow.auth.desc') }}</p>
          </div>
          <div dir="ltr" class="mt-auto p-3 rounded-xl bg-white/70 dark:bg-white/[0.05] border border-violet-100 dark:border-white/[0.06] font-mono text-xs text-slate-700 dark:text-slate-200 leading-loose">
            <span class="text-slate-400 dark:text-slate-500">tool: </span><span class="text-violet-600 dark:text-violet-300">authenticate</span><br>
            <span class="text-slate-400 dark:text-slate-500">email: </span><span class="text-emerald-600 dark:text-emerald-300">"you@example.com"</span><br>
            <span class="text-slate-400 dark:text-slate-500">password: </span><span class="text-emerald-600 dark:text-emerald-300">"••••••••"</span>
          </div>
        </div>

        <!-- Arrow connector (desktop) -->
        <!-- Step 2: Generate -->
        <div class="relative flex flex-col gap-4 p-7 rounded-2xl
          bg-indigo-50 dark:bg-indigo-500/[0.07]
          border border-indigo-200/70 dark:border-indigo-500/20">
          <div class="flex items-center gap-3">
            <div class="flex items-center justify-center w-10 h-10 rounded-xl
              bg-white dark:bg-indigo-500/20
              border border-indigo-200/80 dark:border-indigo-500/30 shadow-sm">
              <Sparkles class="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span class="text-xs font-semibold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">
              {{ t('mcp.flow.step') }} 2
            </span>
          </div>
          <div>
            <h4 class="font-semibold text-slate-900 dark:text-white mb-1">{{ t('mcp.flow.generate.title') }}</h4>
            <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{{ t('mcp.flow.generate.desc') }}</p>
          </div>
          <div dir="ltr" class="mt-auto p-3 rounded-xl bg-white/70 dark:bg-white/[0.05] border border-indigo-100 dark:border-white/[0.06] font-mono text-xs text-slate-700 dark:text-slate-200 leading-loose">
            <span class="text-slate-400 dark:text-slate-500">tool: </span><span class="text-indigo-600 dark:text-indigo-300">generate_form</span><br>
            <span class="text-slate-400 dark:text-slate-500">prompt: </span><span class="text-emerald-600 dark:text-emerald-300">"Job application..."</span><br>
            <span class="text-slate-400 dark:text-slate-500">token: </span><span class="text-amber-600 dark:text-amber-300">&lt;from step 1&gt;</span>
          </div>
        </div>

        <!-- Step 3: Export code -->
        <div class="relative flex flex-col gap-4 p-7 rounded-2xl
          bg-sky-50 dark:bg-sky-500/[0.07]
          border border-sky-200/70 dark:border-sky-500/20">
          <div class="flex items-center gap-3">
            <div class="flex items-center justify-center w-10 h-10 rounded-xl
              bg-white dark:bg-sky-500/20
              border border-sky-200/80 dark:border-sky-500/30 shadow-sm">
              <Code2 class="h-5 w-5 text-sky-600 dark:text-sky-400" />
            </div>
            <span class="text-xs font-semibold uppercase tracking-wider text-sky-500 dark:text-sky-400">
              {{ t('mcp.flow.step') }} 3
            </span>
          </div>
          <div>
            <h4 class="font-semibold text-slate-900 dark:text-white mb-1">{{ t('mcp.flow.code.title') }}</h4>
            <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{{ t('mcp.flow.code.desc') }}</p>
          </div>
          <div dir="ltr" class="mt-auto p-3 rounded-xl bg-white/70 dark:bg-white/[0.05] border border-sky-100 dark:border-white/[0.06] font-mono text-xs text-slate-700 dark:text-slate-200 leading-loose">
            <span class="text-slate-400 dark:text-slate-500">tool: </span><span class="text-sky-600 dark:text-sky-300">generate_code</span><br>
            <span class="text-slate-400 dark:text-slate-500">framework: </span><span class="text-emerald-600 dark:text-emerald-300">"vue"</span><br>
            <span class="text-slate-400 dark:text-slate-500">elements: </span><span class="text-amber-600 dark:text-amber-300">&lt;from step 2&gt;</span>
          </div>
        </div>

      </div>

      <!-- CTA strip -->
      <div class="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
        <a
          href="/register"
          class="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold
            text-white bg-indigo-600 hover:bg-indigo-500
            dark:bg-gradient-to-r dark:from-indigo-500 dark:to-violet-600 dark:hover:from-indigo-400 dark:hover:to-violet-500
            shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40
            transition-all duration-200 hover:-translate-y-px"
        >
          {{ t('mcp.flow.cta') }}
          <ChevronRight class="h-4 w-4" />
        </a>
        <a
          href="https://modelcontextprotocol.io"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium
            text-slate-600 dark:text-slate-300
            bg-slate-100 dark:bg-white/[0.05]
            border border-slate-200 dark:border-white/[0.08]
            hover:border-slate-300 dark:hover:border-white/[0.14]
            transition-all duration-200"
        >
          <Cpu class="h-4 w-4" />
          {{ t('mcp.flow.learnMcp') }}
        </a>
      </div>
    </div>

  </section>
</template>
