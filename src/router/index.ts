import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Welcome',
    component: () => import('@/views/Welcome.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/chat',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Chat',
        component: () => import('@/views/Chat.vue'),
        meta: { requiresAuth: true }
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('@/views/ForgotPassword.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/board',
    name: 'Board',
    component: () => import('@/views/Board.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 네비게이션 가드
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()
  
  // 첫 방문 시 localStorage에서 인증 상태 복구
  if (!authStore.isAuthenticated) {
    await authStore.checkAuthStatus()
  }
  
  // 인증이 필요한 페이지인지 확인
  if (to.meta.requiresAuth) {
    // 인증 상태 확인
    if (!authStore.isAuthenticated) {
      // 로그인 페이지로 리다이렉트
      next({ name: 'Login', query: { redirect: to.fullPath } })
      return
    }
  }
  
  // 이미 로그인된 상태에서 인증 페이지 접근 시
  if (['Login', 'Register', 'ForgotPassword'].includes(to.name as string) && authStore.isAuthenticated) {
    next({ path: '/chat' })
    return
  }
  
  next()
})

export default router