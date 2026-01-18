export const WORDS_API_URL_PATTERN = /^\/api\/words\/([^/]+)\/(\d{4}-\d{2}-\d{2})$/

export function parseWordsApiUrl(url: string): { lang: string, date: string } | null {
  const parsedUrl = new URL(url)
  const match = parsedUrl.pathname.match(WORDS_API_URL_PATTERN)
  if (match) {
    return { lang: match[1]!, date: match[2]! }
  }
  return null
}

export function getClosestDate(cachedDates: Set<string>, targetDate: string): string {
  if (cachedDates.size === 0) return targetDate
  if (cachedDates.has(targetDate)) return targetDate

  const targetTime = new Date(targetDate).getTime()
  let closestDate = targetDate
  let closestDiff = Infinity

  for (const date of cachedDates) {
    const diff = Math.abs(new Date(date).getTime() - targetTime)
    if (diff < closestDiff) {
      closestDiff = diff
      closestDate = date
    }
  }

  return closestDate
}
