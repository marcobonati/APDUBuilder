import { EN } from './en'

export type Lang = 'it' | 'en'

export const LANGS: { id: Lang; label: string }[] = [
  { id: 'it', label: 'IT' },
  { id: 'en', label: 'EN' }
]

const STORAGE_KEY = 'emv-apdu-builder:lang'

let current: Lang = 'it'

export function getLang(): Lang {
  return current
}

/** Sets the language used by t(). Components re-render through the editor context. */
export function setLang(lang: Lang): void {
  current = lang
  document.documentElement.lang = lang
  window.api?.setLang(lang)
  try {
    localStorage.setItem(STORAGE_KEY, lang)
  } catch {
    // Only a preference.
  }
}

export function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'it' || saved === 'en') return saved
  } catch {
    // Fall back to the system language.
  }
  return navigator.language.toLowerCase().startsWith('it') ? 'it' : 'en'
}

const missing = new Set<string>()

/**
 * Translates an Italian source string. Italian is the reference language, so
 * the key is the Italian text itself; `{name}` placeholders are replaced with
 * params. Untranslated strings fall back to Italian.
 */
export function t(key: string, params?: Record<string, string | number>): string {
  let s = key
  if (current === 'en' && key) {
    const tr = EN[key]
    if (tr !== undefined) s = tr
    else if (import.meta.env?.DEV && !missing.has(key)) {
      missing.add(key)
      console.warn(`[i18n] traduzione mancante: ${JSON.stringify(key)}`)
    }
  }
  if (params) s = s.replace(/\{(\w+)\}/g, (m, k) => (k in params ? String(params[k]) : m))
  return s
}
