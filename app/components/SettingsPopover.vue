<script setup lang="ts">
defineProps<{
  label: string
}>()

const isOpen = ref(false)
const triggerRef = useTemplateRef<HTMLButtonElement>('trigger')
const popoverRef = useTemplateRef<HTMLDivElement>('popover')

function toggle() {
  isOpen.value = !isOpen.value
}

function close() {
  isOpen.value = false
}

onClickOutside(popoverRef, close, { ignore: [triggerRef] })
onKeyStroke('Escape', close)
</script>

<template>
  <div class="relative">
    <button
      ref="trigger"
      type="button"
      class="w-9 h-9 flex items-center justify-center text-lg rounded-lg border-1 border-solid border-muted bg-surface hover:bg-surface-hover transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
      :aria-label="label"
      :aria-expanded="isOpen"
      @click="toggle"
    >
      <slot name="icon" />
    </button>
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        ref="popover"
        class="absolute right-0 top-full mt-2 z-50 min-w-48 bg-surface rounded-lg border-1 border-solid border-muted shadow-lg p-3"
      >
        <slot :close="close" />
      </div>
    </Transition>
  </div>
</template>
