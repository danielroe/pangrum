// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  routeRules: {
    '/': { isr: 60 }
  },
  imports: {
    dirs: ['~/stores']
  },
  nitro: {
    storage: {
      words: {
        driver: 'vercel-kv',
      }
    }
  },
  $development: {
    nitro: {
      storage: {
        words: {
          driver: 'fsLite',
          base: '.nuxt/words'
        }
      }
    },
  },
  modules: ['@unocss/nuxt', '@vueuse/nuxt', '@nuxt/eslint']
})
