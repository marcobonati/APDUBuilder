import { useMemo, useState } from 'react'
import { DEFAULT_DOC_OPTIONS, buildDocModel, toHtml, toMarkdown } from '../docs/projectDoc'
import type { DocOptions } from '../docs/projectDoc'
import { exportDocFile } from '../docs/exportIO'
import { t } from '../i18n'
import { activeResponse } from '../state/store'
import type { Project } from '../state/store'

interface Props {
  project: Project
  onClose: () => void
  onDone: (message: string, kind?: 'ok' | 'error') => void
}

type Preview = 'html' | 'md'

export default function ExportDocDialog({ project, onClose, onDone }: Props): React.JSX.Element {
  const [options, setOptions] = useState<DocOptions>(DEFAULT_DOC_OPTIONS)
  const [preview, setPreview] = useState<Preview>('html')
  const [busy, setBusy] = useState(false)

  const model = useMemo(() => buildDocModel(project, options), [project, options])
  const html = useMemo(() => toHtml(model), [model])
  const markdown = useMemo(() => toMarkdown(model), [model])

  const set = (patch: Partial<DocOptions>): void => setOptions((o) => ({ ...o, ...patch }))
  const fileName = options.activeOnly
    ? `${project.name} - ${activeResponse(project).name}`
    : project.name

  const run = async (format: 'md' | 'pdf'): Promise<void> => {
    setBusy(true)
    try {
      const path = await exportDocFile(
        format,
        format === 'md' ? markdown : html,
        fileName || t('documentazione'),
        project.name
      )
      if (path === null) return
      onDone(
        path ? t('Documentazione esportata in {path}', { path }) : t('Documentazione esportata')
      )
      onClose()
    } catch (e) {
      onDone(`${t('Esportazione non riuscita')}: ${(e as Error).message}`, 'error')
    } finally {
      setBusy(false)
    }
  }

  const copyMarkdown = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(markdown)
      onDone(t('Markdown copiato negli appunti'))
    } catch {
      onDone(t('Impossibile copiare negli appunti'), 'error')
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal export-modal" onMouseDown={(e) => e.stopPropagation()}>
        <h2>{t('Esporta documentazione')}</h2>
        <p className="muted small">
          {t(
            'Genera un documento con tutte le APDU response del progetto: comando di riferimento, byte RAW, tabella dei campi con valori decodificati e descrizioni, label e note.'
          )}
        </p>

        <div className="export-body">
          <div className="export-options">
            <div className="field">
              <span className="field-label">{t('Contenuto')}</span>
              <label className="small">
                <input
                  type="radio"
                  checked={!options.activeOnly}
                  onChange={() => set({ activeOnly: false })}
                />{' '}
                {t('Tutte le response ({n})', { n: project.responses.length })}
              </label>
              <label className="small">
                <input
                  type="radio"
                  checked={options.activeOnly}
                  onChange={() => set({ activeOnly: true })}
                />{' '}
                {t('Solo la response attiva')}
              </label>
            </div>
            <div className="field">
              <span className="field-label">{t('Sezioni')}</span>
              <label className="small">
                <input
                  type="checkbox"
                  checked={options.includeDescriptions}
                  onChange={(e) => set({ includeDescriptions: e.target.checked })}
                />{' '}
                {t('Descrizioni dei campi')}
              </label>
              <label className="small">
                <input
                  type="checkbox"
                  checked={options.includeTlvDump}
                  onChange={(e) => set({ includeTlvDump: e.target.checked })}
                />{' '}
                {t('Struttura TLV')}
              </label>
              <label className="small">
                <input
                  type="checkbox"
                  checked={options.includeIssues}
                  onChange={(e) => set({ includeIssues: e.target.checked })}
                />{' '}
                {t('Avvisi di verifica')}
              </label>
              <label className="small">
                <input
                  type="checkbox"
                  checked={options.includeLabels}
                  onChange={(e) => set({ includeLabels: e.target.checked })}
                />{' '}
                {t('Label')}
              </label>
              <label className="small">
                <input
                  type="checkbox"
                  checked={options.includeNotes}
                  onChange={(e) => set({ includeNotes: e.target.checked })}
                />{' '}
                {t('Note sui tag')}
              </label>
            </div>
            <div className="muted small">
              {t('Il documento usa la lingua corrente dell’interfaccia.')}
            </div>
          </div>

          <div className="export-preview">
            <div className="export-tabs">
              <button
                className={preview === 'html' ? 'active' : ''}
                onClick={() => setPreview('html')}
              >
                {t('Anteprima')}
              </button>
              <button className={preview === 'md' ? 'active' : ''} onClick={() => setPreview('md')}>
                Markdown
              </button>
            </div>
            {preview === 'html' ? (
              <iframe className="export-frame" title={t('Anteprima')} srcDoc={html} sandbox="" />
            ) : (
              <pre className="export-md">{markdown}</pre>
            )}
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn" onClick={onClose}>
            {t('Chiudi')}
          </button>
          <button className="btn" onClick={copyMarkdown} disabled={busy}>
            {t('Copia Markdown')}
          </button>
          <button className="btn" onClick={() => run('md')} disabled={busy}>
            {t('Esporta Markdown…')}
          </button>
          <button className="btn primary" onClick={() => run('pdf')} disabled={busy}>
            {busy ? t('Generazione…') : t('Esporta PDF…')}
          </button>
        </div>
      </div>
    </div>
  )
}
