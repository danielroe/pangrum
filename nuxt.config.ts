// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  routeRules: {
    '/': { isr: 60 }
  },
  nitro: {
    storage: {
      words: {
        driver: 'vercel-kv',
      }
    }
  },
  modules: ['@unocss/nuxt', '@vueuse/nuxt']
})
