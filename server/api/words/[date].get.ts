// @ts-expect-error virtual module
import { pangrams as _pangrams, words as _words } from '#words.mjs'

import { hash } from 'ohash'

const pangrams = _pangrams as string[]
const words = _words as string[]

export default defineCachedEventHandler(async (event) => {
  const date = getRouterParam(event, 'date')

  // Validate date format (YYYY-MM-DD)
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid date format. Expected YYYY-MM-DD',
    })
  }

  const letters = pangrams[Math.floor(Math.random() * pangrams.length)].split('').sort(() => Math.random() - 0.5)

  const validWords = words.filter((word) => {
    const chars = word.split('')
    return chars.includes(letters[2]) && chars.every(letter => letters.includes(letter))
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
  }
}, {
  maxAge: 60 * 60 * 24 * 7,
  base: 'words',
  getKey: (event) => {
    return getRouterParam(event, 'date')!
  },
})
