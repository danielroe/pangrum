import { provider } from 'std-env'
import { defineNuxtModule } from 'nuxt/kit'

export default defineNuxtModule({
  meta: {
    name: 'vercel-kv',
  },
  setup(_options, nuxt) {
    if (provider === 'vercel') {
      nuxt.hook('nitro:config', (nitroConfig) => {
        nitroConfig.storage ||= {}
        nitroConfig.storage.words ||= {}
        nitroConfig.storage.words.driver = 'vercel-kv'
        nitroConfig.storage.popularity ||= {}
        nitroConfig.storage.popularity.driver = 'vercel-kv'
      })
    }
  },
})
