export default defineNuxtConfig({
  modules: [
    function (_, nuxt) {
      if (nuxt.options._prepare) {
        nuxt.options.pwa ||= {}
        nuxt.options.pwa.pwaAssets ||= {}
        nuxt.options.pwa.pwaAssets.disabled = true
      }
    },
    '@unocss/nuxt',
    '@vueuse/nuxt',
    '@nuxt/eslint',
    '@vite-pwa/nuxt',
    '@nuxtjs/color-mode',
    '@nuxt/test-utils',
    'nuxt-og-image',
  ],
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
  $test: {
    pwa: {
      disable: true,
      pwaAssets: {
        disabled: true,
      },
    },
  },
  imports: {
    dirs: ['~/stores'],
  },
  devtools: { enabled: true },
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'Pangrum - Daily Word Puzzle Game',
      meta: [
        { name: 'description', content: 'Challenge yourself with Pangrum, a daily word puzzle game. Find words using seven letters, with one special centre letter that must appear in every word. How many can you find?' },
        { name: 'keywords', content: 'word game, puzzle, daily puzzle, spelling, pangram, word finder, vocabulary game, brain game' },
        { name: 'author', content: 'Pangrum' },
        { name: 'robots', content: 'index, follow' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Pangrum' },
        { property: 'og:locale', content: 'en_US' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
      link: [
        { rel: 'canonical', href: 'https://pangrum.com' },
      ],
      viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
    },
  },
  site: {
    url: 'https://pangrum.com',
    name: 'Pangrum',
  },
  colorMode: {
    preference: 'system',
    fallback: 'dark',
    dataValue: 'theme',
    storageKey: 'pangrum-theme',
  },
  routeRules: {
    '/': { prerender: true },
    '/__og-image__/**': { prerender: true },
  },
  compatibilityDate: '2025-07-15',
  eslint: {
    config: {
      stylistic: true,
    },
  },
  ogImage: {
    zeroRuntime: true,
    defaults: {
      component: 'Default',
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
      launch_handler: {
        client_mode: ['navigate-existing', 'auto'],
      },
      handle_links: 'preferred',
    },
    pwaAssets: {
      config: true,
      overrideManifestIcons: true,
      injectThemeColor: false,
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
