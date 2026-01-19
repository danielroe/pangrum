export const LANGUAGE_CODES = ['en', 'en-gb', 'de', 'nl', 'fr', 'es'] as const

export type LanguageCode = typeof LANGUAGE_CODES[number]

export const LANGUAGES: Record<LanguageCode, { locale: string, alphabet: string }> = {
  'en': {
    locale: 'en-US',
    alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  },
  'en-gb': {
    locale: 'en-GB',
    alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  },
  'de': {
    locale: 'de-DE',
    alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜẞ',
  },
  'nl': {
    locale: 'nl',
    alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  },
  'fr': {
    locale: 'fr',
    alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZÀÂÆÇÉÈÊËÎÏÔŒÙÛÜŸ',
  },
  'es': {
    locale: 'es',
    alphabet: 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZÁÉÍÓÚÜ',
  },
}
