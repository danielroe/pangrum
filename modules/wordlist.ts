import { addServerTemplate, defineNuxtModule } from 'nuxt/kit'
import english from 'wordlist-js/dist/english'
import british from 'wordlist-js/dist/british'

const WORD_LENGTH = 7
interface WordMeta {
  options: number
}
interface Word {
  letters: Set<string>
}


export default defineNuxtModule({
  meta: {
    name: 'wordlist',
  },
  setup(_, nuxt) {
    if (nuxt.options._prepare) {
      return
    }
    const words: Record<string, Word> = Object.create(null)
    const sets = [10, 20, 35, 40, /* 50, 55, 60 */] as const
    for (const word of new Set(sets.flatMap(set => [...english[`english${set}Unfiltered`], ...british[`british${set}Unfiltered`]]))) {
      if (word.length < 4) {
        continue
      }
      const uppercasedWord = word.toUpperCase()
      words[uppercasedWord] = {
        letters: new Set(uppercasedWord.split(''))
      }
    }
    const choices: Record<string, WordMeta> = {}

    for (const word in words) {
      const letterSet = words[word]!.letters
      if (letterSet.size !== WORD_LENGTH) {
        continue
      }
      const joined = [...letterSet].sort().join('').toUpperCase()
      if (joined in choices) {
        continue
      }
      let options = 0

      for (const o in words) {
        if ([...words[o]!.letters].every(l => letterSet.has(l))) {
          options++
        }
      }
      choices[joined] = {
        options
      }
    }

    addServerTemplate({
      filename: '#words.mjs',
      getContents: () =>
        `
        export const choices = ${JSON.stringify(Object.keys(choices))}
        export const words = ${JSON.stringify(Object.keys(words))}
        `
    })
  },
})
