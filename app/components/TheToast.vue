<script setup lang="ts">
const toasts = useToasts()
</script>

<template>
  <div
    role="status"
    aria-live="polite"
    aria-atomic="true"
    class="fixed inset-0 pointer-events-none flex items-center justify-center z-50"
  >
    <Transition
      enter-active-class="transition-all duration-300 ease-out-back"
      enter-from-class="opacity-0 scale-50 blur-sm"
      enter-to-class="opacity-100 scale-100 blur-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-110 blur-sm"
    >
      <div
        v-if="toasts[0]"
        class="toast px-6 py-4 rounded-full text-xl font-medium border-1.5 border-solid backdrop-blur-lg transition-all duration-200"
        :class="{
          'toast-celebration': toasts[0].type === 'celebration',
          'toast-error border-error text-error': toasts[0].type === 'error',
          'toast-success border-success text-success': toasts[0].type === 'success',
          'toast-info border-muted-foreground text-on-surface': !toasts[0].type || toasts[0].type === 'info',
        }"
      >
        {{ toasts[0].message }}
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.toast-info {
  background: rgba(26, 26, 26, 0.8);
}

.toast-success {
  background: rgba(34, 197, 94, 0.15);
  box-shadow: 0 0 20px rgba(34, 197, 94, 0.2);
}

.toast-error {
  background: rgba(244, 63, 94, 0.15);
  box-shadow: 0 0 20px rgba(244, 63, 94, 0.2);
}

.toast-celebration {
  padding: 1.25rem 2rem;
  font-size: 1.5rem;
  background: rgba(245, 158, 11, 0.2);
  border-color: var(--color-celebration);
  color: var(--color-celebration);
  box-shadow:
    0 0 30px rgba(245, 158, 11, 0.3),
    0 0 60px rgba(245, 158, 11, 0.1);
  animation: celebration-pulse 0.6s ease-out;
}

html[data-theme='light'] .toast-info {
  background: rgba(255, 255, 255, 0.85);
}

html[data-theme='light'] .toast-success {
  background: rgba(34, 197, 94, 0.1);
}

html[data-theme='light'] .toast-error {
  background: rgba(244, 63, 94, 0.1);
}

html[data-theme='light'] .toast-celebration {
  background: rgba(245, 158, 11, 0.15);
}

@keyframes celebration-pulse {
  0% {
    transform: scale(0.8);
    box-shadow:
      0 0 30px rgba(245, 158, 11, 0.3),
      0 0 60px rgba(245, 158, 11, 0.1);
  }
  50% {
    transform: scale(1.05);
    box-shadow:
      0 0 50px rgba(245, 158, 11, 0.5),
      0 0 100px rgba(245, 158, 11, 0.2);
  }
  100% {
    transform: scale(1);
    box-shadow:
      0 0 30px rgba(245, 158, 11, 0.3),
      0 0 60px rgba(245, 158, 11, 0.1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .toast-celebration {
    animation: none;
  }
}
</style>
