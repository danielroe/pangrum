// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  routeRules: {
    '/': { isr: 60 * 60 * 12 }
  },
  modules: ['@unocss/nuxt', '@vueuse/nuxt']
})
