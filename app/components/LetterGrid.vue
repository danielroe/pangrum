<script setup lang="ts">
const props = defineProps<{
  letters: string[]
  centreLetter: string
}>()

const word = useWord()
const pressedLetter = ref<string | null>(null)
const shuffleOrder = ref([0, 1, 2, 3, 4, 5])

function addLetter(letter: string) {
  word.value += letter
}

function deleteLetter() {
  word.value = word.value.slice(0, -1)
}

function submitWord() {
  word.value += '\n'
}

// Fisher-Yates shuffle
function shuffleLetters() {
  const newOrder = [...shuffleOrder.value]
  for (let i = newOrder.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newOrder[i], newOrder[j]] = [newOrder[j]!, newOrder[i]!]
  }
  shuffleOrder.value = newOrder
}

// Visual indication only
function handleKeyDown(event: KeyboardEvent) {
  const key = event.key.toUpperCase()
  if (props.letters.includes(key)) {
    pressedLetter.value = key
  }
}

function handleKeyUp(event: KeyboardEvent) {
  const key = event.key.toUpperCase()
  if (pressedLetter.value === key) {
    pressedLetter.value = null
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keyup', handleKeyUp)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('keyup', handleKeyUp)
})

const baseOuterLetters = computed(() => props.letters.filter(l => l !== props.centreLetter))
const outerLetters = computed(() => shuffleOrder.value.map(i => baseOuterLetters.value[i]!))

const letterPositions = [
  { x: -0.88, y: -0.84, z: 1, rotate: -3, delay: 0 }, // top-left
  { x: 0.92, y: -0.88, z: 1, rotate: 2.5, delay: 0.1 }, // top-right
  { x: -1.12, y: 0.06, z: 1, rotate: -2, delay: 0.15 }, // middle-left
  { x: 1.08, y: 0.02, z: 1, rotate: 2.5, delay: 0.05 }, // middle-right
  { x: -0.64, y: 0.92, z: 1, rotate: -2.5, delay: 0.2 }, // bottom-left
  { x: 0.72, y: 0.88, z: 1, rotate: 2, delay: 0.12 }, // bottom-right
]
</script>

<template>
  <div
    class="flex items-center justify-center sm:justify-start gap-4 select-none"
    style="perspective: 800px"
  >
    <div class="flex flex-col items-center flex-grow sm:flex-grow-0 gap-3">
      <div class="letter-cluster">
        <button
          class="letter-button centre-letter"
          :class="{ 'is-pressed': pressedLetter === centreLetter }"
          @click="() => addLetter(centreLetter)"
        >
          {{ centreLetter }}
        </button>

        <button
          v-for="(letter, index) in outerLetters"
          :key="letter"
          class="letter-button outer-letter"
          :class="{ 'is-pressed': pressedLetter === letter }"
          :style="{
            '--pos-x': letterPositions[index]?.x ?? 0,
            '--pos-y': letterPositions[index]?.y ?? 0,
            '--pos-z': letterPositions[index]?.z ?? 1,
            '--rotate': `${letterPositions[index]?.rotate ?? 0}deg`,
            '--delay': `${letterPositions[index]?.delay ?? 0}s`,
          }"
          @click="() => addLetter(letter)"
        >
          {{ letter }}
        </button>
      </div>
      <button
        class="hidden sm:flex items-center gap-2 px-4 py-2 bg-surface text-muted-foreground border-1 border-solid border-muted rounded-lg cursor-pointer transition-colors hover:bg-surface-hover hover:text-on-surface active:bg-surface-active focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        @click="shuffleLetters"
      >
        <span
          class="i-lucide-shuffle text-base"
          aria-hidden="true"
        />
        <span class="text-sm font-mono">Shuffle</span>
      </button>
    </div>

    <div class="flex flex-col gap-2 flex-grow items-center sm:hidden">
      <button
        class="w-11 h-11 flex items-center justify-center bg-surface text-muted-foreground border-1 border-solid border-muted rounded-lg cursor-pointer transition-colors hover:bg-surface-hover hover:text-on-surface active:bg-surface-active focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        style="-webkit-tap-highlight-color: transparent"
        @click="shuffleLetters"
      >
        <span
          class="i-lucide-shuffle text-xl"
          aria-hidden="true"
        />
        <span class="sr-only">Shuffle letters</span>
      </button>
      <button
        class="w-11 h-11 flex items-center justify-center bg-surface text-muted-foreground border-1 border-solid border-muted rounded-lg cursor-pointer transition-colors hover:bg-surface-hover hover:text-on-surface active:bg-surface-active focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        style="-webkit-tap-highlight-color: transparent"
        @click="deleteLetter"
      >
        <span
          class="i-lucide-delete text-xl"
          aria-hidden="true"
        />
        <span class="sr-only">Delete character</span>
      </button>
      <button
        class="w-11 h-11 flex items-center justify-center bg-surface text-muted-foreground border-1 border-solid border-muted rounded-lg cursor-pointer transition-colors hover:bg-surface-hover hover:text-on-surface active:bg-surface-active focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        style="-webkit-tap-highlight-color: transparent"
        @click="submitWord"
      >
        <span
          class="i-lucide-corner-down-left text-xl"
          aria-hidden="true"
        />
        <span class="sr-only">Submit word</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.letter-cluster {
  --letter-size: clamp(2.5rem, 12vw, 3.25rem);
  --centre-size: clamp(3rem, 14vw, 4rem);
  --spread: clamp(2.5rem, 12vw, 3.25rem);

  position: relative;
  width: calc(var(--centre-size) + var(--spread) * 2.5);
  height: calc(var(--centre-size) + var(--spread) * 2.3);
  transform-style: preserve-3d;
}

@media (min-width: 640px) {
  .letter-cluster {
    --letter-size: 3rem;
    --centre-size: 3.75rem;
    --spread: 3rem;
  }
}

.letter-button {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
  font-weight: 700;
  border: none;
  cursor: pointer;
  touch-action: manipulation;
  transform-style: preserve-3d;
  backface-visibility: hidden;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
}

.letter-button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 3px;
}

.centre-letter {
  width: var(--centre-size);
  height: var(--centre-size);
  font-size: calc(var(--centre-size) * 0.42);
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%) translateZ(20px);
  background: linear-gradient(
    145deg,
    var(--color-primary) 0%,
    color-mix(in oklch, var(--color-primary) 75%, black) 100%
  );
  color: #0f0f0f;
  border-radius: 1rem;
  z-index: 10;
  box-shadow:
    0 0 30px var(--color-primary-glow),
    0 0 50px var(--color-primary-glow),
    0 6px 20px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1);
  animation: centre-glow 4s ease-in-out infinite;
  transition: transform 0.1s ease-out, box-shadow 0.1s ease-out;
}

.centre-letter:active,
.centre-letter.is-pressed {
  transform: translate(-50%, -50%) translateZ(16px) scale(0.92);
  box-shadow:
    0 0 20px var(--color-primary-glow),
    0 0 35px var(--color-primary-glow),
    0 3px 10px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.outer-letter {
  width: var(--letter-size);
  height: var(--letter-size);
  font-size: calc(var(--letter-size) * 0.44);
  left: 50%;
  top: 50%;
  transform:
    translate(-50%, -50%)
    translate(
      calc(var(--pos-x) * var(--spread)),
      calc(var(--pos-y) * var(--spread))
    )
    translateZ(calc(var(--pos-z) * 2px))
    rotate(var(--rotate));
  background: linear-gradient(
    145deg,
    var(--color-surface-elevated) 0%,
    color-mix(in oklch, var(--color-surface-elevated) 90%, black) 100%
  );
  color: var(--color-on-surface);
  border-radius: 0.875rem;
  box-shadow:
    0 3px 10px rgba(0, 0, 0, 0.2),
    0 1px 3px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    inset 0 -1px 0 rgba(0, 0, 0, 0.05);
  z-index: calc(var(--pos-z));
  animation: letter-float 5s ease-in-out infinite;
  animation-delay: var(--delay);
  transition: transform 0.1s ease-out, box-shadow 0.1s ease-out;
}

.outer-letter:active,
.outer-letter.is-pressed {
  transform:
    translate(-50%, -50%)
    translate(
      calc(var(--pos-x) * var(--spread)),
      calc(var(--pos-y) * var(--spread))
    )
    translateZ(0px)
    rotate(var(--rotate))
    scale(0.92);
  box-shadow:
    0 1px 4px rgba(0, 0, 0, 0.25),
    0 1px 2px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.03);
  background: linear-gradient(
    145deg,
    color-mix(in oklch, var(--color-surface-elevated) 85%, black) 0%,
    color-mix(in oklch, var(--color-surface-elevated) 75%, black) 100%
  );
}

@keyframes centre-glow {
  0%, 100% {
    box-shadow:
      0 0 30px var(--color-primary-glow),
      0 0 50px var(--color-primary-glow),
      0 6px 20px rgba(0, 0, 0, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.2),
      inset 0 -1px 0 rgba(0, 0, 0, 0.1);
  }
  50% {
    box-shadow:
      0 0 40px var(--color-primary-glow),
      0 0 65px var(--color-primary-glow),
      0 6px 20px rgba(0, 0, 0, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.2),
      inset 0 -1px 0 rgba(0, 0, 0, 0.1);
  }
}

@keyframes letter-float {
  0%, 100% {
    box-shadow:
      0 3px 10px rgba(0, 0, 0, 0.2),
      0 1px 3px rgba(0, 0, 0, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.08),
      inset 0 -1px 0 rgba(0, 0, 0, 0.05);
  }
  50% {
    box-shadow:
      0 4px 12px rgba(0, 0, 0, 0.22),
      0 1px 4px rgba(0, 0, 0, 0.16),
      inset 0 1px 0 rgba(255, 255, 255, 0.1),
      inset 0 -1px 0 rgba(0, 0, 0, 0.05);
  }
}

@media (prefers-reduced-motion: reduce) {
  .letter-button {
    animation: none !important;
    transition: none;
  }

  .centre-letter,
  .centre-letter:active,
  .centre-letter.is-pressed {
    transform: translate(-50%, -50%) translateZ(20px);
  }

  .centre-letter:active,
  .centre-letter.is-pressed {
    transform: translate(-50%, -50%) translateZ(20px) scale(0.92);
  }

  .outer-letter {
    transform:
      translate(-50%, -50%)
      translate(
        calc(var(--pos-x) * var(--spread)),
        calc(var(--pos-y) * var(--spread))
      )
      rotate(var(--rotate));
  }

  .outer-letter:active,
  .outer-letter.is-pressed {
    transform:
      translate(-50%, -50%)
      translate(
        calc(var(--pos-x) * var(--spread)),
        calc(var(--pos-y) * var(--spread))
      )
      rotate(var(--rotate))
      scale(0.92);
  }
}
</style>
