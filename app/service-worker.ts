import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'
import { NetworkFirst } from 'workbox-strategies'
import { NavigationRoute, registerRoute } from 'workbox-routing'

declare let self: ServiceWorkerGlobalScope

self.skipWaiting()
clientsClaim()

// Clean up old caches
cleanupOutdatedCaches()

// Precache all assets
precacheAndRoute(self.__WB_MANIFEST)

registerRoute(
  ({ url }) => url.pathname.startsWith('/api/words/'),
  new NetworkFirst({
    cacheName: 'words-api-cache',
    networkTimeoutSeconds: 5,
  }),
)

const navigationRoute = new NavigationRoute(
  new NetworkFirst({
    cacheName: 'pages-cache',
    networkTimeoutSeconds: 3,
  }),
)
registerRoute(navigationRoute)

// Prefetch upcoming word lists on install
self.addEventListener('install', (event) => {
  const prefetchUpcomingDays = async () => {
    const today = new Date()
    const urls: string[] = []
    const languages = ['en', 'en-gb', 'de', 'nl', 'fr', 'es']

    for (const lang of languages) {
      for (let i = 1; i <= 7; i++) {
        const date = new Date(today)
        date.setDate(today.getDate() + i)
        const dateStr = date.toISOString().slice(0, 10)
        urls.push(`/api/words/${lang}/${dateStr}`)
      }
    }

    const cache = await caches.open('words-api-cache')

    // Prefetch all upcoming days
    await Promise.allSettled(
      urls.map(async (url) => {
        try {
          const response = await fetch(url)
          if (response.ok) {
            await cache.put(url, response.clone())
          }
        }
        catch {
          // Silently fail - prefetching is opportunistic
        }
      }),
    )
  }

  event.waitUntil(prefetchUpcomingDays())
})

// Prefetch on activation and periodically
self.addEventListener('activate', (event) => {
  const prefetchUpcomingDays = async () => {
    const today = new Date()
    const urls: string[] = []
    const languages = ['en', 'en-gb', 'de', 'nl', 'fr', 'es']

    for (const lang of languages) {
      for (let i = 0; i <= 7; i++) {
        const date = new Date(today)
        date.setDate(today.getDate() + i)
        const dateStr = date.toISOString().slice(0, 10)
        urls.push(`/api/words/${lang}/${dateStr}`)
      }
    }

    const cache = await caches.open('words-api-cache')

    await Promise.allSettled(
      urls.map(async (url) => {
        try {
          const response = await fetch(url)
          if (response.ok) {
            await cache.put(url, response.clone())
          }
        }
        catch {
          // silently fail
        }
      }),
    )
  }

  event.waitUntil(prefetchUpcomingDays())
})
