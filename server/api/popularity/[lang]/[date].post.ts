// @ts-expect-error virtual module
import { languages } from '#words.mjs'

interface PopularityBody {
  wordHash: string
  isFirstWord?: boolean
}

export default defineEventHandler(async (event) => {
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

  const body = await readBody<PopularityBody>(event)

  if (!body?.wordHash || typeof body.wordHash !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing or invalid wordHash',
    })
  }

  const storage = useStorage('popularity')
  const cacheStorage = useStorage('cache:nitro:handlers:_')
  const wordKey = `${lang}:${date}:${body.wordHash}`
  const playersKey = `${lang}:${date}:_players`
  const cacheKey = `get${lang}${date.replace(/-/g, '')}`

  // Fire-and-forget: use waitUntil to process storage writes after response
  event.waitUntil((async () => {
    const currentCount = await storage.getItem<number>(wordKey) || 0
    await storage.setItem(wordKey, currentCount + 1)

    if (body.isFirstWord) {
      const currentPlayers = await storage.getItem<number>(playersKey) || 0
      await storage.setItem(playersKey, currentPlayers + 1)
    }

    // Invalidate the GET handler cache
    await cacheStorage.removeItem(cacheKey)
  })())

  return { success: true }
})
