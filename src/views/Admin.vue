<template>
  <div class="admin-container">
    <iframe
      :src="n8nUrl"
      title="n8n Workflow Editor"
      class="n8n-iframe"
      allow="fullscreen"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const n8nUrl = computed(() => {
  // 현재 호스트를 기준으로 n8n URL 동적 생성
  const currentHost = window.location.hostname
  const protocol = window.location.protocol
  
  // 로컬 개발 환경
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    return 'http://localhost:5678'
  }
  
  // 배포 환경 - 같은 도메인의 5678 포트 사용
  return `${protocol}//${currentHost}:5678`
})
</script>

<style scoped>
.admin-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.n8n-iframe {
  width: 100%;
  height: 100%;
  border: none;
  margin: 0;
  padding: 0;
}
</style>