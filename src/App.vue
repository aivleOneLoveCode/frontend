<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()

onMounted(() => {
  // 앱 시작 시 인증 상태 확인
  authStore.checkAuthStatus()
})
</script>

<style>
@import './assets/styles/main.css';
</style>