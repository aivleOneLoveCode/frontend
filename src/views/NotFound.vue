<template>
  <div class="not-found">
    <h1>404</h1>
    <p>페이지를 찾을 수 없습니다</p>
    <router-link to="/">홈으로 돌아가기</router-link>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
}

.not-found h1 {
  font-size: 6rem;
  margin-bottom: 1rem;
  color: var(--text-secondary);
}

.not-found p {
  font-size: 1.5rem;
  margin-bottom: 2rem;
  color: var(--text-secondary);
}

.not-found a {
  padding: 0.75rem 1.5rem;
  background-color: var(--btn-primary);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.not-found a:hover {
  background-color: var(--btn-primary-hover);
}
</style>