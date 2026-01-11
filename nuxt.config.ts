// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@unocss/nuxt', '@vueuse/nuxt', '@nuxt/eslint', '@vite-pwa/nuxt', '@nuxtjs/color-mode'],
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
  colorMode: {
    preference: 'system',
    fallback: 'dark',
    dataValue: 'theme',
    storageKey: 'pangrum-theme',
  },
  routeRules: {
    '/': { prerender: true },
  },
  compatibilityDate: '2025-07-15',
  nitro: {
    storage: {
      words: {
        driver: 'vercel-kv',
      },
    },
  },
  eslint: {
    config: {
      stylistic: true,
    },
  },
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Pangrum',
      short_name: 'Pangrum',
      description: 'Daily word puzzle game',
      display: 'standalone',
      theme_color: '#0f0f0f',
      background_color: '#0f0f0f',
      start_url: '/',
      scope: '/',
      orientation: 'portrait',
      categories: ['games', 'entertainment'],
    },
    pwaAssets: {
      preset: 'minimal-2023',
      image: 'public/logo.svg',
      overrideManifestIcons: true,
    },
    strategies: 'injectManifest',
    srcDir: '.',
    filename: 'service-worker.ts',
    injectManifest: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    injectRegister: 'auto',
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 3600, // Check for updates every hour
    },
    devOptions: {
      enabled: true,
      type: 'module',
    },
    workbox: {
      navigateFallback: '/',
      cleanupOutdatedCaches: true,
    },
  },
})
