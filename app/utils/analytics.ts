type EventProperties = Record<string, string | number | boolean | null>

/**
 * Track a custom event with Vercel Analytics.
 * Events are only sent in production.
 */
export function trackEvent(name: string, properties?: EventProperties) {
  if (import.meta.server || import.meta.test || import.meta.dev) {
    return
  }
  window.va?.('event', { name, data: properties })
}

/** Significant levels worth tracking (skip intermediate ones) */
const TRACKED_LEVELS = new Set(['genius', 'perfect'])

/** Streak milestones worth tracking */
const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100]

/**
 * Track when user finds their first word in a session.
 * This also serves as the "puzzle started" signal.
 */
export function trackFirstWord(language: string) {
  trackEvent('first_word_found', { language })
}

export function trackPangramFound(language: string, wordCount: number) {
  trackEvent('pangram_found', { language, word_count: wordCount })
}

export function trackLevelReached(level: string, language: string) {
  if (TRACKED_LEVELS.has(level)) {
    trackEvent('level_reached', { level, language })
  }
}

export function trackPuzzleCompleted(language: string, percentage: number) {
  if (percentage === 100) {
    trackEvent('puzzle_completed', { language, percentage })
  }
}

export function trackStreakAchieved(days: number) {
  if (STREAK_MILESTONES.includes(days)) {
    trackEvent('streak_achieved', { days })
  }
}

export function trackShareCompleted(method: 'native' | 'copy_text' | 'copy_image' | 'download') {
  trackEvent('share_completed', { method })
}

export function trackSyncEnabled() {
  trackEvent('sync_enabled')
}

export function trackTutorialCompleted() {
  trackEvent('tutorial_completed')
}

export function trackLanguageChanged(from: string, to: string) {
  trackEvent('language_changed', { from, to })
}
