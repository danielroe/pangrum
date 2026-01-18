// @ts-expect-error virtual module
import { languages } from '#words.mjs'

export default defineCachedEventHandler(async (event) => {
  const lang = getRouterParam(event, 'lang')
  const date = getRouterParam(event, 'date')

  if (!lang || !languages.includes(lang)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid language. Supported languages: ${languages.join(', ')}`,
    })
  }

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(new Date(date).getTime())) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid date format. Expected YYYY-MM-DD',
    })
  }

  const storage = useStorage('popularity')
  const prefix = `${lang}:${date}:`

  const keys = await storage.getKeys(prefix)
  const counts: Record<string, number> = {}
  let totalPlayers = 0

  for (const key of keys) {
    const shortKey = key.replace(prefix, '')

    if (shortKey === '_players') {
      totalPlayers = await storage.getItem<number>(key) || 0
    }
    else {
      const count = await storage.getItem<number>(key)
      if (count) {
        counts[shortKey] = count
      }
    }
  }

  return {
    counts,
    totalPlayers,
  }
}, {
  getKey: (event) => {
    const lang = getRouterParam(event, 'lang') || ''
    const date = getRouterParam(event, 'date') || ''
    return `get${lang}${date.replace(/-/g, '')}`
  },
})
