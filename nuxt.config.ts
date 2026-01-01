// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@unocss/nuxt', '@vueuse/nuxt', '@nuxt/eslint', '@vite-pwa/nuxt'],
  $development: {
    nitro: {
      storage: {
        words: {
          driver: 'fsLite',
          base: '.nuxt/words',
        },
      },
    },
  },
  imports: {
    dirs: ['~/stores'],
  },
  devtools: { enabled: true },
  app: {
    head: {
      viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
    },
  },
  routeRules: {
    '/': { isr: 60 },
  },
  compatibilityDate: '2025-07-15',
  nitro: {
    storage: {
      words: {
        driver: 'vercel-kv',
      },
    },
  },
  typescript: {
    hoist: [
      'workbox-precaching',
      'workbox-core',
      'workbox-strategies',
      'workbox-routing',
    ],
  },
  eslint: {
    config: {
      stylistic: true,
    },
  },
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Spelling Bee',
      short_name: 'Spelling Bee',
      description: 'Daily word puzzle game',
      theme_color: '#ffffff',
      background_color: '#ffffff',
      display: 'standalone',
      icons: [
        {
          src: '/icon-192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/icon-512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    },
    strategies: 'injectManifest',
    srcDir: '.',
    filename: 'service-worker.ts',
    injectManifest: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 3600, // Check for updates every hour
    },
    devOptions: {
      enabled: true,
      type: 'module',
    },
  },
})
