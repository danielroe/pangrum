import { addServerTemplate, defineNuxtModule } from 'nuxt/kit'
import { loadDictionary } from 'language-packages'
import { unmunch } from './utils/unmunch'

const WORD_LENGTH = 7
const MIN_WORD_LENGTH = 4

// Languages where all nouns are capitalized (not just proper nouns)
const CAPITALIZED_NOUN_LANGUAGES = new Set(['de'])

const LANGUAGES: Record<string, { locale: string, alphabet: string }> = {
  'en': {
    locale: 'en-US',
    alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  },
  'en-gb': {
    locale: 'en-GB',
    alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  },
  'de': {
    locale: 'de-DE',
    alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜẞ',
  },
  'nl': {
    locale: 'nl',
    alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  },
  'fr': {
    locale: 'fr',
    alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZÀÂÆÇÉÈÊËÎÏÔŒÙÛÜŸ',
  },
  'es': {
    locale: 'es',
    alphabet: 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZÁÉÍÓÚÜ',
  },
}

export default defineNuxtModule({
  meta: {
    name: 'wordlist',
  },
  setup(_, nuxt) {
    if (nuxt.options._prepare) {
      return
    }

    const languageData: Record<string, { words: Set<string>, pangrams: Set<string> }> = {}

    addServerTemplate({
      filename: '#words.mjs',
      getContents: () => {
        const exports = Object.entries(languageData).map(([lang, data]) => {
          return `export const ${lang.replace(/-/g, '_')}_pangrams = ${JSON.stringify([...data.pangrams])}
export const ${lang.replace(/-/g, '_')}_words = ${JSON.stringify([...data.words])}`
        }).join('\n')

        return `
${exports}

export const languages = ${JSON.stringify(Object.keys(languageData))}
        `
      },
    })

    nuxt.hook('nitro:init', async (nitro) => {
      console.log('🔤 Extracting word lists for multiple languages...')

      for (const [langKey, langConfig] of Object.entries(LANGUAGES)) {
        const { locale, alphabet } = langConfig
        console.log(`  Processing ${langKey} (${locale})...`)

        const cacheKey = `words:list-${langKey}`
        const cachedData = await nitro.storage.getItem<{ pangrams: string[], words: string[] }>(cacheKey)

        if (cachedData) {
          console.log(`    ✓ Loaded from cache (${cachedData.words.length} words, ${cachedData.pangrams.length} pangrams)`)
          languageData[langKey] = {
            words: new Set(cachedData.words),
            pangrams: new Set(cachedData.pangrams),
          }
          continue
        }

        const words = new Set<string>()
        const pangrams = new Set<string>()

        try {
          const dictionary = await loadDictionary(locale, { strict: true })
          if (!dictionary) {
            console.log(`    ✗ Dictionary not found for ${locale}`)
            continue
          }

          const alphabetArray = alphabet.split('')

          console.log(`    Expanding dictionary...`)

          try {
            const expandedWords = await unmunch(dictionary.dic, dictionary.aff)

            console.log(`    Processing ${expandedWords.length} expanded words...`)

            // For languages with capitalized nouns (like German), we need to track
            // which words exist in lowercase form to filter out proper nouns
            const lowercaseWords = CAPITALIZED_NOUN_LANGUAGES.has(langKey)
              ? new Set(expandedWords.filter(w => w[0] === w[0]?.toLowerCase()).map(w => w.toLowerCase()))
              : null

            let skippedProperNouns = 0

            for (const word of expandedWords) {
              const originalWord = word.trim()
              if (!originalWord || originalWord.length < MIN_WORD_LENGTH) continue

              const firstChar = originalWord[0]
              const isCapitalized = firstChar !== firstChar?.toLowerCase()

              // Filter out proper nouns (words starting with capital letter)
              if (isCapitalized) {
                if (lowercaseWords) {
                  if (!lowercaseWords.has(originalWord.toLowerCase())) {
                    skippedProperNouns++
                    continue
                  }
                }
                else {
                  skippedProperNouns++
                  continue
                }
              }

              const trimmed = originalWord.toUpperCase()
              const wordChars = new Set(trimmed.split(''))

              if (![...wordChars].every(c => alphabetArray.includes(c))) continue

              words.add(trimmed)

              if (wordChars.size === WORD_LENGTH) {
                pangrams.add([...wordChars].sort().join(''))
              }
            }

            if (skippedProperNouns > 0) {
              console.log(`    Filtered out ${skippedProperNouns} proper nouns`)
            }
          }
          catch (error) {
            console.error(`    ✗ Failed to expand dictionary: ${error}`)
            continue
          }

          console.log(`    ✓ Extracted ${words.size} words, ${pangrams.size} pangrams`)

          languageData[langKey] = { words, pangrams }

          await nitro.storage.setItem(cacheKey, {
            pangrams: [...pangrams],
            words: [...words],
          })
        }
        catch (error) {
          console.error(`    ✗ Error processing ${locale}:`, error)
          languageData[langKey] = { words: new Set(), pangrams: new Set() }
        }
      }
    })
  },
})
