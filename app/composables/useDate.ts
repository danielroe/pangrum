function isValidDate(dateString: unknown): dateString is string {
  if (typeof dateString !== 'string') return false
  const regex = /^\d{4}-\d{2}-\d{2}$/
  if (!regex.test(dateString)) return false
  const date = new Date(dateString)
  const timestamp = date.getTime()
  if (isNaN(timestamp)) return false
  return date.toISOString().slice(0, 10) === dateString
}

export const useDate = createSharedComposable(function useDate() {
  const route = useRoute()
  const router = useRouter()
  const dateString = isValidDate(route.query.date) ? route.query.date : new Date().toISOString().slice(0, 10)

  const date = ref(import.meta.server ? '' : dateString)
  watch(date, newDate => router.push({ query: { ...route.query, date: newDate } }), { immediate: true })

  return {
    date,
  }
})
