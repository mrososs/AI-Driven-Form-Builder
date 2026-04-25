import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, _from, savedPosition) {
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0, left: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/builder',
      name: 'builder',
      component: () => import('../views/BuilderView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/docs',
      name: 'docs',
      component: () => import('../views/DocsView.vue'),
    },
    {
      path: '/examples',
      name: 'examples',
      component: () => import('../views/ExamplesView.vue'),
    },
    {
      path: '/forms',
      name: 'forms',
      component: () => import('../views/FormsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/auth/LoginView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/auth/RegisterView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/verify-email',
      name: 'verify-email',
      component: () => import('../views/auth/VerifyEmailView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('../views/auth/ForgotPasswordView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/preview',
      name: 'preview',
      component: () => import('../views/PreviewView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  await authStore.authReady

  const { isAuthenticated, isVerified } = authStore

  // 1. Unauthenticated users -> Login (if route requires auth)
  if (to.meta.requiresAuth && !isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  // 2. Authenticated but Unverified -> Verify Email
  // If user is authenticated, not verified, and trying to go anywhere BUT verify-email (that requires auth)
  if (isAuthenticated && !isVerified && to.name !== 'verify-email' && to.meta.requiresAuth) {
    return { name: 'verify-email' }
  }

  // 3. Verified users -> Away from Verify Email
  if (isAuthenticated && isVerified && to.name === 'verify-email') {
    return { name: 'builder' }
  }

  // 4. Authenticated users -> Away from Guest routes
  if (to.meta.guestOnly && isAuthenticated) {
    return { name: 'builder' }
  }
})

export default router
