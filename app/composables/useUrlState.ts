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
  })

  watch(state, (newValue) => {
    if (import.meta.client && route.query[key] !== newValue) {
      router.replace({ query: { ...route.query, [key]: newValue } })
    }
  }, { immediate: true })

  return state
}
