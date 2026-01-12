<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  description?: string
}>(), {
  title: 'pangrum',
  description: 'Daily word puzzle game',
})
</script>

<template>
  <div class="h-full w-full flex flex-col items-center justify-center bg-[#0f0f0f]">
    <div
      class="flex flex-row items-center justify-center mb-12"
      style="gap: 12px;"
    >
      <div
        class="flex items-center justify-center bg-[#1a1a1a] text-white font-medium"
        style="width: 64px; height: 64px; border-radius: 12px; font-size: 28px;"
      >
        P
      </div>
      <div
        class="flex items-center justify-center bg-[#1a1a1a] text-white font-medium"
        style="width: 64px; height: 64px; border-radius: 12px; font-size: 28px;"
      >
        A
      </div>
      <div
        class="flex items-center justify-center bg-[#1a1a1a] text-white font-medium"
        style="width: 64px; height: 64px; border-radius: 12px; font-size: 28px;"
      >
        N
      </div>
      <div
        class="flex items-center justify-center bg-[#14b8a6] text-[#0f0f0f] font-semibold"
        style="width: 80px; height: 80px; border-radius: 12px; font-size: 36px;"
      >
        G
      </div>
      <div
        class="flex items-center justify-center bg-[#1a1a1a] text-white font-medium"
        style="width: 64px; height: 64px; border-radius: 12px; font-size: 28px;"
      >
        R
      </div>
      <div
        class="flex items-center justify-center bg-[#1a1a1a] text-white font-medium"
        style="width: 64px; height: 64px; border-radius: 12px; font-size: 28px;"
      >
        U
      </div>
      <div
        class="flex items-center justify-center bg-[#1a1a1a] text-white font-medium"
        style="width: 64px; height: 64px; border-radius: 12px; font-size: 28px;"
      >
        M
      </div>
    </div>

    <div
      class="text-white font-semibold mb-4"
      style="font-size: 64px; letter-spacing: 0.1em;"
    >
      {{ title }}
    </div>

    <div style="font-size: 28px; color: rgba(250, 250, 250, 0.6);">
      {{ description }}
    </div>
  </div>
</template>
