<script setup lang="ts">
defineProps<{
  letters: string[]
  centreLetter: string
}>()

const stack = useState<string[]>('word-stack', () => [])
</script>

<template>
  <ul class="gap-2 grid p-0 grid-cols-5 my-0 sm:mr-auto">
    <li 
      v-for="letter of letters"
      class="list-none flex items-center items-stretch aspect-square min-w-11 w-full"
      :class="[
        letter === centreLetter
          ? 'col-start-2 col-end-4 row-start-1 row-end-3'
          : ''
      ]"
    >
      <button
        class="border-2 border-transparent border-solid font-bold text-xl text-black active:border-black focus:border-white flex-grow flex items-center justify-center"
        :class="[
          letter === centreLetter
            ? 'bg-white'
            : 'bg-yellow-300'
        ]"
        @click="() => stack.push(letter)"
      >
        {{ letter }}
      </button>
    </li>
  </ul>
</template>

<style scoped>

</style>
