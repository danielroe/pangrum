// @ts-expect-error virtual module
import { languages } from '#words.mjs'

// Map game language codes to the language key used in Wiktionary response data.
const wiktionaryLang: Record<string, string> = {
  'en': 'en',
  'en-gb': 'en',
  'de': 'de',
  'nl': 'nl',
  'fr': 'fr',
  'es': 'es',
}

// Strip HTML tags and Wiktionary CSS class noise from definition strings
function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// Extract the base word from a Wiktionary inflection definition.
// Wiktionary wraps inflections in a `form-of-definition` span; the base word
// anchor links to /wiki/WORD (never /wiki/Appendix:...) and carries the word in its title attribute.
function extractBaseWord(html: string): string | null {
  if (!html.includes('form-of-definition')) return null
  const match = html.match(/<a[^>]+href="\/wiki\/(?!Appendix:)[^"]+"[^>]+title="([^"]+)"/)
  return match ? match[1]!.trim().toLowerCase() : null
}

interface WiktionaryDefinition {
  definition: string
  examples?: string[]
}

interface WiktionaryEntry {
  partOfSpeech: string
  definitions: WiktionaryDefinition[]
}

interface DefinitionResult {
  partOfSpeech: string
  definition: string
  example?: string
}

// Try fetching from a specific Wiktionary subdomain. Returns null on any error.
async function fetchFromSubdomain(subdomain: string, word: string): Promise<Record<string, WiktionaryEntry[]> | null> {
  const url = `https://${subdomain}.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(word.toLowerCase())}`
  try {
    return await $fetch<Record<string, WiktionaryEntry[]>>(url)
  }
  catch {
    return null
  }
}

async function fetchWiktionaryData(wordLang: string, word: string): Promise<Record<string, WiktionaryEntry[]> | null> {
  return fetchFromSubdomain('en', word)
}

function pickEntry(data: Record<string, WiktionaryEntry[]>, wordLang: string): WiktionaryEntry | null {
  const entries = data[wordLang] || data['en'] || Object.values(data)[0]
  if (!entries?.length) return null
  return entries[0]!
}

async function fetchWiktionaryDefinition(wordLang: string, word: string): Promise<DefinitionResult | null> {
  const data = await fetchWiktionaryData(wordLang, word)
  if (!data) return null

  const entry = pickEntry(data, wordLang)
  if (!entry) return null

  const definition = entry.definitions.find(d => d.definition.trim() !== '')
  if (!definition) return null

  return {
    partOfSpeech: entry.partOfSpeech,
    definition: stripHtml(definition.definition),
    example: definition.examples?.[0] ? stripHtml(definition.examples[0]) : undefined,
  }
}

export default defineCachedEventHandler(async (event) => {
  const lang = getRouterParam(event, 'lang')
  const word = getRouterParam(event, 'word')

  if (!lang || !languages.includes(lang)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid language. Supported languages: ${languages.join(', ')}`,
    })
  }

  if (!word || !/^[a-zA-ZÀ-ÿ]+$/.test(word)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid word',
    })
  }

  const wordLang = wiktionaryLang[lang]!
  const data = await fetchWiktionaryData(wordLang, word)

  if (!data) {
    throw createError({
      statusCode: 404,
      statusMessage: 'No definition found',
    })
  }

  const entry = pickEntry(data, wordLang)

  if (!entry) {
    throw createError({
      statusCode: 404,
      statusMessage: 'No definition found',
    })
  }

  // Return the first non-empty definition
  const definition = entry.definitions.find(d => d.definition.trim() !== '')

  if (!definition) {
    throw createError({
      statusCode: 404,
      statusMessage: 'No definition found',
    })
  }

  // Check if the definition is an inflection (e.g. "past participle of sever")
  const baseWord = extractBaseWord(definition.definition)
  const baseWordDefinition = baseWord ? await fetchWiktionaryDefinition(wordLang, baseWord) : null

  return {
    word: word.toLowerCase(),
    partOfSpeech: entry.partOfSpeech,
    definition: stripHtml(definition.definition),
    example: definition.examples?.[0] ? stripHtml(definition.examples[0]) : undefined,
    ...(baseWord && baseWordDefinition ? { baseWord, baseWordDefinition } : {}),
  }
}, {
  // Definitions don't change — cache for 30 days
  maxAge: 60 * 60 * 24 * 30,
  base: 'definitions',
  getKey: (event) => {
    const lang = getRouterParam(event, 'lang') || ''
    const word = getRouterParam(event, 'word') || ''
    return `${lang}-${word.toLowerCase()}`
  },
})
