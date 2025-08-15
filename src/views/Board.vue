<template>
  <div class="board-view">
    <BoardPanel :isOpen="true" @close="goBack" />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import BoardPanel from '@/components/BoardPanel.vue'

const router = useRouter()

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.board-view {
  width: 100%;
  height: 100vh;
  position: relative;
}
</style>