import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './assets/styles/main.css'
import { useAuthStore } from '@/stores/auth'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)

// 토큰 제공자 초기화
const authStore = useAuthStore()
authStore.initTokenProvider()

app.mount('#app')