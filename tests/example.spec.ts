import { expect, test } from '@nuxt/test-utils/playwright'

test('example e2e test', async ({ page, goto }) => {
  await goto('/', { waitUntil: 'hydration' })
  await expect(page).toHaveTitle(/Nuxt/)
})
