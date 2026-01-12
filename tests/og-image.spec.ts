import { expect, test } from '@nuxt/test-utils/playwright'

test.describe('OG Image', () => {
  test('renders correctly and matches snapshot', async ({ page, goto, baseURL }) => {
    await goto('/', { waitUntil: 'domcontentloaded' })

    const ogImageUrl = await page.locator('meta[property="og:image"]').getAttribute('content')
    expect(ogImageUrl).toBeTruthy()

    const ogImagePath = new URL(ogImageUrl!).pathname
    const localUrl = baseURL?.endsWith('/') ? `${baseURL}${ogImagePath.slice(1)}` : `${baseURL}${ogImagePath}`
    const response = await page.request.get(localUrl)

    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toContain('image/png')

    const imageBuffer = await response.body()
    expect(imageBuffer).toMatchSnapshot('og-image.png')
  })
})
