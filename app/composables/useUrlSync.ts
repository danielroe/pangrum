export function syncToUrl(key: string, value: string, defaultValue: string) {
  if (!import.meta.client) return
  const route = useRoute()
  const query = { ...route.query }
  if (value === defaultValue) query[key] = null
  else query[key] = value
  if (route.query[key] !== query[key]) useRouter().replace({ query })
}

export function getUrlParam<T extends string>(key: string, isValid: (v: unknown) => v is T): T | undefined {
  const val = useRoute().query[key]
  return typeof val === 'string' && isValid(val) ? val : undefined
}
