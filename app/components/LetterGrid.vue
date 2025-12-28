<script setup lang="ts">
defineProps<{
  letters: string[]
  centreLetter: string
}>()

const word = useWord()

function addLetter(letter: string) {
  word.value += letter
}

function deleteLetter() {
  word.value = word.value.slice(0, -1)
}

function submitWord() {
  word.value += '\n'
}
</script>

<template>
  <ul class="gap-2 grid p-0 grid-cols-5 my-0 sm:mr-auto touch-manipulation select-none">
    <li
      v-for="letter of letters"
      :key="letter"
      class="list-none flex items-center items-stretch aspect-square min-w-9 w-full"
      :class="[
        letter === centreLetter
          ? 'col-start-2 sm:col-end-4 row-start-1 sm:row-end-3'
          : '',
      ]"
    >
      <button
        class="border-2 border-transparent border-solid bg-[#444] font-mono font-bold text-xl focus:border-white flex-grow flex items-center justify-center touch-none transition-all duration-100"
        :class="[
          letter === centreLetter
            ? 'bg-yellow-300 text-black active:bg-yellow-400'
            : 'text-white active:bg-[#555]',
        ]"
        @click="() => addLetter(letter)"
      >
        {{ letter }}
      </button>
    </li>
    <li class="sm:hidden list-none flex items-center items-stretch aspect-square min-w-11 w-full col-start-5 row-start-1">
      <button
        class="border-2 border-transparent border-solid text-xl text-white border-white border-opacity-30 focus:border-white flex-grow flex items-center justify-center bg-transparent touch-none transition-all duration-100 active:bg-white active:bg-opacity-10"
        @click="deleteLetter"
      >
        <span aria-hidden="true">⌫</span>
        <span class="sr-only">Delete character</span>
      </button>
    </li>
    <li class="sm:hidden list-none flex items-center items-stretch min-w-11 w-full col-start-4 col-end-6 row-start-2">
      <button
        class="border-2 border-transparent border-solid text-xl text-white border-white border-opacity-30 focus:border-white flex-grow flex items-center justify-center bg-transparent touch-none transition-all duration-100 active:bg-white active:bg-opacity-10"
        @click="submitWord"
      >
        <span aria-hidden="true">⏎</span>
        <span class="sr-only">Submit word</span>
      </button>
    </li>
  </ul>
</template>

<style scoped>

</style>
