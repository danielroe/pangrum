<script setup lang="ts">
const { particles, isAnimating } = useParticles()
const canvas = useTemplateRef('canvas')

watch([particles, isAnimating], () => {
  if (!canvas.value) return

  const ctx = canvas.value.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)

  for (const p of particles.value) {
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
    ctx.fillStyle = p.color
    ctx.globalAlpha = p.alpha
    ctx.fill()
  }

  ctx.globalAlpha = 1
}, { deep: true })

function updateCanvasSize() {
  if (canvas.value) {
    canvas.value.width = window.innerWidth
    canvas.value.height = window.innerHeight
  }
}

onMounted(() => {
  updateCanvasSize()
  window.addEventListener('resize', updateCanvasSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateCanvasSize)
})
</script>

<template>
  <canvas
    ref="canvas"
    class="fixed inset-0 pointer-events-none z-100 transition-opacity duration-100"
    :class="isAnimating ? 'opacity-100' : 'opacity-0'"
  />
</template>
