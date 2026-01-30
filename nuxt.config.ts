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
    '@nuxtjs/i18n',
    '@nuxt/a11y',
    '@nuxt/scripts',
  ],
  $development: {
    nitro: {
      storage: {
        words: {
          driver: 'fsLite',
          base: '.nuxt/words',
        },
        popularity: {
          driver: 'fsLite',
          base: '.nuxt/popularity',
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
        { name: 'description', content: 'Challenge yourself with Pangrum, a daily word puzzle game. Find words using seven letters, with a centre letter that must appear in every word. How many can you find?' },
        { name: 'keywords', content: 'word game, puzzle, daily puzzle, spelling, pangram, word finder, vocabulary game, brain game' },
        { name: 'author', content: 'Pangrum' },
        { name: 'robots', content: 'index, follow' },
        { property: 'og:title', content: 'Pangrum - Daily Word Puzzle Game' },
        { property: 'og:description', content: 'Challenge yourself with Pangrum, a daily word puzzle game. Find words using seven letters, with a centre letter that must appear in every word. How many can you find?' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Pangrum' },
        { property: 'og:locale', content: 'en_US' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { property: 'og:url', content: 'https://pangrum.com' },
      ],
      link: [
        { rel: 'canonical', href: 'https://pangrum.com' },
        { rel: 'alternate', hreflang: 'x-default', href: 'https://pangrum.com' },
        { rel: 'alternate', hreflang: 'en', href: 'https://pangrum.com' },
        { rel: 'alternate', hreflang: 'de', href: 'https://pangrum.com' },
        { rel: 'alternate', hreflang: 'es', href: 'https://pangrum.com' },
        { rel: 'alternate', hreflang: 'fr', href: 'https://pangrum.com' },
        { rel: 'alternate', hreflang: 'nl', href: 'https://pangrum.com' },
      ],
      viewport: 'width=device-width, initial-scale=1',
      script: [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'WebSite',
                '@id': 'https://pangrum.com/#website',
                'url': 'https://pangrum.com',
                'name': 'Pangrum',
                'description': 'Daily word puzzle game',
                'inLanguage': ['en', 'de', 'es', 'fr', 'nl'],
              },
              {
                '@type': 'WebApplication',
                '@id': 'https://pangrum.com/#app',
                'name': 'Pangrum',
                'url': 'https://pangrum.com',
                'description': 'Challenge yourself with Pangrum, a daily word puzzle game. Find words using seven letters, with a centre letter that must appear in every word.',
                'applicationCategory': 'GameApplication',
                'operatingSystem': 'Any',
                'browserRequirements': 'Requires JavaScript. Requires HTML5.',
                'offers': {
                  '@type': 'Offer',
                  'price': '0',
                  'priceCurrency': 'USD',
                },
                'isPartOf': { '@id': 'https://pangrum.com/#website' },
              },
              {
                '@type': 'VideoGame',
                '@id': 'https://pangrum.com/#game',
                'name': 'Pangrum',
                'url': 'https://pangrum.com',
                'description': 'A daily word puzzle game where you find words using seven letters, with a centre letter that must appear in every word.',
                'genre': ['Puzzle', 'Word Game', 'Educational'],
                'gamePlatform': ['Web Browser'],
                'playMode': 'SinglePlayer',
                'numberOfPlayers': {
                  '@type': 'QuantitativeValue',
                  'value': 1,
                },
                'inLanguage': ['en', 'de', 'es', 'fr', 'nl'],
                'offers': {
                  '@type': 'Offer',
                  'price': '0',
                  'priceCurrency': 'USD',
                  'availability': 'https://schema.org/InStock',
                },
                'isPartOf': { '@id': 'https://pangrum.com/#website' },
              },
            ],
          }),
        },
      ],
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
    '/_v/script.js': { proxy: 'https://pangrum.com/_vercel/insights/script.js' },
    '/_v/view': { proxy: 'https://pangrum.com/_vercel/insights/view' },
    '/_v/event': { proxy: 'https://pangrum.com/_vercel/insights/event' },
    '/_v/session': { proxy: 'https://pangrum.com/_vercel/insights/session' },
  },
  sourcemap: true,
  compatibilityDate: '2025-07-15',
  eslint: {
    config: {
      stylistic: true,
    },
  },
  i18n: {
    locales: [
      { code: 'en', language: 'en', file: 'en.json', name: 'English' },
      { code: 'de', language: 'de', file: 'de.json', name: 'Deutsch' },
      { code: 'es', language: 'es', file: 'es.json', name: 'Español' },
      { code: 'fr', language: 'fr', file: 'fr.json', name: 'Français' },
      { code: 'nl', language: 'nl', file: 'nl.json', name: 'Nederlands' },
    ],
    defaultLocale: 'en',
    langDir: 'locales',
    strategy: 'no_prefix',
    detectBrowserLanguage: {
      useCookie: false,
      fallbackLocale: 'en',
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
