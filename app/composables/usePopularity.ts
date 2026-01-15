export interface PopularityData {
  counts: Record<string, number>
  totalPlayers: number
}

export function usePopularity(lang: MaybeRefOrGetter<string>, date: MaybeRefOrGetter<string>) {
  const data = ref<PopularityData | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  async function fetchPopularity() {
    const langValue = toValue(lang)
    const dateValue = toValue(date)

    if (!langValue || !dateValue) return

    loading.value = true
    error.value = null

    try {
      data.value = await $fetch<PopularityData>(`/api/popularity/${langValue}/${dateValue}`)
    }
    catch (err) {
      error.value = err as Error
      data.value = null
    }
    finally {
      loading.value = false
    }
  }

  function getPercentage(wordHash: string): number | null {
    if (!data.value || data.value.totalPlayers === 0) return null
    const count = data.value.counts[wordHash] || 0
    return Math.round((count / data.value.totalPlayers) * 100)
  }

  function getCount(wordHash: string): number {
    return data.value?.counts[wordHash] || 0
  }

  const hasData = computed(() => data.value !== null && data.value.totalPlayers > 0)

  return {
    data,
    loading,
    error,
    hasData,
    fetchPopularity,
    getPercentage,
    getCount,
  }
}
