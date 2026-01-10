import { defineConfig } from 'unocss'
import transformerDirectives from '@unocss/transformer-directives'

export default defineConfig({
  transformers: [
    transformerDirectives(),
  ],
  theme: {
    colors: {
      'primary': {
        DEFAULT: 'var(--color-primary)',
        hover: 'var(--color-primary-hover)',
        muted: 'var(--color-primary-muted)',
        subtle: 'var(--color-primary-subtle)',
        border: 'var(--color-primary-border)',
      },

      'success': {
        DEFAULT: 'var(--color-success)',
        bg: 'var(--color-success-bg)',
      },

      'error': {
        DEFAULT: 'var(--color-error)',
        light: 'var(--color-error-light)',
        bg: 'var(--color-error-bg)',
      },

      'celebration': {
        DEFAULT: 'var(--color-celebration)',
        bg: 'var(--color-celebration-bg)',
      },

      'surface': {
        DEFAULT: 'var(--color-surface)',
        hover: 'var(--color-surface-hover)',
        active: 'var(--color-surface-active)',
      },

      'progress': {
        inactive: 'var(--color-progress-inactive)',
      },

      // Semantic text/foreground color
      'on-surface': 'var(--color-on-surface)',

      // Muted colors for subtle UI elements
      'muted': {
        DEFAULT: 'var(--color-muted)',
        foreground: 'var(--color-muted-foreground)',
      },
    },
  },
})
