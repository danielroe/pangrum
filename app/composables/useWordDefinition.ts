export interface BaseWordDefinition {
  partOfSpeech: string
  definition: string
  example?: string
}

export interface DefinitionEntry {
  partOfSpeech: string
  definition: string
  example?: string
  exampleTranslation?: string
  baseWord?: string
  baseWordDefinition?: BaseWordDefinition
}

export interface WordDefinition extends DefinitionEntry {
  word: string
  capitalizedDefinition?: DefinitionEntry
  uiLangFallback?: boolean
}

const cache = new Map<string, WordDefinition>()

export type DefinitionError = 'offline' | 'notFound'

export function useWordDefinition() {
  const definition = ref<WordDefinition | null>(null)
  const loading = ref(false)
  const error = ref<DefinitionError | null>(null)

  async function fetchDefinition(word: string, wordsetLang: string, uiLang: string) {
    const key = `${uiLang}:${wordsetLang}:${word}`

    definition.value = null
    error.value = null

    if (cache.has(key)) {
      definition.value = cache.get(key)!
      return
    }

    loading.value = true

    try {
      const result = await $fetch<WordDefinition>(`/api/definition/${uiLang}/${word}`, { query: { lang: wordsetLang } })
      cache.set(key, result)
      definition.value = result
    }
    catch (err) {
      const isOffline = !navigator.onLine
      const hasResponse = err != null && typeof err === 'object' && 'response' in err && err.response != null
      error.value = isOffline || !hasResponse ? 'offline' : 'notFound'
    }
    finally {
      loading.value = false
    }
  }

  function reset() {
    definition.value = null
    loading.value = false
    error.value = null
  }

  return { definition, loading, error, fetchDefinition, reset }
}
