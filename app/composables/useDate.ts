function isValidDate(dateString: unknown): dateString is string {
  return typeof dateString === 'string' && new Date(dateString).toISOString().slice(0, 10) === dateString
}

export const useDate = createSharedComposable(function useDate() {
  const route = useRoute()
  const router = useRouter()

  const dateString = isValidDate(route.query.date)
    ? route.query.date
    : new Date().toISOString().slice(0, 10)

  const date = ref(import.meta.server ? '' : dateString)
  watch(date, newDate => router.push({ query: { ...route.query, date: newDate } }), { immediate: true })

  return {
    date,
  }
})
