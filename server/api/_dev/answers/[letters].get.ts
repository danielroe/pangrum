// @ts-expect-error virtual module
import { words } from '#words.mjs'

export default defineEventHandler(async event => {
  if (!import.meta.dev) {
    return
  }
  const letters = (getRouterParam(event, 'letters') as string).toUpperCase()
  return (words as string[]).filter(word => {
    const chars = word.split('')
    return chars.includes(letters[2]) && chars.every(letter => letters.includes(letter))
  }).sort()
})
