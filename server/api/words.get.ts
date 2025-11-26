// @ts-expect-error virtual module
import { choices as _choices, words as _words } from '#words.mjs'

import { hash } from 'ohash'

const choices = _choices as string[]
const words = _words as string[]

export default defineEventHandler(async event => {
  const query = new Set((getQuery(event).letters as string | undefined)?.toUpperCase().split('') || [])
  const letters = query.size === 7 ? [...query] : choices[Math.floor(Math.random() * choices.length)].split('').sort(() => Math.random() - 0.5)

  const validWords = words.filter(word => {
    const chars = word.split('')
    return chars.includes(letters[2]) && chars.every(letter => letters.includes(letter))
  })
  
  return {
    words: validWords.map(w => w.replace(/(..)(.*)/, (_, first, rest) => first + rest.replace(/./g, '_'))).sort(),
    hashes: validWords.map(w => hash(w)),
    letters,
    pangrams: validWords.filter(word => letters.every(letter => word.includes(letter))).length
  }
})
