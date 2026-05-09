<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  KeyRound, Sparkles, Code2, LayoutList, FileText,
  Layers, FileStack, Copy, Check, Plug, Terminal,
  ChevronRight, Cpu, CheckCircle2, MonitorPlay,
} from 'lucide-vue-next'

const { t } = useI18n()

const ENDPOINT = 'https://ai-driven-form-builder.vercel.app/api/mcp'
const CLI_COMMAND = `claude mcp add ai-form-builder --transport http ${ENDPOINT}`

const copiedEndpoint = ref(false)
const copiedClient  = ref<string | null>(null)
const copiedCli     = ref(false)

const activeClient      = ref<'claude' | 'cursor' | 'vscode' | 'windsurf' | 'claudeCode'>('claude')
const activeOS          = ref<'mac' | 'windows'>('mac')
const claudeCodeMethod  = ref<'cli' | 'config'>('cli')

async function copyEndpoint() {
  await navigator.clipboard.writeText(ENDPOINT)
  copiedEndpoint.value = true
  setTimeout(() => (copiedEndpoint.value = false), 2000)
}

async function copyConfig(key: string, text: string) {
  await navigator.clipboard.writeText(text)
  copiedClient.value = key
  setTimeout(() => (copiedClient.value = null), 2000)
}

async function copyCli() {
  await navigator.clipboard.writeText(CLI_COMMAND)
  copiedCli.value = true
  setTimeout(() => (copiedCli.value = false), 2000)
}

const claudeConfigPath = computed(() =>
  activeOS.value === 'mac'
    ? '~/Library/Application Support/Claude/claude_desktop_config.json'
    : '%APPDATA%\\Claude\\claude_desktop_config.json',
)

const MCP_REMOTE_ARGS = `[\n        "-y",\n        "mcp-remote",\n        "${ENDPOINT}"\n      ]`

const configs: Record<string, string> = {
  claude:    `{\n  "mcpServers": {\n    "ai-form-builder": {\n      "command": "npx",\n      "args": ${MCP_REMOTE_ARGS}\n    }\n  }\n}`,
  cursor:    `{\n  "mcpServers": {\n    "ai-form-builder": {\n      "command": "npx",\n      "args": ${MCP_REMOTE_ARGS}\n    }\n  }\n}`,
  vscode:    `{\n  "servers": {\n    "ai-form-builder": {\n      "type": "stdio",\n      "command": "npx",\n      "args": ${MCP_REMOTE_ARGS}\n    }\n  }\n}`,
  windsurf:  `{\n  "mcpServers": {\n    "ai-form-builder": {\n      "command": "npx",\n      "args": ${MCP_REMOTE_ARGS}\n    }\n  }\n}`,
  claudeCode:`{\n  "mcpServers": {\n    "ai-form-builder": {\n      "type": "http",\n      "url": "${ENDPOINT}"\n    }\n  }\n}`,
}

const configMeta = [
  { key: 'claude',     label: 'Claude Desktop', shortLabel: 'Claude' },
  { key: 'cursor',     label: 'Cursor',          shortLabel: 'Cursor' },
  { key: 'vscode',     label: 'VS Code',         shortLabel: 'VS Code' },
  { key: 'windsurf',   label: 'Windsurf',        shortLabel: 'Windsurf' },
  { key: 'claudeCode', label: 'Claude Code',     shortLabel: 'Code' },
] as const

const claudeSteps = computed(() => [
  'Install Claude Desktop from claude.ai/download if you haven\'t already.',
  `Open the config file at the path shown above${activeOS.value === 'mac' ? ' (create it if it doesn\'t exist)' : ''}.`,
  'Add the mcpServers block — merge into the existing JSON object if the file already has content.',
  `Fully quit Claude Desktop ${activeOS.value === 'mac' ? '(⌘Q)' : '(Alt+F4)'} then relaunch it.`,
  'A hammer icon (🔨) in the chat input confirms MCP tools are loaded and ready.',
])

const cursorSteps = [
  'Create .cursor/mcp.json in your project root for project-scoped tools.',
  'For tools available across all projects, use ~/.cursor/mcp.json instead.',
  'Paste the config block above into the chosen file.',
  'Reload Cursor: Cmd+Shift+P (or Ctrl+Shift+P) → "Developer: Reload Window".',
  'Open the AI panel — ai-form-builder tools appear in the tool list automatically.',
]

const claudeCodeCliSteps = [
  'Run the command above in any terminal — no client restart needed.',
  'Verify the connection: type /mcp in a Claude Code session.',
  'Look for ai-form-builder in the server list — tools are ready immediately.',
]

const claudeCodeConfigSteps = [
  'Open ~/.claude/settings.json in any editor. Create it if it doesn\'t exist.',
  'Paste the mcpServers block above (merge if the file already has other settings).',
  'Save the file — no restart needed.',
  'Verify: type /mcp in Claude Code and confirm ai-form-builder appears.',
]

const vsCodeSteps = [
  'Make sure you have GitHub Copilot (v1.99+) or a Copilot-compatible extension installed.',
  'Create .vscode/mcp.json at your project root — VS Code will detect it automatically.',
  'Paste the servers block above (merge if the file already has content).',
  'Reload VS Code: Cmd+Shift+P (or Ctrl+Shift+P) → "Developer: Reload Window".',
  'Switch GitHub Copilot Chat to Agent mode — ai-form-builder tools appear in the tool picker.',
]

const windsurfSteps = [
  'Open Windsurf → Preferences → MCP, or edit ~/.codeium/windsurf/mcp_config.json directly.',
  'Paste the mcpServers block above (create the file if it doesn\'t exist).',
  'Click "Refresh" in the MCP settings panel, or fully restart Windsurf.',
  'Open a new Cascade session — ai-form-builder tools appear in the tool list automatically.',
]

type ToolColor = 'violet' | 'indigo' | 'sky' | 'emerald' | 'amber'

const TOOLS: { name: string; icon: typeof KeyRound; color: ToolColor; params: string[] }[] = [
  { name: 'authenticate',         icon: KeyRound,   color: 'violet',  params: ['email', 'password'] },
  { name: 'generate_form',        icon: Sparkles,   color: 'indigo',  params: ['prompt', 'token', 'mode?'] },
  { name: 'generate_code',        icon: Code2,      color: 'sky',     params: ['elements', 'title', 'framework'] },
  { name: 'list_forms',           icon: LayoutList, color: 'emerald', params: ['token'] },
  { name: 'get_form',             icon: FileText,   color: 'emerald', params: ['form_id', 'token'] },
  { name: 'list_multistep_forms', icon: Layers,     color: 'amber',   params: ['token'] },
  { name: 'get_multistep_form',   icon: FileStack,  color: 'amber',   params: ['form_id', 'token'] },
]

const colorMap: Record<ToolColor, { icon: string; badge: string; border: string; bg: string }> = {
  violet:  { icon: 'text-violet-500 dark:text-violet-400',   badge: 'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-200/70 dark:border-violet-500/20',   border: 'border-violet-200/80 dark:border-violet-500/20',  bg: 'bg-violet-50 dark:bg-violet-500/10' },
  indigo:  { icon: 'text-indigo-500 dark:text-indigo-400',   badge: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-200/70 dark:border-indigo-500/20',   border: 'border-indigo-200/80 dark:border-indigo-500/20',  bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
  sky:     { icon: 'text-sky-500 dark:text-sky-400',         badge: 'bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-200/70 dark:border-sky-500/20',                     border: 'border-sky-200/80 dark:border-sky-500/20',        bg: 'bg-sky-50 dark:bg-sky-500/10' },
  emerald: { icon: 'text-emerald-500 dark:text-emerald-400', badge: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200/70 dark:border-emerald-500/20', border: 'border-emerald-200/80 dark:border-emerald-500/20', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
  amber:   { icon: 'text-amber-500 dark:text-amber-400',     badge: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200/70 dark:border-amber-500/20',         border: 'border-amber-200/80 dark:border-amber-500/20',    bg: 'bg-amber-50 dark:bg-amber-500/10' },
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
    <div class="mx-auto mt-20 max-w-7xl px-6 lg:px-8">
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
      <div class="flex items-center justify-center gap-2 mb-8 flex-wrap">
        <button
          v-for="cm in configMeta"
          :key="cm.key"
          @click="activeClient = cm.key"
          :class="[
            'px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200',
            activeClient === cm.key
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
              : 'bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.08]',
          ]"
        >
          {{ cm.label }}
        </button>
      </div>

      <!-- ── CLAUDE DESKTOP CARD ── -->
      <div v-show="activeClient === 'claude'" class="mx-auto max-w-3xl">
        <div class="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/[0.09] shadow-lg shadow-black/5 dark:shadow-black/30">

          <!-- Card header: file path + OS toggle + copy -->
          <div class="flex flex-wrap items-center justify-between gap-3 px-4 py-3
            bg-slate-100 dark:bg-white/[0.04]
            border-b border-slate-200 dark:border-white/[0.07]">
            <div class="flex items-center gap-2 min-w-0">
              <Terminal class="shrink-0 h-3.5 w-3.5 text-slate-400 dark:text-white/40" />
              <span class="font-mono text-xs text-slate-500 dark:text-slate-400 truncate" dir="ltr">
                {{ claudeConfigPath }}
              </span>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <!-- OS toggle -->
              <div class="flex rounded-md overflow-hidden border border-slate-200 dark:border-white/[0.10] text-xs font-medium">
                <button
                  @click="activeOS = 'mac'"
                  :class="[
                    'px-2.5 py-1 transition-colors duration-150',
                    activeOS === 'mac'
                      ? 'bg-slate-700 dark:bg-white/[0.12] text-white dark:text-white'
                      : 'bg-white dark:bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.04]',
                  ]"
                >macOS</button>
                <button
                  @click="activeOS = 'windows'"
                  :class="[
                    'px-2.5 py-1 border-l border-slate-200 dark:border-white/[0.10] transition-colors duration-150',
                    activeOS === 'windows'
                      ? 'bg-slate-700 dark:bg-white/[0.12] text-white dark:text-white'
                      : 'bg-white dark:bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.04]',
                  ]"
                >Windows</button>
              </div>
              <!-- Copy button -->
              <button
                @click="copyConfig('claude', configs.claude)"
                class="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium
                  transition-all duration-200
                  bg-white dark:bg-white/[0.05]
                  border border-slate-200 dark:border-white/[0.10]
                  text-slate-500 dark:text-slate-400
                  hover:text-indigo-600 dark:hover:text-indigo-400
                  hover:border-indigo-300 dark:hover:border-indigo-500/40"
              >
                <Check v-if="copiedClient === 'claude'" class="h-3 w-3 text-emerald-500" />
                <Copy v-else class="h-3 w-3" />
                {{ copiedClient === 'claude' ? t('mcp.copied') : t('mcp.copy') }}
              </button>
            </div>
          </div>

          <!-- Config code -->
          <pre class="p-5 text-sm leading-relaxed overflow-x-auto
            bg-white dark:bg-[#0c0c18]
            text-slate-700 dark:text-slate-200
            font-mono" dir="ltr"><code>{{ configs.claude }}</code></pre>

          <!-- Steps -->
          <div class="px-5 py-5 bg-slate-50/60 dark:bg-white/[0.02] border-t border-slate-200 dark:border-white/[0.07]">
            <p class="text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">Setup steps</p>
            <ol class="space-y-2.5">
              <li
                v-for="(step, i) in claudeSteps"
                :key="i"
                class="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300"
              >
                <span class="shrink-0 flex items-center justify-center w-5 h-5 rounded-full mt-0.5
                  bg-indigo-100 dark:bg-indigo-500/20
                  text-indigo-600 dark:text-indigo-300
                  text-[11px] font-bold ring-1 ring-indigo-200/60 dark:ring-indigo-500/30">
                  {{ i + 1 }}
                </span>
                <span>{{ step }}</span>
              </li>
            </ol>
            <!-- Verify tip -->
            <div class="mt-4 flex items-start gap-2 p-3 rounded-xl
              bg-emerald-50 dark:bg-emerald-500/[0.07]
              border border-emerald-200/70 dark:border-emerald-500/20 text-sm">
              <CheckCircle2 class="shrink-0 h-4 w-4 text-emerald-500 mt-0.5" />
              <p class="text-emerald-700 dark:text-emerald-300 leading-snug">
                <span class="font-semibold">Verify:</span> After relaunch, click the composer's 🔨 icon — <span class="font-mono font-medium">ai-form-builder</span> should appear in the tools list.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- ── CURSOR CARD ── -->
      <div v-show="activeClient === 'cursor'" class="mx-auto max-w-3xl">
        <div class="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/[0.09] shadow-lg shadow-black/5 dark:shadow-black/30">
          <!-- Card header -->
          <div class="flex items-center justify-between px-4 py-3
            bg-slate-100 dark:bg-white/[0.04]
            border-b border-slate-200 dark:border-white/[0.07]">
            <div class="flex items-center gap-2 min-w-0">
              <Terminal class="shrink-0 h-3.5 w-3.5 text-slate-400 dark:text-white/40" />
              <span class="font-mono text-xs text-slate-500 dark:text-slate-400 truncate" dir="ltr">.cursor/mcp.json</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/[0.08] text-slate-500 dark:text-slate-400">project</span>
            </div>
            <button
              @click="copyConfig('cursor', configs.cursor)"
              class="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium
                transition-all duration-200
                bg-white dark:bg-white/[0.05]
                border border-slate-200 dark:border-white/[0.10]
                text-slate-500 dark:text-slate-400
                hover:text-indigo-600 dark:hover:text-indigo-400
                hover:border-indigo-300 dark:hover:border-indigo-500/40"
            >
              <Check v-if="copiedClient === 'cursor'" class="h-3 w-3 text-emerald-500" />
              <Copy v-else class="h-3 w-3" />
              {{ copiedClient === 'cursor' ? t('mcp.copied') : t('mcp.copy') }}
            </button>
          </div>

          <!-- Config code -->
          <pre class="p-5 text-sm leading-relaxed overflow-x-auto
            bg-white dark:bg-[#0c0c18]
            text-slate-700 dark:text-slate-200
            font-mono" dir="ltr"><code>{{ configs.cursor }}</code></pre>

          <!-- Steps -->
          <div class="px-5 py-5 bg-slate-50/60 dark:bg-white/[0.02] border-t border-slate-200 dark:border-white/[0.07]">
            <p class="text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">Setup steps</p>
            <ol class="space-y-2.5">
              <li
                v-for="(step, i) in cursorSteps"
                :key="i"
                class="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300"
              >
                <span class="shrink-0 flex items-center justify-center w-5 h-5 rounded-full mt-0.5
                  bg-indigo-100 dark:bg-indigo-500/20
                  text-indigo-600 dark:text-indigo-300
                  text-[11px] font-bold ring-1 ring-indigo-200/60 dark:ring-indigo-500/30">
                  {{ i + 1 }}
                </span>
                <span>{{ step }}</span>
              </li>
            </ol>
            <!-- Global tip -->
            <div class="mt-4 flex items-start gap-2 p-3 rounded-xl
              bg-sky-50 dark:bg-sky-500/[0.07]
              border border-sky-200/70 dark:border-sky-500/20 text-sm">
              <MonitorPlay class="shrink-0 h-4 w-4 text-sky-500 mt-0.5" />
              <p class="text-sky-700 dark:text-sky-300 leading-snug">
                <span class="font-semibold">Global alternative:</span> Save as <span class="font-mono font-medium">~/.cursor/mcp.json</span> to make the server available in every Cursor project without repeating setup.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- ── VS CODE CARD ── -->
      <div v-show="activeClient === 'vscode'" class="mx-auto max-w-3xl">
        <div class="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/[0.09] shadow-lg shadow-black/5 dark:shadow-black/30">
          <!-- Card header -->
          <div class="flex items-center justify-between px-4 py-3
            bg-slate-100 dark:bg-white/[0.04]
            border-b border-slate-200 dark:border-white/[0.07]">
            <div class="flex items-center gap-2 min-w-0">
              <Terminal class="shrink-0 h-3.5 w-3.5 text-slate-400 dark:text-white/40" />
              <span class="font-mono text-xs text-slate-500 dark:text-slate-400 truncate" dir="ltr">.vscode/mcp.json</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/[0.08] text-slate-500 dark:text-slate-400">project</span>
            </div>
            <button
              @click="copyConfig('vscode', configs.vscode)"
              class="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium
                transition-all duration-200
                bg-white dark:bg-white/[0.05]
                border border-slate-200 dark:border-white/[0.10]
                text-slate-500 dark:text-slate-400
                hover:text-indigo-600 dark:hover:text-indigo-400
                hover:border-indigo-300 dark:hover:border-indigo-500/40"
            >
              <Check v-if="copiedClient === 'vscode'" class="h-3 w-3 text-emerald-500" />
              <Copy v-else class="h-3 w-3" />
              {{ copiedClient === 'vscode' ? t('mcp.copied') : t('mcp.copy') }}
            </button>
          </div>

          <!-- Config code -->
          <pre class="p-5 text-sm leading-relaxed overflow-x-auto
            bg-white dark:bg-[#0c0c18]
            text-slate-700 dark:text-slate-200
            font-mono" dir="ltr"><code>{{ configs.vscode }}</code></pre>

          <!-- Steps -->
          <div class="px-5 py-5 bg-slate-50/60 dark:bg-white/[0.02] border-t border-slate-200 dark:border-white/[0.07]">
            <p class="text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">Setup steps</p>
            <ol class="space-y-2.5">
              <li
                v-for="(step, i) in vsCodeSteps"
                :key="i"
                class="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300"
              >
                <span class="shrink-0 flex items-center justify-center w-5 h-5 rounded-full mt-0.5
                  bg-indigo-100 dark:bg-indigo-500/20
                  text-indigo-600 dark:text-indigo-300
                  text-[11px] font-bold ring-1 ring-indigo-200/60 dark:ring-indigo-500/30">
                  {{ i + 1 }}
                </span>
                <span>{{ step }}</span>
              </li>
            </ol>
            <!-- Note about user-level -->
            <div class="mt-4 flex items-start gap-2 p-3 rounded-xl
              bg-sky-50 dark:bg-sky-500/[0.07]
              border border-sky-200/70 dark:border-sky-500/20 text-sm">
              <MonitorPlay class="shrink-0 h-4 w-4 text-sky-500 mt-0.5" />
              <p class="text-sky-700 dark:text-sky-300 leading-snug">
                <span class="font-semibold">Global alternative:</span> Place the file at
                <span class="font-mono font-medium">~/Library/Application Support/Code/User/mcp.json</span>
                (macOS) or <span class="font-mono font-medium">%APPDATA%\Code\User\mcp.json</span>
                (Windows) to make the server available across all VS Code projects.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- ── WINDSURF CARD ── -->
      <div v-show="activeClient === 'windsurf'" class="mx-auto max-w-3xl">
        <div class="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/[0.09] shadow-lg shadow-black/5 dark:shadow-black/30">
          <!-- Card header -->
          <div class="flex items-center justify-between px-4 py-3
            bg-slate-100 dark:bg-white/[0.04]
            border-b border-slate-200 dark:border-white/[0.07]">
            <div class="flex items-center gap-2 min-w-0">
              <Terminal class="shrink-0 h-3.5 w-3.5 text-slate-400 dark:text-white/40" />
              <span class="font-mono text-xs text-slate-500 dark:text-slate-400 truncate" dir="ltr">~/.codeium/windsurf/mcp_config.json</span>
            </div>
            <button
              @click="copyConfig('windsurf', configs.windsurf)"
              class="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium
                transition-all duration-200
                bg-white dark:bg-white/[0.05]
                border border-slate-200 dark:border-white/[0.10]
                text-slate-500 dark:text-slate-400
                hover:text-indigo-600 dark:hover:text-indigo-400
                hover:border-indigo-300 dark:hover:border-indigo-500/40"
            >
              <Check v-if="copiedClient === 'windsurf'" class="h-3 w-3 text-emerald-500" />
              <Copy v-else class="h-3 w-3" />
              {{ copiedClient === 'windsurf' ? t('mcp.copied') : t('mcp.copy') }}
            </button>
          </div>

          <!-- Config code -->
          <pre class="p-5 text-sm leading-relaxed overflow-x-auto
            bg-white dark:bg-[#0c0c18]
            text-slate-700 dark:text-slate-200
            font-mono" dir="ltr"><code>{{ configs.windsurf }}</code></pre>

          <!-- Steps -->
          <div class="px-5 py-5 bg-slate-50/60 dark:bg-white/[0.02] border-t border-slate-200 dark:border-white/[0.07]">
            <p class="text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">Setup steps</p>
            <ol class="space-y-2.5">
              <li
                v-for="(step, i) in windsurfSteps"
                :key="i"
                class="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300"
              >
                <span class="shrink-0 flex items-center justify-center w-5 h-5 rounded-full mt-0.5
                  bg-indigo-100 dark:bg-indigo-500/20
                  text-indigo-600 dark:text-indigo-300
                  text-[11px] font-bold ring-1 ring-indigo-200/60 dark:ring-indigo-500/30">
                  {{ i + 1 }}
                </span>
                <span>{{ step }}</span>
              </li>
            </ol>
            <!-- Verify tip -->
            <div class="mt-4 flex items-start gap-2 p-3 rounded-xl
              bg-emerald-50 dark:bg-emerald-500/[0.07]
              border border-emerald-200/70 dark:border-emerald-500/20 text-sm">
              <CheckCircle2 class="shrink-0 h-4 w-4 text-emerald-500 mt-0.5" />
              <p class="text-emerald-700 dark:text-emerald-300 leading-snug">
                <span class="font-semibold">Verify:</span> In a Cascade session, click the tool icon — <span class="font-mono font-medium">ai-form-builder</span> should appear with its 7 tools listed.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- ── CLAUDE CODE CARD ── -->
      <div v-show="activeClient === 'claudeCode'" class="mx-auto max-w-3xl">
        <div class="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/[0.09] shadow-lg shadow-black/5 dark:shadow-black/30">

          <!-- Method toggle header -->
          <div class="flex items-center justify-between px-4 py-3
            bg-slate-100 dark:bg-white/[0.04]
            border-b border-slate-200 dark:border-white/[0.07]">
            <div class="flex rounded-md overflow-hidden border border-slate-200 dark:border-white/[0.10] text-xs font-semibold">
              <button
                @click="claudeCodeMethod = 'cli'"
                :class="[
                  'px-3 py-1.5 transition-colors duration-150',
                  claudeCodeMethod === 'cli'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.04]',
                ]"
              >
                CLI Command
              </button>
              <button
                @click="claudeCodeMethod = 'config'"
                :class="[
                  'px-3 py-1.5 border-l border-slate-200 dark:border-white/[0.10] transition-colors duration-150',
                  claudeCodeMethod === 'config'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.04]',
                ]"
              >
                Config File
              </button>
            </div>
            <!-- Copy for config method -->
            <button
              v-if="claudeCodeMethod === 'config'"
              @click="copyConfig('claudeCode', configs.claudeCode)"
              class="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium
                transition-all duration-200
                bg-white dark:bg-white/[0.05]
                border border-slate-200 dark:border-white/[0.10]
                text-slate-500 dark:text-slate-400
                hover:text-indigo-600 dark:hover:text-indigo-400
                hover:border-indigo-300 dark:hover:border-indigo-500/40"
            >
              <Check v-if="copiedClient === 'claudeCode'" class="h-3 w-3 text-emerald-500" />
              <Copy v-else class="h-3 w-3" />
              {{ copiedClient === 'claudeCode' ? t('mcp.copied') : t('mcp.copy') }}
            </button>
          </div>

          <!-- CLI command block -->
          <div v-if="claudeCodeMethod === 'cli'" class="bg-white dark:bg-[#0c0c18]">
            <div class="flex items-center gap-3 px-5 py-4">
              <span class="font-mono text-sm text-emerald-500 dark:text-emerald-400 select-none">$</span>
              <code class="flex-1 font-mono text-sm text-slate-700 dark:text-slate-200 break-all" dir="ltr">{{ CLI_COMMAND }}</code>
              <button
                @click="copyCli"
                class="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium
                  transition-all duration-200
                  bg-slate-100 dark:bg-white/[0.05]
                  border border-slate-200 dark:border-white/[0.10]
                  text-slate-500 dark:text-slate-400
                  hover:text-indigo-600 dark:hover:text-indigo-400
                  hover:border-indigo-300 dark:hover:border-indigo-500/40"
              >
                <Check v-if="copiedCli" class="h-3 w-3 text-emerald-500" />
                <Copy v-else class="h-3 w-3" />
                {{ copiedCli ? t('mcp.copied') : t('mcp.copy') }}
              </button>
            </div>
          </div>

          <!-- Config file block -->
          <pre v-if="claudeCodeMethod === 'config'" class="p-5 text-sm leading-relaxed overflow-x-auto
            bg-white dark:bg-[#0c0c18]
            text-slate-700 dark:text-slate-200
            font-mono" dir="ltr"><code>{{ configs.claudeCode }}</code></pre>

          <!-- Steps -->
          <div class="px-5 py-5 bg-slate-50/60 dark:bg-white/[0.02] border-t border-slate-200 dark:border-white/[0.07]">

            <div v-if="claudeCodeMethod === 'cli'">
              <p class="text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">Setup steps</p>
              <ol class="space-y-2.5">
                <li
                  v-for="(step, i) in claudeCodeCliSteps"
                  :key="i"
                  class="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300"
                >
                  <span class="shrink-0 flex items-center justify-center w-5 h-5 rounded-full mt-0.5
                    bg-indigo-100 dark:bg-indigo-500/20
                    text-indigo-600 dark:text-indigo-300
                    text-[11px] font-bold ring-1 ring-indigo-200/60 dark:ring-indigo-500/30">
                    {{ i + 1 }}
                  </span>
                  <span>{{ step }}</span>
                </li>
              </ol>
            </div>

            <div v-else>
              <p class="text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Config file</p>
              <p class="font-mono text-xs text-indigo-500 dark:text-indigo-400 mb-3" dir="ltr">~/.claude/settings.json</p>
              <ol class="space-y-2.5">
                <li
                  v-for="(step, i) in claudeCodeConfigSteps"
                  :key="i"
                  class="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300"
                >
                  <span class="shrink-0 flex items-center justify-center w-5 h-5 rounded-full mt-0.5
                    bg-indigo-100 dark:bg-indigo-500/20
                    text-indigo-600 dark:text-indigo-300
                    text-[11px] font-bold ring-1 ring-indigo-200/60 dark:ring-indigo-500/30">
                    {{ i + 1 }}
                  </span>
                  <span>{{ step }}</span>
                </li>
              </ol>
            </div>

            <!-- Verify tip -->
            <div class="mt-4 flex items-start gap-2 p-3 rounded-xl
              bg-emerald-50 dark:bg-emerald-500/[0.07]
              border border-emerald-200/70 dark:border-emerald-500/20 text-sm">
              <CheckCircle2 class="shrink-0 h-4 w-4 text-emerald-500 mt-0.5" />
              <p class="text-emerald-700 dark:text-emerald-300 leading-snug">
                <span class="font-semibold">Verify:</span> Run <span class="font-mono font-medium">/mcp</span> in any Claude Code session — <span class="font-mono font-medium">ai-form-builder</span> should appear with status <span class="font-mono font-medium text-emerald-600 dark:text-emerald-400">connected</span>.
              </p>
            </div>
          </div>
        </div>
      </div>
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
        >
          <div class="flex items-center justify-between">
            <div
              class="flex items-center justify-center w-10 h-10 rounded-xl border transition-transform duration-300 group-hover:scale-105"
              :class="[colorMap[tool.color].bg, colorMap[tool.color].border]"
            >
              <component :is="tool.icon" class="h-5 w-5" :class="colorMap[tool.color].icon" aria-hidden="true" />
            </div>
          </div>
          <div>
            <code class="text-sm font-semibold font-mono text-slate-800 dark:text-white">{{ tool.name }}</code>
            <p class="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              {{ t(`mcp.tools.items.${tool.name}`) }}
            </p>
          </div>
          <div class="flex flex-wrap gap-1 mt-auto">
            <span
              v-for="param in tool.params"
              :key="param"
              class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium border"
              :class="param.endsWith('?')
                ? 'bg-slate-50 dark:bg-white/[0.04] text-slate-400 dark:text-slate-500 border-slate-200/70 dark:border-white/[0.07]'
                : colorMap[tool.color].badge"
            >{{ param }}</span>
          </div>
        </div>
      </div>

      <p class="mt-5 text-center text-xs text-slate-400 dark:text-slate-500">
        {{ t('mcp.tools.legend') }}
      </p>
    </div>

    <!-- ── PROTOCOL SEQUENCE DIAGRAM ─────────────────────────────── -->
    <div class="mx-auto mt-24 max-w-5xl px-6 lg:px-8">
      <div class="text-center mb-10">
        <p class="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
          {{ t('mcp.flow.diagram.eyebrow') }}
        </p>
        <h3 class="font-heading font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white">
          {{ t('mcp.flow.diagram.title') }}
        </h3>
        <p class="mt-3 text-sm text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          {{ t('mcp.flow.diagram.subtitle') }}
        </p>
      </div>

      <!-- Frame -->
      <div class="rounded-2xl p-4 sm:p-8
        bg-white dark:bg-white/[0.03]
        border border-slate-200 dark:border-white/[0.07]
        shadow-sm">
        <!-- Horizontal scroll on small screens, diagram is always LTR -->
        <div class="overflow-x-auto -mx-2 px-2" dir="ltr">
          <svg
            viewBox="0 0 800 560"
            class="w-full h-auto min-w-[720px]"
            role="img"
            aria-labelledby="mcp-flow-svg-title"
            preserveAspectRatio="xMidYMid meet"
          >
            <title id="mcp-flow-svg-title">
              MCP request sequence — AI agent to MCP server to Form API to AI provider
            </title>

            <defs>
              <marker id="mcp-arr-violet" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
                <path d="M0,0 L10,5 L0,10 z" class="fill-violet-500 dark:fill-violet-400" />
              </marker>
              <marker id="mcp-arr-indigo" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
                <path d="M0,0 L10,5 L0,10 z" class="fill-indigo-500 dark:fill-indigo-400" />
              </marker>
              <marker id="mcp-arr-sky" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
                <path d="M0,0 L10,5 L0,10 z" class="fill-sky-500 dark:fill-sky-400" />
              </marker>
              <marker id="mcp-arr-slate" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M0,0 L10,5 L0,10 z" class="fill-slate-400 dark:fill-slate-500" />
              </marker>
            </defs>

            <!-- ── ACTORS ── -->
            <!-- AI Agent -->
            <g>
              <rect x="20" y="14" width="160" height="60" rx="12"
                class="fill-white dark:fill-white/[0.05] stroke-slate-200 dark:stroke-white/[0.10]" stroke-width="1" />
              <text x="100" y="40" text-anchor="middle" font-size="14" font-weight="600"
                class="fill-slate-900 dark:fill-white">AI Agent</text>
              <text x="100" y="58" text-anchor="middle" font-size="11"
                class="fill-slate-500 dark:fill-slate-400">Claude · Cursor</text>
            </g>

            <!-- MCP Server (highlighted) -->
            <g>
              <rect x="220" y="14" width="160" height="60" rx="12"
                class="fill-indigo-50 dark:fill-indigo-500/[0.10] stroke-indigo-200 dark:stroke-indigo-500/30" stroke-width="1" />
              <text x="300" y="40" text-anchor="middle" font-size="14" font-weight="600"
                class="fill-indigo-700 dark:fill-indigo-200">MCP Server</text>
              <text x="300" y="58" text-anchor="middle" font-size="11" class="font-mono fill-indigo-500 dark:fill-indigo-300">ai-form-builder</text>
            </g>

            <!-- Form API -->
            <g>
              <rect x="420" y="14" width="160" height="60" rx="12"
                class="fill-white dark:fill-white/[0.05] stroke-slate-200 dark:stroke-white/[0.10]" stroke-width="1" />
              <text x="500" y="40" text-anchor="middle" font-size="14" font-weight="600"
                class="fill-slate-900 dark:fill-white">Form API</text>
              <text x="500" y="58" text-anchor="middle" font-size="11"
                class="fill-slate-500 dark:fill-slate-400">Firebase · REST</text>
            </g>

            <!-- AI Provider -->
            <g>
              <rect x="620" y="14" width="160" height="60" rx="12"
                class="fill-white dark:fill-white/[0.05] stroke-slate-200 dark:stroke-white/[0.10]" stroke-width="1" />
              <text x="700" y="40" text-anchor="middle" font-size="14" font-weight="600"
                class="fill-slate-900 dark:fill-white">AI Provider</text>
              <text x="700" y="58" text-anchor="middle" font-size="11"
                class="fill-slate-500 dark:fill-slate-400">Gemini</text>
            </g>

            <!-- ── LIFELINES ── -->
            <line x1="100" y1="78" x2="100" y2="490" class="stroke-slate-200 dark:stroke-white/[0.10]" stroke-width="1" stroke-dasharray="3 4" />
            <line x1="300" y1="78" x2="300" y2="490" class="stroke-indigo-300/70 dark:stroke-indigo-500/40" stroke-width="1" stroke-dasharray="3 4" />
            <line x1="500" y1="78" x2="500" y2="490" class="stroke-slate-200 dark:stroke-white/[0.10]" stroke-width="1" stroke-dasharray="3 4" />
            <line x1="700" y1="78" x2="700" y2="490" class="stroke-slate-200 dark:stroke-white/[0.10]" stroke-width="1" stroke-dasharray="3 4" />

            <!-- ── PHASE 1 · AUTHENTICATE (violet) ── -->
            <!-- 1: AI Agent → MCP -->
            <text x="200" y="105" text-anchor="middle" font-size="11" class="font-mono fill-violet-600 dark:fill-violet-300">authenticate(email, pwd)</text>
            <line x1="100" y1="115" x2="294" y2="115" stroke-linecap="round" stroke-width="1.5"
              class="stroke-violet-500 dark:stroke-violet-400" marker-end="url(#mcp-arr-violet)" />

            <!-- 2: MCP → Form API -->
            <text x="400" y="143" text-anchor="middle" font-size="11" class="font-mono fill-violet-600 dark:fill-violet-300">verify credentials</text>
            <line x1="300" y1="153" x2="494" y2="153" stroke-linecap="round" stroke-width="1.5"
              class="stroke-violet-500 dark:stroke-violet-400" marker-end="url(#mcp-arr-violet)" />

            <!-- 3: Form API → MCP (response, dashed) -->
            <text x="400" y="181" text-anchor="middle" font-size="11" class="font-mono fill-violet-500 dark:fill-violet-400">JWT token · 1h</text>
            <line x1="500" y1="191" x2="306" y2="191" stroke-linecap="round" stroke-width="1.5" stroke-dasharray="5 4"
              class="stroke-violet-400 dark:stroke-violet-400/70" marker-end="url(#mcp-arr-violet)" />

            <!-- 4: MCP → AI Agent (response, dashed) -->
            <text x="200" y="219" text-anchor="middle" font-size="11" class="font-mono fill-violet-500 dark:fill-violet-400">token</text>
            <line x1="300" y1="229" x2="106" y2="229" stroke-linecap="round" stroke-width="1.5" stroke-dasharray="5 4"
              class="stroke-violet-400 dark:stroke-violet-400/70" marker-end="url(#mcp-arr-violet)" />

            <!-- ── PHASE 2 · GENERATE (indigo) ── -->
            <!-- 5: AI Agent → MCP -->
            <text x="200" y="257" text-anchor="middle" font-size="11" class="font-mono fill-indigo-600 dark:fill-indigo-300">generate_form(prompt, token)</text>
            <line x1="100" y1="267" x2="294" y2="267" stroke-linecap="round" stroke-width="1.5"
              class="stroke-indigo-500 dark:stroke-indigo-400" marker-end="url(#mcp-arr-indigo)" />

            <!-- 6: MCP → AI Provider -->
            <text x="500" y="295" text-anchor="middle" font-size="11" class="font-mono fill-indigo-600 dark:fill-indigo-300">Gemini completion</text>
            <line x1="300" y1="305" x2="694" y2="305" stroke-linecap="round" stroke-width="1.5"
              class="stroke-indigo-500 dark:stroke-indigo-400" marker-end="url(#mcp-arr-indigo)" />

            <!-- 7: AI Provider → MCP (response, dashed) -->
            <text x="500" y="333" text-anchor="middle" font-size="11" class="font-mono fill-indigo-500 dark:fill-indigo-400">typed elements[]</text>
            <line x1="700" y1="343" x2="306" y2="343" stroke-linecap="round" stroke-width="1.5" stroke-dasharray="5 4"
              class="stroke-indigo-400 dark:stroke-indigo-400/70" marker-end="url(#mcp-arr-indigo)" />

            <!-- 8: MCP → AI Agent (response, dashed) -->
            <text x="200" y="371" text-anchor="middle" font-size="11" class="font-mono fill-indigo-500 dark:fill-indigo-400">form schema</text>
            <line x1="300" y1="381" x2="106" y2="381" stroke-linecap="round" stroke-width="1.5" stroke-dasharray="5 4"
              class="stroke-indigo-400 dark:stroke-indigo-400/70" marker-end="url(#mcp-arr-indigo)" />

            <!-- ── PHASE 3 · CODE (sky) ── -->
            <!-- 9: AI Agent → MCP -->
            <text x="200" y="409" text-anchor="middle" font-size="11" class="font-mono fill-sky-600 dark:fill-sky-300">generate_code(elements, "vue")</text>
            <line x1="100" y1="419" x2="294" y2="419" stroke-linecap="round" stroke-width="1.5"
              class="stroke-sky-500 dark:stroke-sky-400" marker-end="url(#mcp-arr-sky)" />

            <!-- 10: MCP → AI Agent (response, dashed) -->
            <text x="200" y="447" text-anchor="middle" font-size="11" class="font-mono fill-sky-500 dark:fill-sky-400">&lt;Vue 3 SFC&gt;</text>
            <line x1="300" y1="457" x2="106" y2="457" stroke-linecap="round" stroke-width="1.5" stroke-dasharray="5 4"
              class="stroke-sky-400 dark:stroke-sky-400/70" marker-end="url(#mcp-arr-sky)" />

            <!-- ── LEGEND ── -->
            <g transform="translate(280, 525)">
              <line x1="0" y1="0" x2="40" y2="0" stroke-linecap="round" stroke-width="1.5"
                class="stroke-slate-500 dark:stroke-slate-400" marker-end="url(#mcp-arr-slate)" />
              <text x="50" y="4" font-size="11" class="fill-slate-600 dark:fill-slate-400">{{ t('mcp.flow.diagram.legend.request') }}</text>
              <line x1="130" y1="0" x2="170" y2="0" stroke-linecap="round" stroke-width="1.5" stroke-dasharray="5 4"
                class="stroke-slate-400 dark:stroke-slate-500" marker-end="url(#mcp-arr-slate)" />
              <text x="180" y="4" font-size="11" class="fill-slate-600 dark:fill-slate-400">{{ t('mcp.flow.diagram.legend.response') }}</text>
            </g>
          </svg>
        </div>
      </div>
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
