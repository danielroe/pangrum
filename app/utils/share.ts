import { getLevelKey, LEVEL_KEYS, LEVEL_THRESHOLDS } from './score'

export interface ShareData {
  date: string
  score: number
  maxScore: number
  wordsFound: number
  totalWords: number
  status: string
  pangrams: number
  totalPangrams: number
  letters: string[]
}

export function calculateFillWidth(percentage: number): number {
  const thresholds = LEVEL_KEYS.map(key => [key, LEVEL_THRESHOLDS[key]] as const)
  const thresholdCount = thresholds.length

  const statusKey = getLevelKey(percentage)
  const currentIdx = thresholds.findIndex(([key]) => key === statusKey)
  const nextIdx = currentIdx + 1

  if (nextIdx >= thresholdCount) {
    return 100
  }

  const currentThreshold = thresholds[currentIdx]![1]
  const nextThresholdVal = thresholds[nextIdx]![1]

  const segmentProgress = (percentage - currentThreshold) / (nextThresholdVal - currentThreshold)
  const clampedProgress = Math.max(0, Math.min(1, segmentProgress))

  const getDotPosition = (index: number) => (index / (thresholdCount - 1)) * 100
  const startPos = getDotPosition(currentIdx)
  const endPos = getDotPosition(nextIdx)

  return startPos + (endPos - startPos) * clampedProgress
}

export function formatShareText(data: ShareData): string {
  const pangramPart = data.totalPangrams > 0
    ? ` | ${data.pangrams}/${data.totalPangrams} pangrams`
    : ''

  return `Pangrum ${data.date}\nScore: ${data.score} (${data.status})\n${data.wordsFound}/${data.totalWords} words${pangramPart}\n\npangrum.com`
}
