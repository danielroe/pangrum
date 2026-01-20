import { getLocalDateString } from '#shared/utils'

function isValidDate(dateString: unknown): dateString is string {
  return typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString) && !Number.isNaN(Date.parse(dateString))
}

export const useDate = createSharedComposable(function useDate() {
  const route = useRoute()
  // const router = useRouter()

  const dateString = isValidDate(route.query.date)
    ? route.query.date
    : getLocalDateString()

  const date = ref(import.meta.server ? '' : dateString)
  // TODO: reenable later
  // watch(date, newDate => router.push({ query: { ...route.query, date: newDate } }), { immediate: true })

  return { date }
})
