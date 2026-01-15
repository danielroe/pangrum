import { defineConfig, presetIcons, presetWind4 } from 'unocss'
import transformerDirectives from '@unocss/transformer-directives'

export default defineConfig({
  presets: [
    presetWind4(),
    presetIcons({
      scale: 1.2,
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
    }),
  ],
  transformers: [
    transformerDirectives(),
  ],
  variants: [
    {
      name: 'landscape',
      match(matcher) {
        if (!matcher.startsWith('ls:'))
          return
        return {
          matcher: matcher.slice(3),
          handle: (input, next) => next({
            ...input,
            parent: `${input.parent ? `${input.parent} $$ ` : ''}@media (orientation: landscape) and (max-height: 500px) and (min-width: 500px)`,
            parentOrder: 4000,
          }),
        }
      },
    },
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
        on: 'var(--color-on-primary)',
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

      // Semantic text/foreground colors
      'on-surface': 'var(--color-on-surface)',
      'on-primary': 'var(--color-on-primary)',

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
