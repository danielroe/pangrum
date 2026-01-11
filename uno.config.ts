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
        glow: 'var(--color-primary-glow)',
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
        elevated: 'var(--color-surface-elevated)',
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

      // Letter colors for word input
      'letter': {
        centre: 'var(--color-letter-centre)',
        valid: 'var(--color-letter-valid)',
        invalid: 'var(--color-letter-invalid)',
      },
    },
  },
  shortcuts: {
    'glow-primary': 'shadow-[0_0_20px_var(--color-primary-glow)]',
    'glow-primary-sm': 'shadow-[0_0_10px_var(--color-primary-glow)]',
    'glow-primary-lg': 'shadow-[0_0_30px_var(--color-primary-glow)]',
  },
})
