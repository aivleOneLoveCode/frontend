<template>
  <div 
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center"
    @click="handleBackdropClick"
  >
    <div class="fixed inset-0 bg-black/50" />
    <div class="relative bg-white border border-gray-200 shadow-2xl rounded-lg w-full max-w-4xl max-h-[90vh] mx-4">
      <div class="p-6">
        <div class="mb-4">
          <h2 class="text-xl font-semibold">워크플로우 상세보기</h2>
        </div>
        
        <div v-if="workflowImage" class="flex justify-center items-center">
          <ImageWithFallback
            :src="workflowImage"
            alt="워크플로우 상세"
            class="max-w-full max-h-[70vh] object-contain rounded-lg"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface WorkflowViewerProps {
  isOpen: boolean
  onClose: () => void
  workflowImage: string | null
}

const props = defineProps<WorkflowViewerProps>()

const handleBackdropClick = (e: Event) => {
  if (e.target === e.currentTarget) {
    props.onClose()
  }
}
</script>

<!-- ImageWithFallback Component -->
<script lang="ts">
import { defineComponent, ref } from 'vue'

const ERROR_IMG_SRC = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=='

const ImageWithFallback = defineComponent({
  name: 'ImageWithFallback',
  props: {
    src: String,
    alt: String,
    className: String,
    class: String
  },
  setup(props) {
    const didError = ref(false)
    
    const handleError = () => {
      didError.value = true
    }
    
    return {
      didError,
      handleError,
      ERROR_IMG_SRC
    }
  },
  template: `
    <div 
      v-if="didError"
      :class="['inline-block bg-gray-100 text-center align-middle', className || class]"
    >
      <div class="flex items-center justify-center w-full h-full">
        <img 
          :src="ERROR_IMG_SRC" 
          alt="Error loading image"
          :data-original-url="src"
        />
      </div>
    </div>
    <img 
      v-else
      :src="src" 
      :alt="alt" 
      :class="className || class"
      @error="handleError"
    />
  `
})

export { ImageWithFallback }
</script>