import { getLang } from '../i18n'

/** ISO 639-1 two-letter language codes (deprecated "bh" excluded). */
export const ISO_639_1 = [
  'aa', 'ab', 'ae', 'af', 'ak', 'am', 'an', 'ar', 'as', 'av', 'ay', 'az',
  'ba', 'be', 'bg', 'bi', 'bm', 'bn', 'bo', 'br', 'bs',
  'ca', 'ce', 'ch', 'co', 'cr', 'cs', 'cu', 'cv', 'cy',
  'da', 'de', 'dv', 'dz',
  'ee', 'el', 'en', 'eo', 'es', 'et', 'eu',
  'fa', 'ff', 'fi', 'fj', 'fo', 'fr', 'fy',
  'ga', 'gd', 'gl', 'gn', 'gu', 'gv',
  'ha', 'he', 'hi', 'ho', 'hr', 'ht', 'hu', 'hy', 'hz',
  'ia', 'id', 'ie', 'ig', 'ii', 'ik', 'io', 'is', 'it', 'iu',
  'ja', 'jv',
  'ka', 'kg', 'ki', 'kj', 'kk', 'kl', 'km', 'kn', 'ko', 'kr', 'ks', 'ku', 'kv', 'kw', 'ky',
  'la', 'lb', 'lg', 'li', 'ln', 'lo', 'lt', 'lu', 'lv',
  'mg', 'mh', 'mi', 'mk', 'ml', 'mn', 'mr', 'ms', 'mt', 'my',
  'na', 'nb', 'nd', 'ne', 'ng', 'nl', 'nn', 'no', 'nr', 'nv', 'ny',
  'oc', 'oj', 'om', 'or', 'os',
  'pa', 'pi', 'pl', 'ps', 'pt',
  'qu',
  'rm', 'rn', 'ro', 'ru', 'rw',
  'sa', 'sc', 'sd', 'se', 'sg', 'si', 'sk', 'sl', 'sm', 'sn', 'so', 'sq', 'sr', 'ss', 'st',
  'su', 'sv', 'sw',
  'ta', 'te', 'tg', 'th', 'ti', 'tk', 'tl', 'tn', 'to', 'tr', 'ts', 'tt', 'tw', 'ty',
  'ug', 'uk', 'ur', 'uz',
  've', 'vi', 'vo',
  'wa', 'wo',
  'xh',
  'yi', 'yo',
  'za', 'zh', 'zu'
] // prettier-ignore

/** Languages most often found on European payment cards, shown first. */
export const COMMON_LANGUAGES = ['it', 'en', 'fr', 'de', 'es', 'pt', 'nl', 'pl', 'el', 'ro']

const KNOWN = new Set(ISO_639_1)

export function isKnownLanguage(code: string): boolean {
  return KNOWN.has(code)
}

const displayNames = new Map<string, Intl.DisplayNames | null>()

/** Language name in the current UI language, e.g. "it" → "italiano" / "Italian". */
export function languageName(code: string): string {
  const ui = getLang()
  if (!displayNames.has(ui)) {
    try {
      displayNames.set(ui, new Intl.DisplayNames([ui], { type: 'language' }))
    } catch {
      displayNames.set(ui, null)
    }
  }
  try {
    const name = displayNames.get(ui)?.of(code)
    return name && name !== code ? name : code
  } catch {
    return code
  }
}

/** Splits the 5F2D text into 2-character codes (a trailing odd character is kept). */
export function splitLanguages(text: string): string[] {
  return text.match(/.{1,2}/g) ?? []
}
