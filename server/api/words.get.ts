// @ts-expect-error virtual module
import { pangrams as _pangrams, words as _words } from '#words.mjs'

import { hash } from 'ohash'

const pangrams = _pangrams as string[]
const words = _words as string[]

export default defineEventHandler(async (event) => {
  const storage = useStorage('words')
  const key = new Date().toISOString().slice(0, 10) + '.json'

  if (await storage.hasItem(key)) {
    return storage.getItem(key) as never
  }

  const query = new Set((getQuery(event).letters as string | undefined)?.toUpperCase().split('') || [])
  const letters = query.size === 7 ? [...query] : pangrams[Math.floor(Math.random() * pangrams.length)].split('').sort(() => Math.random() - 0.5)

  const validWords = words.filter((word) => {
    const chars = word.split('')
    return chars.includes(letters[2]) && chars.every(letter => letters.includes(letter))
  })

  const pairs: Record<string, number> = {}

  for (const word of validWords) {
    const prefix = word.slice(0, 2)
    pairs[prefix] = (pairs[prefix] || 0) + 1
  }

  const response = {
    words: validWords.map(w => w.replace(/^(.)(.*)/, (_, first, rest) => first + rest.replace(/./g, '_'))).sort(),
    pairs: Object.fromEntries(Object.entries(pairs).sort((a, b) => a[0].localeCompare(b[0]))),
    hashes: validWords.map(w => hash(w)),
    letters,
    pangrams: validWords.filter(word => letters.every(letter => word.includes(letter))).length,
  }

  event.waitUntil(storage.setItem(key, response))

  return response
})
