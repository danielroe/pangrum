interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  color: string
  alpha: number
  decay: number
}

const particles = ref<Particle[]>([])
const isAnimating = ref(false)
let animationFrame: number | null = null

const COLORS = [
  '#14b8a6', // teal
  '#2dd4bf', // lighter teal
  '#f59e0b', // amber
  '#fbbf24', // lighter amber
  '#ffffff', // white
]

function createParticle(centerX: number, centerY: number): Particle {
  const angle = Math.random() * Math.PI * 2
  const speed = 2 + Math.random() * 6
  return {
    x: centerX,
    y: centerY,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - 2, // slight upward bias
    radius: 2 + Math.random() * 4,
    color: COLORS[Math.floor(Math.random() * COLORS.length)] as string,
    alpha: 1,
    decay: 0.015 + Math.random() * 0.01,
  }
}

function updateParticles() {
  particles.value = particles.value
    .map((p) => {
      return {
        ...p,
        x: p.x + p.vx,
        y: p.y + p.vy,
        vy: p.vy + 0.15, // gravity
        alpha: p.alpha - p.decay,
      }
    })
    .filter(p => p.alpha > 0)

  if (particles.value.length > 0) {
    animationFrame = requestAnimationFrame(updateParticles)
  }
  else {
    isAnimating.value = false
    animationFrame = null
  }
}

export function useParticles() {
  const prefersReducedMotion = ref(false)

  onMounted(() => {
    prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  function triggerCelebration(centerX?: number, centerY?: number) {
    if (prefersReducedMotion.value) return

    const x = centerX ?? window.innerWidth / 2
    const y = centerY ?? window.innerHeight / 2

    const particleCount = 40
    for (let i = 0; i < particleCount; i++) {
      particles.value.push(createParticle(x, y))
    }

    if (!isAnimating.value) {
      isAnimating.value = true
      animationFrame = requestAnimationFrame(updateParticles)
    }
  }

  onUnmounted(() => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame)
      animationFrame = null
    }
    particles.value = []
    isAnimating.value = false
  })

  return {
    particles: readonly(particles),
    isAnimating: readonly(isAnimating),
    triggerCelebration,
  }
}
