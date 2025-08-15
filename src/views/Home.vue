<template>
  <div class="home-container">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  // 홈 페이지 접근 시 자동으로 채팅 페이지로 리다이렉트
  router.push('/chat')
})
</script>

<style scoped>
.home-container {
  width: 100%;
  height: 100vh;
}
</style>