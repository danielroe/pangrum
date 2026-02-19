// @ts-expect-error virtual module
import { languages } from '#words.mjs'

// Map game language codes to the lang_code used by wiktapi.dev
const wiktapiLang: Record<string, string> = {
  'en': 'en',
  'en-gb': 'en',
  'de': 'de',
  'nl': 'nl',
  'fr': 'fr',
  'es': 'es',
}

interface WiktapiSense {
  glosses?: string[]
  examples?: Array<{ text?: string } | string>
  tags?: string[]
  form_of?: Array<{ word: string }>
}

interface WiktapiDefinition {
  pos: string
  lang_code: string
  senses: WiktapiSense[]
}

interface WiktapiResponse {
  word: string
  edition: string
  definitions: WiktapiDefinition[]
}

interface BaseWordDefinition {
  partOfSpeech: string
  definition: string
  example?: string
}

interface DefinitionEntry {
  partOfSpeech: string
  definition: string
  example?: string
  baseWord?: string
  baseWordDefinition?: BaseWordDefinition
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

// Fetch exactly the word as given — no casing fallback
async function fetchWiktapiRaw(wordLang: string, word: string): Promise<WiktapiDefinition[] | null> {
  const url = `https://api.wiktapi.dev/v1/${wordLang}/word/${encodeURIComponent(word)}/definitions?lang=${wordLang}`
  try {
    const data = await $fetch<WiktapiResponse>(url)
    return data.definitions?.length ? data.definitions : null
  }
  catch {
    return null
  }
}

// Try word as-is, then capitalized — used for base word lookups where casing is uncertain
async function fetchWiktapiWithFallback(wordLang: string, word: string): Promise<WiktapiDefinition[] | null> {
  const variants = [...new Set([word, capitalize(word)])]
  for (const variant of variants) {
    const result = await fetchWiktapiRaw(wordLang, variant)
    if (result) return result
  }
  return null
}

function extractExample(examples?: Array<{ text?: string } | string>): string | undefined {
  if (!examples?.length) return undefined
  const first = examples[0]
  return typeof first === 'string' ? first || undefined : first?.text || undefined
}

// Extract the base word for inflection senses.
// Structured form_of data is only present in some editions (e.g. EN Wiktionary).
// Native editions (DE, FR, NL, ES, ...) embed the base word as the last word in the gloss:
//   "1. Person Singular ... des Verbs leiern"     → leiern
//   "Première personne ... du verbe aller"         → aller
//   "meervoud van het zelfstandig naamwoord hond"  → hond
//   "Forma del plural de perro"                    → perro
function getBaseWord(sense: WiktapiSense): string | null {
  if (sense.form_of?.[0]?.word) return sense.form_of[0].word
  if (sense.tags?.includes('form-of') && sense.glosses?.[0]) {
    const lastWord = sense.glosses[0].trim().match(/(\S+)$/)
    return lastWord ? lastWord[1]!.replace(/[.,;:!?]+$/, '') || null : null
  }
  return null
}

function resolveDefinition(definitions: WiktapiDefinition[]): { def: WiktapiDefinition, sense: WiktapiSense } | null {
  for (const def of definitions) {
    const sense = def.senses.find(s => s.glosses?.length)
    if (sense) return { def, sense }
  }
  return null
}

async function buildEntry(wordLang: string, resolved: { def: WiktapiDefinition, sense: WiktapiSense }): Promise<DefinitionEntry> {
  const { def, sense } = resolved
  const baseWordRaw = getBaseWord(sense)

  let baseWord: string | undefined
  let baseWordDefinition: BaseWordDefinition | undefined

  if (baseWordRaw) {
    const baseDefs = await fetchWiktapiWithFallback(wordLang, baseWordRaw)
    const baseResolved = baseDefs ? resolveDefinition(baseDefs) : null
    if (baseResolved) {
      baseWord = baseWordRaw.toLowerCase()
      baseWordDefinition = {
        partOfSpeech: baseResolved.def.pos,
        definition: baseResolved.sense.glosses![0]!,
        example: extractExample(baseResolved.sense.examples),
      }
    }
  }

  return {
    partOfSpeech: def.pos,
    definition: sense.glosses![0]!,
    example: extractExample(sense.examples),
    ...(baseWord && baseWordDefinition ? { baseWord, baseWordDefinition } : {}),
  }
}

export default defineCachedEventHandler(async (event) => {
  const lang = getRouterParam(event, 'lang')
  const word = getRouterParam(event, 'word')?.toLowerCase()

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

  const wordLang = wiktapiLang[lang]!
  const capitalized = capitalize(word)

  // Fetch both the lowercase and capitalized variants in parallel
  const [lowercaseDefs, capitalizedDefs] = await Promise.all([
    fetchWiktapiRaw(wordLang, word),
    word !== capitalized ? fetchWiktapiRaw(wordLang, capitalized) : Promise.resolve(null),
  ])

  const resolvedLower = lowercaseDefs ? resolveDefinition(lowercaseDefs) : null
  const resolvedCapital = capitalizedDefs ? resolveDefinition(capitalizedDefs) : null

  if (!resolvedLower && !resolvedCapital) {
    throw createError({ statusCode: 404, statusMessage: 'No definition found' })
  }

  // Primary: lowercase if it exists, otherwise fall back to capitalized
  const primary = resolvedLower ?? resolvedCapital!

  // Include the capitalized variant only if it's a distinct entry from the primary
  const isDistinctEntry = resolvedLower && resolvedCapital
    && (resolvedLower.def.pos !== resolvedCapital.def.pos
      || resolvedLower.sense.glosses![0] !== resolvedCapital.sense.glosses![0])
  const alternate = isDistinctEntry ? resolvedCapital : null

  // Build both entries in parallel (each may trigger a base word fetch)
  const [primaryEntry, capitalizedEntry] = await Promise.all([
    buildEntry(wordLang, primary),
    alternate ? buildEntry(wordLang, alternate) : Promise.resolve(null),
  ])

  return {
    word,
    ...primaryEntry,
    ...(capitalizedEntry ? { capitalizedDefinition: capitalizedEntry } : {}),
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
