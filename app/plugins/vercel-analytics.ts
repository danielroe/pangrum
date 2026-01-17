export default defineNuxtPlugin({
  enforce: 'pre',
  env: { islands: false },
  setup() {
    if (import.meta.server || import.meta.test || import.meta.dev) {
      return
    }

    window.va = function (...params: unknown[]) {
      (window.vaq = window.vaq || []).push(params)
    }

    useScript({
      'src': '/_vercel/insights/script.js',
      // (as we only have one route)
      'data-disable-auto-track': '1',
    })
  },
})

declare global {
  interface Window {
    va?: (...args: unknown[]) => void
    vaq?: unknown[][]
  }
}
