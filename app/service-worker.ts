import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'
import { NetworkFirst } from 'workbox-strategies'
import { NavigationRoute, registerRoute } from 'workbox-routing'

declare let self: ServiceWorkerGlobalScope

const WORDS_CACHE_VERSION = 'v1'
const WORDS_CACHE_NAME = `words-api-cache-${WORDS_CACHE_VERSION}`

self.skipWaiting()
clientsClaim()

cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

registerRoute(
  ({ url }) => url.pathname.startsWith('/api/words/'),
  new NetworkFirst({
    cacheName: WORDS_CACHE_NAME,
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

    const cache = await caches.open(WORDS_CACHE_NAME)

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

// clean up old word caches and prefetch on activation
self.addEventListener('activate', (event) => {
  const cleanupAndPrefetch = async () => {
    const cacheNames = await caches.keys()
    await Promise.all(
      cacheNames
        .filter(name => name.startsWith('words-api-cache-') && name !== WORDS_CACHE_NAME)
        .map(name => caches.delete(name)),
    )

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

    const cache = await caches.open(WORDS_CACHE_NAME)

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

  event.waitUntil(cleanupAndPrefetch())
})

self.addEventListener('periodicsync', (event: Event) => {
  const syncEvent = event as ExtendableEvent & { tag: string }
  if (syncEvent.tag === 'daily-puzzle-reminder') {
    syncEvent.waitUntil(showDailyReminder())
  }
})

async function showDailyReminder() {
  const clients = await self.clients.matchAll({ type: 'window' })

  if (clients.length > 0) {
    return
  }

  await self.registration.showNotification('Pangrum', {
    body: 'New puzzle available!',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: 'pangrum-daily',
    data: {
      url: '/',
    },
  })
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const urlToOpen = event.notification.data?.url || '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus()
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen)
      }
    }),
  )
})
