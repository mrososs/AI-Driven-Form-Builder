<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useFormStore } from '../stores/form'
import BuilderNavbar from '../features/builder/BuilderNavbar.vue'
import { Layers, FileText, Calendar, Edit, Trash2, Plus } from 'lucide-vue-next'

const { t } = useI18n()
const router = useRouter()
const formStore = useFormStore()

onMounted(async () => {
  await formStore.fetchUserForms()
})

const formatDate = (timestamp: any) => {
  if (!timestamp) return ''
  // Firestore timestamps have atDate() method
  const date = typeof timestamp.toDate === 'function' ? timestamp.toDate() : new Date(timestamp)
  return new Intl.DateTimeFormat('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  }).format(date)
}

const handleEdit = (formId: string) => {
  router.push({ name: 'builder', query: { id: formId } })
}

const handleDelete = async (form: { id: string; title?: string }) => {
  const ok = window.confirm(`Delete "${form.title || 'Untitled Form'}"? This cannot be undone.`)
  if (!ok) return
  try {
    await formStore.deleteForm(form.id)
  } catch {
    alert('Failed to delete form. Please try again.')
  }
}
</script>

<template>
  <div class="flex flex-col min-h-screen bg-slate-50 dark:bg-[#0d0d14]">
    <BuilderNavbar />
    
    <main class="flex-1 p-6 lg:p-10">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 class="text-3xl font-bold text-slate-900 dark:text-white font-heading tracking-tight">
              {{ t('builder.nav.forms') }}
            </h1>
            <p class="text-slate-500 dark:text-white/40 mt-1">
              Manage and view your response collections.
            </p>
          </div>
          
          <RouterLink 
            to="/builder" 
            class="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus class="h-4 w-4" />
            Create New Form
          </RouterLink>
        </div>

        <!-- Loading State -->
        <div v-if="formStore.isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="i in 3" :key="i" class="h-56 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] animate-pulse"></div>
        </div>

        <!-- Empty State -->
        <div v-else-if="formStore.userForms.length === 0" class="flex flex-col items-center justify-center py-24 px-4 bg-white dark:bg-white/[0.02] rounded-3xl border border-dashed border-slate-200 dark:border-white/[0.1]">
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

        <!-- Forms Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="form in formStore.userForms" 
            :key="form.id"
            class="group relative bg-white dark:bg-[#111118] rounded-2xl border border-slate-200 dark:border-white/[0.08] p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-500/30 dark:hover:border-indigo-400/20"
          >
            <!-- Card Action Overlay (hidden by default) -->
            <div class="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
              <button 
                @click="handleEdit(form.id)"
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

            <!-- Icon & Metadata -->
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

            <!-- Description -->
            <p class="text-sm text-slate-500 dark:text-white/40 line-clamp-2 mb-6 min-h-[40px] leading-relaxed">
              {{ form.description || 'No description provided.' }}
            </p>

            <!-- Card Footer -->
            <div class="flex items-center justify-between pt-5 border-t border-slate-100 dark:border-white/[0.05]">
              <div class="flex items-center gap-4 text-xs font-medium text-slate-400 dark:text-white/30">
                <div class="flex items-center gap-1.5">
                  <div class="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  {{ form.elements?.length || 0 }} Elements
                </div>
                <!-- Future: Submissions count -->
                <div class="flex items-center gap-1.5">
                  <div class="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-white/10"></div>
                  0 Responses
                </div>
              </div>
            </div>

            <!-- Subtle background glow -->
            <div class="absolute -inset-px rounded-2xl bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          </div>
        </div>
      </div>
    </main>
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
