// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@unocss/nuxt', '@vueuse/nuxt', '@nuxt/eslint'],
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
  eslint: {
    config: {
      stylistic: true,
    },
  },
})
