import { addServerTemplate, defineNuxtModule } from 'nuxt/kit'
import english from 'wordlist-js/dist/english'
import british from 'wordlist-js/dist/british'

const WORD_LENGTH = 7

export default defineNuxtModule({
  meta: {
    name: 'wordlist',
  },
  setup(_, nuxt) {
    if (nuxt.options._prepare) {
      return
    }

    const allWords = new Set<string>()
    const words = new Set<string>()
    const pangrams = new Set<string>()

    addServerTemplate({
      filename: '#words.mjs',
      getContents: () =>
        `
        export const pangrams = ${JSON.stringify([...pangrams])}
        export const words = ${JSON.stringify([...words])}
        `,
    })

    nuxt.hook('nitro:init', async (nitro) => {
      const sets = [10, 20, 35, 40, 50, 55, 60] as const

      const key = sets.join('-') + '.json'
      const cachedData = await nitro.storage.getItem<{ pangrams: string[], words: string[] }>('words:list-' + key)
      if (cachedData) {
        for (const word of cachedData.words) {
          words.add(word)
        }
        for (const pangram of cachedData.pangrams) {
          pangrams.add(pangram)
        }
      }

      for (const set of sets) {
        for (const wordChunk of [english[`english${set}Unfiltered`], british[`british${set}Unfiltered`]]) {
          for (const word of wordChunk) {
            if (word.length < 4) {
              continue
            }

            const uppercasedWord = word.toUpperCase()
            words.add(uppercasedWord)

            const choice = new Set(uppercasedWord.split(''))
            if (choice.size === WORD_LENGTH) {
              pangrams.add([...choice].sort().join(''))
            }
          }
        }
      }

      // find words that fit the pangrams
      for (const pangram of pangrams) {
        const letters = pangram.split('')
        for (const word of allWords) {
          if (letters.every(letter => word.includes(letter))) {
            words.add(word)
          }
        }
      }

      await nitro.storage.setItem('words:list-' + key, { pangrams: [...pangrams], words: [...words] })
    })
  },
})
