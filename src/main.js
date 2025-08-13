import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

const app = createApp(App)

// Pinia 상태 관리 설정
app.use(createPinia())

// Vue Router 설정
app.use(router)

// 전역 속성 설정
app.config.globalProperties.$appName = import.meta.env.VITE_APP_TITLE

// 앱 마운트
app.mount('#app')