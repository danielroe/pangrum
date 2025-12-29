<script setup lang="ts">
const toasts = useToasts()
</script>

<template>
  <div class="fixed inset-0 pointer-events-none flex items-center justify-center z-10">
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="scale-50 opacity-0"
      enter-to-class="scale-100 opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="scale-100 opacity-100"
      leave-to-class="scale-110 opacity-0"
    >
      <div
        v-if="toasts[0]"
        class="text-2xl text-white px-6 py-3 rounded-full shadow-lg border-2 border-solid transition-all"
        :class="{
          'bg-celebration-bg border-celebration text-3xl px-8 py-4 animate-bounce': toasts[0].type === 'celebration',
          'bg-error-bg border-error': toasts[0].type === 'error',
          'bg-success-bg border-success': toasts[0].type === 'success',
          'bg-surface border-white': !toasts[0].type || toasts[0].type === 'info',
        }"
      >
        {{ toasts[0].message }}
      </div>
    </Transition>
  </div>
</template>
