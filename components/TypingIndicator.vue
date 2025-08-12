<template>
  <div class="flex items-center gap-2 text-muted-foreground">
    <span class="text-sm">AI가 입력 중</span>
    <div class="flex gap-1">
      <div 
        v-for="i in 3" 
        :key="i"
        class="w-2 h-2 bg-current rounded-full animate-typing-dot"
        :style="{ animationDelay: `${(i - 1) * 0.2}s` }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
// No script needed for this simple component
</script>

<style scoped>
@keyframes typing-dot {
  0%, 20%, 100% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
}

.animate-typing-dot {
  animation: typing-dot 1.5s infinite;
}
</style>