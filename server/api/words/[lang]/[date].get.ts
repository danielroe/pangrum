// @ts-expect-error virtual module
import { languages, en_pangrams, en_words, en_gb_pangrams, en_gb_words, de_pangrams, de_words, nl_pangrams, nl_words, fr_pangrams, fr_words, es_pangrams, es_words } from '#words.mjs'

import { hash } from 'ohash'

// Seeded random number generator (Mulberry32)
function seededRandom(seed: string) {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0
  }

  return function () {
    h = Math.imul(h ^ h >>> 15, h | 1)
    h ^= h + Math.imul(h ^ h >>> 7, h | 61)
    return ((h ^ h >>> 14) >>> 0) / 4294967296
  }
}

// Fisher-Yates shuffle with custom random function
function shuffle<T>(array: T[], random: () => number): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!]
  }
  return result
}

const wordsByLang: Record<string, string[]> = {
  'en': en_words,
  'en-gb': en_gb_words,
  'de': de_words,
  'nl': nl_words,
  'fr': fr_words,
  'es': es_words,
}

const pangramsByLang: Record<string, string[]> = {
  'en': en_pangrams,
  'en-gb': en_gb_pangrams,
  'de': de_pangrams,
  'nl': nl_pangrams,
  'fr': fr_pangrams,
  'es': es_pangrams,
}

export default defineCachedEventHandler(async (event) => {
  const lang = getRouterParam(event, 'lang')
  const date = getRouterParam(event, 'date')

  // Validate language
  if (!lang || !languages.includes(lang)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid language. Supported languages: ${languages.join(', ')}`,
    })
  }

  // Validate date format (YYYY-MM-DD)
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(new Date(date).getTime())) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid date format. Expected YYYY-MM-DD',
    })
  }

  const pangrams = pangramsByLang[lang] || []
  const words = wordsByLang[lang] || []

  if (pangrams.length === 0 || words.length === 0) {
    throw createError({
      statusCode: 503,
      statusMessage: `Word list not available for language: ${lang}`,
    })
  }

  // Use seeded random to ensure same puzzle for same date/language
  const seed = `${lang}-${date}`
  const random = seededRandom(seed)

  // Select pangram deterministically
  const pangramIndex = Math.floor(random() * pangrams.length)
  const pangram = pangrams[pangramIndex]!

  // Shuffle letters deterministically
  const letters = shuffle(pangram.split(''), random)

  const validWords = words.filter((word) => {
    const chars = word.split('')
    return chars.includes(letters[2]!) && chars.every(letter => letters.includes(letter))
  })

  const pairs: Record<string, number> = {}

  for (const word of validWords) {
    const prefix = word.slice(0, 2)
    pairs[prefix] = (pairs[prefix] || 0) + 1
  }

  return {
    words: validWords.map(w => w.replace(/^(.)(.*)/, (_, first, rest) => first + rest.replace(/./g, '_'))).sort(),
    pairs: Object.fromEntries(Object.entries(pairs).sort((a, b) => a[0].localeCompare(b[0]))),
    hashes: validWords.map(w => hash(w)),
    letters,
    pangrams: validWords.filter(word => letters.every(letter => word.includes(letter))).length,
    date,
    lang,
  }
}, {
  maxAge: 60 * 60 * 24 * 7,
  base: 'words',
  getKey: (event) => {
    const lang = getRouterParam(event, 'lang')
    const date = getRouterParam(event, 'date')
    return `v0-${lang}-${date}`
  },
})
