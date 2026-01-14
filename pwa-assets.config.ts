import type { Preset } from '@vite-pwa/assets-generator/config'
import { combinePresetAndAppleSplashScreens, defineConfig } from '@vite-pwa/assets-generator/config'

const preset: Preset = {
  transparent: {
    sizes: [64, 192, 512],
    favicons: [[48, 'favicon.ico']],
    padding: 0,
  },
  maskable: {
    sizes: [512],
    padding: 0,
  },
  apple: {
    sizes: [180],
    // logo.svg already has proper spacing
    padding: 0,
  },
}

export default defineConfig({
  headLinkOptions: {
    preset: '2023',
  },
  preset: combinePresetAndAppleSplashScreens(
    preset,
    {
      padding: 0.3,
      resizeOptions: { background: '#fafaf9', fit: 'contain' },
      darkResizeOptions: { background: '#0f0f0f', fit: 'contain' },
      linkMediaOptions: {
        log: true,
        addMediaScreen: true,
        basePath: '/',
        xhtml: false,
      },
      png: {
        compressionLevel: 9,
        quality: 60,
      },
    },
  ),
  images: ['public/logo.svg'],
})
