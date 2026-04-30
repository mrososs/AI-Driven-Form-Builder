<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useFormStore } from '../stores/form'
import { useMultiStepFormStore } from '../stores/multistepForm'
import BuilderNavbar from '../features/builder/BuilderNavbar.vue'
import AppDialog from '../components/shared/AppDialog.vue'
import { Layers, FileText, Calendar, Edit, Trash2, Plus, GitBranch, LayoutList } from 'lucide-vue-next'

const { t } = useI18n()
const router = useRouter()
const formStore = useFormStore()
const multiStore = useMultiStepFormStore()

type Tab = 'single' | 'multi'
const activeTab = ref<Tab>('single')

onMounted(async () => {
  await Promise.all([formStore.fetchUserForms(), multiStore.fetchSavedForms()])
})

const formatDate = (timestamp: any) => {
  if (!timestamp) return ''
  const date = typeof timestamp.toDate === 'function' ? timestamp.toDate() : new Date(timestamp)
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}

// ── Single-step delete ──────────────────────────────────────────────
const deleteTarget = ref<{ id: string; title?: string } | null>(null)
const isDeleting = ref(false)
const deleteError = ref('')
const isDeleteDialogOpen = computed({
  get: () => deleteTarget.value !== null,
  set: (value: boolean) => {
    if (!value) { deleteTarget.value = null; deleteError.value = '' }
  },
})

const handleDelete = (form: { id: string; title?: string }) => {
  deleteError.value = ''
  deleteTarget.value = form
}

const confirmDelete = async () => {
  if (!deleteTarget.value) return
  isDeleting.value = true
  deleteError.value = ''
  try {
    await formStore.deleteForm(deleteTarget.value.id)
    deleteTarget.value = null
  } catch {
    deleteError.value = 'Failed to delete form. Please try again.'
  } finally {
    isDeleting.value = false
  }
}

// ── Multi-step delete ───────────────────────────────────────────────
const msDeleteTarget = ref<{ id: string; name?: string } | null>(null)
const isMsDeleting = ref(false)
const msDeleteError = ref('')
const isMsDeleteDialogOpen = computed({
  get: () => msDeleteTarget.value !== null,
  set: (value: boolean) => {
    if (!value) { msDeleteTarget.value = null; msDeleteError.value = '' }
  },
})

const handleMsDelete = (form: { id: string; name?: string }) => {
  msDeleteError.value = ''
  msDeleteTarget.value = form
}

const confirmMsDelete = async () => {
  if (!msDeleteTarget.value) return
  isMsDeleting.value = true
  msDeleteError.value = ''
  try {
    await multiStore.deleteSavedForm(msDeleteTarget.value.id)
    msDeleteTarget.value = null
  } catch {
    msDeleteError.value = 'Failed to delete form. Please try again.'
  } finally {
    isMsDeleting.value = false
  }
}

const totalFields = (form: { steps: { elements: unknown[] }[] }) =>
  form.steps.reduce((sum, s) => sum + s.elements.length, 0)
</script>

<template>
  <div class="flex flex-col min-h-screen bg-slate-50 dark:bg-[#0d0d14]">
    <BuilderNavbar />

    <main class="flex-1 p-6 lg:p-10">
      <div class="max-w-7xl mx-auto">

        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 class="text-3xl font-bold text-slate-900 dark:text-white font-heading tracking-tight">
              {{ t('builder.nav.forms') }}
            </h1>
            <p class="text-slate-500 dark:text-white/40 mt-1">
              Manage and view your response collections.
            </p>
          </div>

          <div class="flex items-center gap-2">
            <RouterLink
              to="/builder"
              class="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-white/[0.04] hover:bg-slate-50 dark:hover:bg-white/[0.07] text-slate-700 dark:text-white/70 text-sm font-semibold rounded-xl border border-slate-200 dark:border-white/[0.1] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus class="h-4 w-4" />
              Single-Step
            </RouterLink>
            <RouterLink
              to="/builder/multi-step"
              class="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus class="h-4 w-4" />
              Multi-Step
            </RouterLink>
          </div>
        </div>

        <!-- Tabs -->
        <div class="flex items-center gap-1 p-1 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-xl w-fit mb-8">
          <button
            type="button"
            :class="[
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150',
              activeTab === 'single'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                : 'text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.07]'
            ]"
            @click="activeTab = 'single'"
          >
            <LayoutList class="h-4 w-4" />
            Single-Step Forms
            <span
              :class="[
                'text-xs px-1.5 py-0.5 rounded-full font-semibold',
                activeTab === 'single' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-white/[0.08] text-slate-500 dark:text-white/40'
              ]"
            >
              {{ formStore.userForms.length }}
            </span>
          </button>
          <button
            type="button"
            :class="[
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150',
              activeTab === 'multi'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                : 'text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.07]'
            ]"
            @click="activeTab = 'multi'"
          >
            <GitBranch class="h-4 w-4" />
            Multi-Step Forms
            <span
              :class="[
                'text-xs px-1.5 py-0.5 rounded-full font-semibold',
                activeTab === 'multi' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-white/[0.08] text-slate-500 dark:text-white/40'
              ]"
            >
              {{ multiStore.savedForms.length }}
            </span>
          </button>
        </div>

        <!-- ── SINGLE-STEP FORMS ── -->
        <template v-if="activeTab === 'single'">
          <!-- Loading -->
          <div v-if="formStore.isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="i in 3" :key="i" class="h-56 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] animate-pulse" />
          </div>

          <!-- Empty -->
          <div
            v-else-if="formStore.userForms.length === 0"
            class="flex flex-col items-center justify-center py-24 px-4 bg-white dark:bg-white/[0.02] rounded-3xl border border-dashed border-slate-200 dark:border-white/[0.1]"
          >
            <div class="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-white/[0.05] flex items-center justify-center mb-6 ring-1 ring-slate-200 dark:ring-white/[0.05]">
              <Layers class="h-10 w-10 text-slate-400 dark:text-white/20" />
            </div>
            <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-2">No forms found</h2>
            <p class="text-sm text-slate-500 dark:text-white/40 text-center max-w-xs mb-8">
              You haven't created any forms yet. Start building your first one now.
            </p>
            <RouterLink to="/builder" class="btn-primary px-8 py-3 rounded-xl">
              Start Building
            </RouterLink>
          </div>

          <!-- Grid -->
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="form in formStore.userForms"
              :key="form.id"
              class="group relative bg-white dark:bg-[#111118] rounded-2xl border border-slate-200 dark:border-white/[0.08] p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-500/30 dark:hover:border-indigo-400/20"
            >
              <div class="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                <button
                  @click="router.push({ name: 'builder', query: { id: form.id } })"
                  class="p-2 rounded-lg bg-white dark:bg-[#1a1a24] shadow-sm border border-slate-200 dark:border-white/[0.1] text-slate-600 dark:text-white/60 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  title="Edit form"
                >
                  <Edit class="h-4 w-4" />
                </button>
                <button
                  @click="handleDelete(form)"
                  class="p-2 rounded-lg bg-white dark:bg-[#1a1a24] shadow-sm border border-slate-200 dark:border-white/[0.1] text-slate-600 dark:text-white/60 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                  title="Delete form"
                >
                  <Trash2 class="h-4 w-4" />
                </button>
              </div>

              <div class="flex items-center gap-4 mb-6">
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 dark:from-indigo-500/20 dark:to-violet-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-500">
                  <FileText class="h-6 w-6" />
                </div>
                <div class="min-w-0">
                  <div class="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/20 mb-1">
                    <Calendar class="h-3 w-3" />
                    {{ formatDate(form.updatedAt) }}
                  </div>
                  <h3 class="text-lg font-bold text-slate-900 dark:text-white truncate pr-12 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
                    {{ form.title || 'Untitled Form' }}
                  </h3>
                </div>
              </div>

              <p class="text-sm text-slate-500 dark:text-white/40 line-clamp-2 mb-6 min-h-[40px] leading-relaxed">
                {{ form.description || 'No description provided.' }}
              </p>

              <div class="flex items-center justify-between pt-5 border-t border-slate-100 dark:border-white/[0.05]">
                <div class="flex items-center gap-4 text-xs font-medium text-slate-400 dark:text-white/30">
                  <div class="flex items-center gap-1.5">
                    <div class="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {{ form.elements?.length || 0 }} Elements
                  </div>
                  <div class="flex items-center gap-1.5">
                    <div class="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-white/10" />
                    0 Responses
                  </div>
                </div>
              </div>

              <div class="absolute -inset-px rounded-2xl bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </div>
          </div>
        </template>

        <!-- ── MULTI-STEP FORMS ── -->
        <template v-else>
          <!-- Loading -->
          <div v-if="multiStore.isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="i in 3" :key="i" class="h-56 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] animate-pulse" />
          </div>

          <!-- Empty -->
          <div
            v-else-if="multiStore.savedForms.length === 0"
            class="flex flex-col items-center justify-center py-24 px-4 bg-white dark:bg-white/[0.02] rounded-3xl border border-dashed border-slate-200 dark:border-white/[0.1]"
          >
            <div class="w-20 h-20 rounded-3xl bg-indigo-500/10 flex items-center justify-center mb-6 ring-1 ring-indigo-500/20">
              <GitBranch class="h-10 w-10 text-indigo-400 dark:text-indigo-500" />
            </div>
            <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-2">No multi-step forms yet</h2>
            <p class="text-sm text-slate-500 dark:text-white/40 text-center max-w-xs mb-8">
              Build a multi-step form and press Save to store it here.
            </p>
            <RouterLink
              to="/builder/multi-step"
              class="inline-flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus class="h-4 w-4" />
              Start Building
            </RouterLink>
          </div>

          <!-- Grid -->
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="form in multiStore.savedForms"
              :key="form.id"
              class="group relative bg-white dark:bg-[#111118] rounded-2xl border border-slate-200 dark:border-white/[0.08] p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-500/30 dark:hover:border-indigo-400/20"
            >
              <!-- Action buttons -->
              <div class="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                <button
                  @click="router.push({ name: 'builder-multi-step', query: { id: form.id } })"
                  class="p-2 rounded-lg bg-white dark:bg-[#1a1a24] shadow-sm border border-slate-200 dark:border-white/[0.1] text-slate-600 dark:text-white/60 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  title="Edit form"
                >
                  <Edit class="h-4 w-4" />
                </button>
                <button
                  @click="handleMsDelete(form)"
                  class="p-2 rounded-lg bg-white dark:bg-[#1a1a24] shadow-sm border border-slate-200 dark:border-white/[0.1] text-slate-600 dark:text-white/60 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                  title="Delete form"
                >
                  <Trash2 class="h-4 w-4" />
                </button>
              </div>

              <!-- Icon & Meta -->
              <div class="flex items-center gap-4 mb-6">
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 dark:from-indigo-500/20 dark:to-violet-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-500">
                  <GitBranch class="h-6 w-6" />
                </div>
                <div class="min-w-0">
                  <div class="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/20 mb-1">
                    <Calendar class="h-3 w-3" />
                    {{ formatDate(form.updatedAt) }}
                  </div>
                  <h3 class="text-lg font-bold text-slate-900 dark:text-white truncate pr-12 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
                    {{ form.name || 'Untitled Multi-Step Form' }}
                  </h3>
                </div>
              </div>

              <!-- Stats chips -->
              <div class="flex items-center gap-2 mb-6">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-100 dark:border-indigo-500/20">
                  <LayoutList class="h-3 w-3" />
                  {{ form.steps.length }} steps
                </span>
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 text-xs font-semibold border border-violet-100 dark:border-violet-500/20">
                  {{ totalFields(form) }} fields
                </span>
              </div>

              <!-- Footer -->
              <div class="flex items-center justify-between pt-5 border-t border-slate-100 dark:border-white/[0.05]">
                <div class="flex items-center gap-2 text-xs font-medium text-slate-400 dark:text-white/30">
                  <div class="flex items-center gap-1.5">
                    <div class="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {{ form.rules?.length || 0 }} rules
                  </div>
                  <div class="flex items-center gap-1.5">
                    <div class="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    {{ form.progressStyle }}
                  </div>
                </div>
                <button
                  @click="router.push({ name: 'builder-multi-step', query: { id: form.id } })"
                  class="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                >
                  Open →
                </button>
              </div>

              <div class="absolute -inset-px rounded-2xl bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </div>
          </div>
        </template>

      </div>
    </main>

    <!-- Single-step delete dialog -->
    <AppDialog
      v-model:open="isDeleteDialogOpen"
      variant="danger"
      title="Delete form?"
      :description="`Are you sure you want to delete &quot;${deleteTarget?.title || 'Untitled Form'}&quot;? This action cannot be undone.`"
      confirm-text="Delete"
      cancel-text="Cancel"
      :loading="isDeleting"
      :close-on-backdrop="!isDeleting"
      @confirm="confirmDelete"
    >
      <p v-if="deleteError" class="text-sm text-rose-600 dark:text-rose-400">{{ deleteError }}</p>
    </AppDialog>

    <!-- Multi-step delete dialog -->
    <AppDialog
      v-model:open="isMsDeleteDialogOpen"
      variant="danger"
      title="Delete multi-step form?"
      :description="`Are you sure you want to delete &quot;${msDeleteTarget?.name || 'Untitled Multi-Step Form'}&quot;? This action cannot be undone.`"
      confirm-text="Delete"
      cancel-text="Cancel"
      :loading="isMsDeleting"
      :close-on-backdrop="!isMsDeleting"
      @confirm="confirmMsDelete"
    >
      <p v-if="msDeleteError" class="text-sm text-rose-600 dark:text-rose-400">{{ msDeleteError }}</p>
    </AppDialog>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
