/**
 * Returns the current local date as a YYYY-MM-DD string.
 * Unlike toISOString().slice(0, 10), this returns the user's local date,
 * not the UTC date. This is important for timezone-correct date handling.
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
