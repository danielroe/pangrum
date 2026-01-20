// Syncs a value with a URL query parameter
export function useUrlState<T extends string>(
  key: string,
  defaultValue: T,
  isValid: (value: unknown) => value is T,
) {
  const route = useRoute()
  const router = useRouter()

  const getInitial = (): T => {
    if (import.meta.server) return defaultValue
    const urlValue = route.query[key] as string
    return urlValue && isValid(urlValue) ? urlValue : defaultValue
  }

  const state = ref<T>(getInitial()) as Ref<T>

  watch(() => route.query[key], (newValue) => {
    if (newValue && isValid(newValue) && newValue !== state.value) {
      state.value = newValue
    }
    else if (!newValue && state.value !== defaultValue) {
      state.value = defaultValue
    }
  })

  watch(state, (newValue) => {
    if (!import.meta.client) return
    if (newValue !== defaultValue && route.query[key] !== newValue) {
      router.replace({ query: { ...route.query, [key]: newValue } })
    }
    else if (newValue === defaultValue && route.query[key]) {
      const { [key]: _, ...rest } = route.query
      router.replace({ query: rest })
    }
  }, { immediate: true })

  return state
}
