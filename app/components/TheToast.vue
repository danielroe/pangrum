<script setup lang="ts">
const toasts = useToasts()
</script>

<template>
  <div class="fixed inset-0 pointer-events-none flex items-center justify-center z-10">
    <div
      v-if="toasts[0]"
      class="text-2xl text-white px-6 py-2  rounded-full bg-[#333] shadow border-white border-solid border-2"
    >
      {{ toasts[0].message }}
    </div>
  </div>
</template>
