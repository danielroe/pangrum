import { defineConfig } from 'unocss'
import transformerDirectives from '@unocss/transformer-directives'

export default defineConfig({
  transformers: [
    transformerDirectives(),
  ],
  theme: {
    colors: {
      primary: {
        DEFAULT: '#fcd34d',
        hover: '#fbbf24',
      },

      success: {
        DEFAULT: '#f59e0b',
        bg: '#b45309',
      },

      error: {
        DEFAULT: '#ef4444',
        light: '#f87171',
        bg: '#b91c1c',
      },

      celebration: {
        DEFAULT: '#22c55e',
        bg: '#15803d',
      },

      surface: {
        DEFAULT: '#333',
        hover: '#444',
        active: '#555',
      },

      progress: {
        inactive: '#4b5563',
      },
    },
  },
})
