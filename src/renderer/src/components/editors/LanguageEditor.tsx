import { useMemo } from 'react'
import { hexToText, isHexBytes, isPrintableHex, textToHex } from '../../emv/hex'
import {
  COMMON_LANGUAGES,
  ISO_639_1,
  isKnownLanguage,
  languageName,
  splitLanguages
} from '../../emv/languages'
import { t } from '../../i18n'
import { useEditor } from '../../state/context'

interface Props {
  value: string
  onChange: (hex: string) => void
}

/** EMV allows up to 4 languages in Language Preference (5F2D, an 2–8). */
const MAX_LANGUAGES = 4

export default function LanguageEditor({ value, onChange }: Props): React.JSX.Element {
  const { lang } = useEditor()
  const readable = value === '' || (isHexBytes(value) && isPrintableHex(value))
  const codes = readable ? splitLanguages(hexToText(value)) : []
  const emit = (list: string[]): void => onChange(textToHex(list.join('')))
  const move = (i: number, dir: -1 | 1): void => {
    const out = [...codes]
    ;[out[i], out[i + dir]] = [out[i + dir], out[i]]
    emit(out)
  }

  // Sorted by name in the UI language.
  const all = useMemo(
    () => [...ISO_639_1].sort((a, b) => languageName(a).localeCompare(languageName(b), lang)),
    [lang]
  )
  const available = (list: string[]): string[] => list.filter((c) => !codes.includes(c))
  const full = codes.length >= MAX_LANGUAGES

  return (
    <div className="field">
      <span className="field-label">
        {t('Lingue in ordine di preferenza (max {n})', { n: MAX_LANGUAGES })}
      </span>
      {!readable ? (
        <span className="field-error">{t('Valore non stampabile: modificalo in hex')}</span>
      ) : (
        <>
          <div className="lang-chips">
            {codes.length === 0 && (
              <span className="muted small">{t('Nessuna lingua selezionata')}</span>
            )}
            {codes.map((c, i) => (
              <span
                key={`${c}-${i}`}
                className={`lang-chip ${isKnownLanguage(c) ? '' : 'bad'}`}
                title={isKnownLanguage(c) ? '' : t('Codice non ISO 639-1')}
              >
                <span className="lang-rank">{i + 1}</span>
                <span className="mono">{c}</span>
                <span>{languageName(c)}</span>
                <button
                  className="icon-btn"
                  title={t('Sposta prima')}
                  disabled={i === 0}
                  onClick={() => move(i, -1)}
                >
                  ←
                </button>
                <button
                  className="icon-btn"
                  title={t('Sposta dopo')}
                  disabled={i === codes.length - 1}
                  onClick={() => move(i, 1)}
                >
                  →
                </button>
                <button
                  className="icon-btn danger"
                  title={t('Rimuovi')}
                  onClick={() => emit(codes.filter((_, j) => j !== i))}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="field-row">
            <select
              className="input small"
              value=""
              disabled={full}
              title={full ? t('Massimo {n} lingue', { n: MAX_LANGUAGES }) : ''}
              onChange={(e) => e.target.value && emit([...codes, e.target.value])}
            >
              <option value="">
                {full ? t('Massimo {n} lingue', { n: MAX_LANGUAGES }) : t('+ Aggiungi lingua…')}
              </option>
              <optgroup label={t('Più comuni')}>
                {available(COMMON_LANGUAGES).map((c) => (
                  <option key={c} value={c}>
                    {languageName(c)} ({c})
                  </option>
                ))}
              </optgroup>
              <optgroup label={t('Tutte (ISO 639-1)')}>
                {available(all).map((c) => (
                  <option key={c} value={c}>
                    {languageName(c)} ({c})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        </>
      )}
    </div>
  )
}
