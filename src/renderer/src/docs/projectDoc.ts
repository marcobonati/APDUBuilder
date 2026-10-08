import { describeValue } from '../emv/formats'
import { splitBytes } from '../emv/hex'
import { describeSw, tagDef } from '../emv/tags'
import { TEMPLATES } from '../emv/templates'
import { encodeLength, encodeNodes, hasChildren, isOmitted, valueHex } from '../emv/tlv'
import type { TlvNode } from '../emv/types'
import { validate } from '../emv/validate'
import type { Issue } from '../emv/validate'
import { getLang, t } from '../i18n'
import type { LabelDef, Project, ResponseDoc } from '../state/store'
import { demoteHeadings, renderMarkdown } from './markdown'

// ---------------- Model ----------------

export interface DocOptions {
  /** Only the active response instead of the whole project. */
  activeOnly: boolean
  includeDescriptions: boolean
  includeTlvDump: boolean
  includeIssues: boolean
  includeLabels: boolean
  includeNotes: boolean
}

export const DEFAULT_DOC_OPTIONS: DocOptions = {
  activeOnly: false,
  includeDescriptions: true,
  includeTlvDump: true,
  includeIssues: true,
  includeLabels: true,
  includeNotes: true
}

interface DocField {
  depth: number
  /** Hex tag, '' for raw data. */
  tag: string
  name: string
  /** Encoded length field, '' when the field has no length (format 1 / raw). */
  lengthHex: string
  length: number
  /** Value of primitive fields, '' for templates. */
  value: string
  decoded: string
  description: string
  hint: string
  required: boolean
  template: boolean
  forcedLength: boolean
  labels: LabelDef[]
  /** Markdown note, '' when absent. */
  note: string
}

interface DocResponse {
  name: string
  templateName: string
  templateDescription: string
  command: { name: string; apdu: string; note: string } | null
  sw: string
  swDescription: string
  dataLength: number
  /** Data followed by the status word. */
  hex: string
  fields: DocField[]
  /** Fields with a note, in tree order. */
  notes: DocField[]
  dump: string
  issues: Issue[]
}

interface DocModel {
  title: string
  generatedAt: string
  responses: DocResponse[]
  /** Labels used in the exported responses, with the tags they are applied to. */
  labels: { label: LabelDef; tags: { tag: string; name: string }[] }[]
  options: DocOptions
}

function collectFields(
  nodes: TlvNode[],
  depth: number,
  format1: boolean,
  labels: LabelDef[],
  out: DocField[]
): void {
  for (const n of nodes) {
    if (!format1 && isOmitted(n)) continue
    const def = tagDef(n.tag)
    const v = valueHex(n)
    const template = !n.raw && hasChildren(n)
    out.push({
      depth,
      tag: n.raw ? '' : n.tag,
      name: n.raw ? t('Dati raw (senza tag)') : def.name,
      lengthHex: n.raw || format1 ? '' : (n.lengthOverride ?? encodeLength(v.length / 2)),
      length: v.length / 2,
      value: template ? '' : v,
      decoded: template ? '' : describeValue(def, v),
      description: n.raw ? '' : t(def.desc),
      hint: n.hint ? t(n.hint) : '',
      required: !!n.required,
      template,
      forcedLength: !!n.lengthOverride,
      labels: n.labels?.length ? labels.filter((l) => n.labels!.includes(l.id)) : [],
      note: n.note?.trim() ?? ''
    })
    if (template) collectFields(n.children, depth + 1, !!n.concat, labels, out)
  }
}

function tlvDump(nodes: TlvNode[], depth = 0, format1 = false): string[] {
  const out: string[] = []
  const pad = '  '.repeat(depth)
  for (const n of nodes) {
    if (!format1 && isOmitted(n)) continue
    const v = valueHex(n)
    if (n.raw) {
      out.push(`${pad}[RAW] ${splitBytes(v).join(' ')}`)
      continue
    }
    const head = format1
      ? `${pad}(${n.tag})`
      : `${pad}${n.tag} ${n.lengthOverride ?? encodeLength(v.length / 2)}`
    out.push(`${head}  ${tagDef(n.tag).name}`)
    if (hasChildren(n)) out.push(...tlvDump(n.children, depth + 1, n.concat))
    else if (v) out.push(`${pad}   ${splitBytes(v).join(' ')}`)
  }
  return out
}

function buildResponse(r: ResponseDoc, labels: LabelDef[]): DocResponse {
  const tpl = TEMPLATES.find((x) => x.id === r.templateId)
  const enc = encodeNodes(r.nodes)
  const fields: DocField[] = []
  collectFields(r.nodes, 0, false, labels, fields)
  const swValid = /^[0-9A-F]{4}$/.test(r.sw)
  return {
    name: r.name,
    templateName: tpl ? t(tpl.name) : t('Response importata'),
    templateDescription: tpl ? t(tpl.description) : '',
    command:
      tpl && tpl.command.apdu
        ? {
            name: t(tpl.command.name),
            apdu: tpl.command.apdu,
            note: tpl.command.note ? t(tpl.command.note) : ''
          }
        : null,
    sw: r.sw,
    swDescription: swValid ? describeSw(r.sw) : '',
    dataLength: enc.hex.length / 2,
    hex: enc.hex + (swValid ? r.sw : ''),
    fields,
    notes: fields.filter((f) => f.note),
    dump: tlvDump(r.nodes).join('\n'),
    issues: validate(r.nodes, r.sw, enc.hex.length / 2).filter((i) => i.level !== 'info')
  }
}

export function buildDocModel(project: Project, options: DocOptions): DocModel {
  const responses = options.activeOnly
    ? project.responses.filter((r) => r.id === project.activeId)
    : project.responses
  const docs = responses.map((r) => buildResponse(r, project.labels))
  const labels = project.labels
    .map((label) => {
      const tags = new Map<string, string>()
      for (const r of docs) {
        for (const f of r.fields) {
          if (f.labels.includes(label)) tags.set(f.tag || 'RAW', f.name)
        }
      }
      return { label, tags: [...tags].map(([tag, name]) => ({ tag, name })) }
    })
    .filter((l) => l.tags.length)
  return {
    title: project.name,
    generatedAt: new Date().toLocaleString(getLang() === 'it' ? 'it-IT' : 'en-GB'),
    responses: docs,
    labels,
    options
  }
}

/** Values longer than this are shortened in the field table (the full value is in the RAW block). */
const MAX_TABLE_BYTES = 48

function shortValue(hex: string): string {
  const bytes = hex.length / 2
  if (bytes <= MAX_TABLE_BYTES) return splitBytes(hex).join(' ')
  return `${splitBytes(hex.substr(0, MAX_TABLE_BYTES * 2)).join(' ')} … (${t('{n} byte', { n: bytes })})`
}

function wrapHex(hex: string, perLine = 16): string {
  const bytes = splitBytes(hex)
  const lines: string[] = []
  for (let i = 0; i < bytes.length; i += perLine) lines.push(bytes.slice(i, i + perLine).join(' '))
  return lines.join('\n')
}

function anchor(i: number): string {
  return `response-${i + 1}`
}

function noteAnchor(i: number, k: number): string {
  return `note-${i + 1}-${k + 1}`
}

// ---------------- Markdown ----------------

/** Escapes text placed in a Markdown table cell. */
function mdCell(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>')
}

export function toMarkdown(m: DocModel): string {
  const o = m.options
  const L: string[] = []
  L.push(`# ${m.title}`, '')
  L.push(
    `${t('Documentazione APDU response generata da EMV APDU Builder il {date}.', { date: m.generatedAt })}`,
    ''
  )
  if (m.responses.length > 1) {
    L.push(`## ${t('Indice')}`, '')
    m.responses.forEach((r, i) => L.push(`${i + 1}. [${r.name}](#${anchor(i)})`))
    L.push('')
  }
  if (o.includeLabels && m.labels.length) {
    L.push(`## ${t('Label')}`, '')
    L.push(`| ${t('Label')} | ${t('Tag')} |`, '|---|---|')
    for (const { label, tags } of m.labels) {
      L.push(
        `| \`${mdCell(label.name)}\` | ${tags
          .map((x) => `\`${x.tag}\` ${mdCell(x.name)}`)
          .join('<br>')} |`
      )
    }
    L.push('')
  }

  m.responses.forEach((r, i) => {
    L.push(`<a id="${anchor(i)}"></a>`, '')
    L.push(`## ${i + 1}. ${r.name}`, '')
    L.push(`| | |`, `|---|---|`)
    L.push(`| ${t('Template')} | ${mdCell(r.templateName)} |`)
    if (r.command) {
      L.push(
        `| ${t('Comando di riferimento')} | ${mdCell(r.command.name)} — \`${r.command.apdu}\`${
          r.command.note ? ` (${mdCell(r.command.note)})` : ''
        } |`
      )
    }
    L.push(`| ${t('Status Word')} | \`${r.sw}\` — ${mdCell(r.swDescription)} |`)
    L.push(`| ${t('Lunghezza dati')} | ${t('{n} byte', { n: r.dataLength })} |`, '')
    if (r.templateDescription) L.push(`> ${r.templateDescription}`, '')

    L.push(`### ${t('Risposta RAW')}`, '', '```', wrapHex(r.hex) || '—', '```', '')

    if (r.fields.length) {
      L.push(`### ${t('Campi')}`, '')
      L.push(
        `| ${t('Tag')} | ${t('Nome')} | ${t('L')} | ${t('Valore')} | ${
          o.includeDescriptions ? t('Significato e descrizione') : t('Significato')
        } |`
      )
      L.push('|---|---|---|---|---|')
      for (const f of r.fields) {
        const indent = '&nbsp;&nbsp;&nbsp;&nbsp;'.repeat(f.depth) + (f.depth ? '↳ ' : '')
        const chips =
          o.includeLabels && f.labels.length
            ? ' ' + f.labels.map((l) => `\`${mdCell(l.name)}\``).join(' ')
            : ''
        const k = r.notes.indexOf(f)
        const noteLink = o.includeNotes && k >= 0 ? ` [📝](#${noteAnchor(i, k)})` : ''
        const name = `${indent}${mdCell(f.name)}${f.required ? ' *' : ''}${chips}${noteLink}`
        const len = f.lengthHex
          ? `${f.lengthHex}${f.forcedLength ? ' ⚠' : ''} (${f.length})`
          : `${f.length}`
        const value = f.template ? '' : f.value ? `\`${shortValue(f.value)}\`` : '—'
        const meaning = [
          f.decoded ? `**${mdCell(f.decoded)}**` : '',
          o.includeDescriptions ? mdCell(f.description) : '',
          o.includeDescriptions && f.hint ? `_${mdCell(f.hint)}_` : ''
        ]
          .filter(Boolean)
          .join('<br>')
        L.push(`| ${f.tag ? `\`${f.tag}\`` : 'RAW'} | ${name} | ${len} | ${value} | ${meaning} |`)
      }
      L.push('', `\\* ${t('campo obbligatorio nel template')}`, '')
    }

    if (o.includeNotes && r.notes.length) {
      L.push(`### ${t('Note')}`, '')
      r.notes.forEach((f, k) => {
        L.push(`<a id="${noteAnchor(i, k)}"></a>`, '')
        L.push(`#### ${f.tag ? `\`${f.tag}\` ` : ''}${f.name}`, '')
        if (o.includeLabels && f.labels.length) {
          L.push(f.labels.map((l) => `\`${l.name}\``).join(' '), '')
        }
        L.push(demoteHeadings(f.note, 4), '')
      })
    }

    if (o.includeTlvDump && r.dump) {
      L.push(`### ${t('Struttura TLV')}`, '', '```', r.dump, '```', '')
    }
    if (o.includeIssues && r.issues.length) {
      L.push(`### ${t('Verifica')}`, '')
      for (const is of r.issues) {
        L.push(`- ${is.level === 'error' ? '❌' : '⚠️'} ${is.message}`)
      }
      L.push('')
    }
  })
  return L.join('\n')
}

// ---------------- HTML (preview and PDF) ----------------

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const CSS = `
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1b1f27;
    font-size: 10.5pt; line-height: 1.45; margin: 0; padding: 24px 28px; background: #fff; }
  h1 { font-size: 20pt; margin: 0 0 4px; }
  h2 { font-size: 14pt; margin: 0 0 10px; padding-bottom: 4px; border-bottom: 2px solid #2f66e6; }
  h3 { font-size: 11pt; margin: 16px 0 6px; color: #2455c9; }
  .meta { color: #545c6b; margin-bottom: 18px; }
  .toc { margin: 0 0 8px; padding-left: 20px; }
  .toc a { color: #2455c9; text-decoration: none; }
  section.response { break-before: page; page-break-before: always; }
  section.response.first { break-before: auto; page-break-before: auto; }
  table { border-collapse: collapse; width: 100%; margin: 4px 0 8px; }
  th, td { border: 1px solid #dde1e8; padding: 4px 6px; text-align: left; vertical-align: top; }
  th { background: #f0f2f6; font-weight: 600; font-size: 9.5pt; }
  tr { break-inside: avoid; page-break-inside: avoid; }
  table.info td:first-child { width: 170px; color: #545c6b; }
  .fields { table-layout: fixed; }
  .fields th:nth-child(1) { width: 52px; }
  .fields th:nth-child(2) { width: 24%; }
  .fields th:nth-child(3) { width: 58px; }
  .fields th:nth-child(4) { width: 25%; }
  .fields td { font-size: 9.5pt; overflow-wrap: anywhere; }
  .fields td.tag { white-space: nowrap; }
  .fields tr.tpl td { background: #f7f8fb; font-weight: 600; }
  code, pre, .mono { font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace; }
  td code, td.mono { font-size: 9pt; word-break: break-all; }
  pre { background: #f4f5f8; border: 1px solid #dde1e8; border-radius: 6px; padding: 8px 10px;
    font-size: 9pt; white-space: pre-wrap; word-break: break-all; margin: 4px 0 8px; }
  blockquote { margin: 6px 0 10px; padding: 4px 10px; border-left: 3px solid #c9ced8; color: #545c6b; }
  .tag { color: #1e64c8; font-weight: 600; }
  .decoded { font-weight: 600; color: #128a4a; }
  .desc { color: #545c6b; }
  .hint { color: #8a6100; font-style: italic; }
  .req { color: #b07a00; }
  .forced { color: #d43c3c; }
  ul.issues { margin: 4px 0; padding-left: 18px; }
  ul.issues li.error { color: #d43c3c; }
  ul.issues li.warning { color: #8a6100; }
  .note { color: #8a91a0; font-size: 9pt; }
  .lbl { display: inline-block; font-size: 8pt; font-weight: 600; line-height: 1.5; padding: 0 6px;
    margin: 1px 0 1px 4px; border-radius: 8px; border: 1px solid var(--lc);
    color: var(--lc); background: color-mix(in srgb, var(--lc) 12%, #fff); white-space: nowrap; }
  .lbl:first-child { margin-left: 0; }
  .note-link { text-decoration: none; margin-left: 4px; }
  table.labels td:first-child { width: 160px; }
  .tag-note { margin: 10px 0 14px; padding: 6px 12px 4px; border-left: 3px solid #2f66e6;
    background: #f8f9fc; break-inside: avoid-page; }
  .tag-note h4 { margin: 0 0 4px; font-size: 10.5pt; }
  .md > :first-child { margin-top: 0; }
  .md p, .md ul, .md ol, .md table, .md pre, .md blockquote { margin: 4px 0 6px; }
  .md ul, .md ol { padding-left: 20px; }
  .md h1, .md h2, .md h3, .md h4, .md h5, .md h6 { font-size: 10.5pt; margin: 8px 0 4px;
    padding: 0; border: none; color: #1b1f27; }
  .md h1, .md h2 { font-size: 11.5pt; }
  .md code { background: #eef0f4; border-radius: 3px; padding: 0 3px; font-size: 9pt; }
  .md pre code { background: none; padding: 0; }
  .md a { color: #2455c9; }
  .md hr { border: none; border-top: 1px solid #dde1e8; }
`

function htmlLabels(labels: LabelDef[]): string {
  return labels
    .map((l) => `<span class="lbl" style="--lc:${esc(l.color)}">${esc(l.name)}</span>`)
    .join('')
}

export function toHtml(m: DocModel): string {
  const o = m.options
  const H: string[] = []
  H.push(
    `<!doctype html><html lang="${getLang()}"><head><meta charset="utf-8"><title>${esc(
      m.title
    )}</title><style>${CSS}</style></head><body>`
  )
  H.push(`<h1>${esc(m.title)}</h1>`)
  H.push(
    `<div class="meta">${esc(
      t('Documentazione APDU response generata da EMV APDU Builder il {date}.', {
        date: m.generatedAt
      })
    )}</div>`
  )
  if (m.responses.length > 1) {
    H.push(`<h3>${esc(t('Indice'))}</h3><ol class="toc">`)
    m.responses.forEach((r, i) => H.push(`<li><a href="#${anchor(i)}">${esc(r.name)}</a></li>`))
    H.push('</ol>')
  }
  if (o.includeLabels && m.labels.length) {
    H.push(`<h3>${esc(t('Label'))}</h3><table class="labels"><tbody>`)
    for (const { label, tags } of m.labels) {
      H.push(
        `<tr><td>${htmlLabels([label])}</td><td>${tags
          .map((x) => `<span class="mono tag">${esc(x.tag)}</span> ${esc(x.name)}`)
          .join('<br>')}</td></tr>`
      )
    }
    H.push('</tbody></table>')
  }

  m.responses.forEach((r, i) => {
    const first = i === 0 && m.responses.length === 1
    H.push(`<section class="response ${first ? 'first' : ''}" id="${anchor(i)}">`)
    H.push(`<h2>${i + 1}. ${esc(r.name)}</h2>`)
    H.push('<table class="info">')
    H.push(`<tr><td>${esc(t('Template'))}</td><td>${esc(r.templateName)}</td></tr>`)
    if (r.command) {
      H.push(
        `<tr><td>${esc(t('Comando di riferimento'))}</td><td>${esc(r.command.name)} — <code>${
          r.command.apdu
        }</code>${r.command.note ? ` <span class="note">(${esc(r.command.note)})</span>` : ''}</td></tr>`
      )
    }
    H.push(
      `<tr><td>${esc(t('Status Word'))}</td><td><code>${esc(r.sw)}</code> — ${esc(
        r.swDescription
      )}</td></tr>`
    )
    H.push(
      `<tr><td>${esc(t('Lunghezza dati'))}</td><td>${esc(t('{n} byte', { n: r.dataLength }))}</td></tr>`
    )
    H.push('</table>')
    if (r.templateDescription) H.push(`<blockquote>${esc(r.templateDescription)}</blockquote>`)

    H.push(`<h3>${esc(t('Risposta RAW'))}</h3><pre>${esc(wrapHex(r.hex) || '—')}</pre>`)

    if (r.fields.length) {
      H.push(`<h3>${esc(t('Campi'))}</h3><table class="fields"><thead><tr>`)
      H.push(
        `<th>${esc(t('Tag'))}</th><th>${esc(t('Nome'))}</th><th>${esc(t('L'))}</th><th>${esc(
          t('Valore')
        )}</th><th>${esc(o.includeDescriptions ? t('Significato e descrizione') : t('Significato'))}</th>`
      )
      H.push('</tr></thead><tbody>')
      for (const f of r.fields) {
        const pad = f.depth * 14
        const k = r.notes.indexOf(f)
        const extra =
          (o.includeLabels && f.labels.length ? ` ${htmlLabels(f.labels)}` : '') +
          (o.includeNotes && k >= 0
            ? ` <a class="note-link" href="#${noteAnchor(i, k)}" title="${esc(t('Nota'))}">📝</a>`
            : '')
        const len = f.lengthHex
          ? `<span class="mono${f.forcedLength ? ' forced' : ''}">${f.lengthHex}</span> (${f.length})`
          : `${f.length}`
        const meaning = [
          f.decoded ? `<div class="decoded">${esc(f.decoded)}</div>` : '',
          o.includeDescriptions && f.description
            ? `<div class="desc">${esc(f.description)}</div>`
            : '',
          o.includeDescriptions && f.hint ? `<div class="hint">${esc(f.hint)}</div>` : ''
        ].join('')
        H.push(
          `<tr class="${f.template ? 'tpl' : ''}"><td class="mono tag">${f.tag || 'RAW'}</td>` +
            `<td style="padding-left:${6 + pad}px">${f.depth ? '↳ ' : ''}${esc(f.name)}${
              f.required ? ' <span class="req">*</span>' : ''
            }${extra}</td>` +
            `<td>${len}</td>` +
            `<td class="mono">${f.template ? '' : f.value ? esc(shortValue(f.value)) : '—'}</td>` +
            `<td>${meaning}</td></tr>`
        )
      }
      H.push(
        `</tbody></table><div class="note">* ${esc(t('campo obbligatorio nel template'))}</div>`
      )
    }

    if (o.includeNotes && r.notes.length) {
      H.push(`<h3>${esc(t('Note'))}</h3>`)
      r.notes.forEach((f, k) => {
        H.push(
          `<div class="tag-note" id="${noteAnchor(i, k)}"><h4>${
            f.tag ? `<span class="mono tag">${esc(f.tag)}</span> ` : ''
          }${esc(f.name)}${o.includeLabels ? ` ${htmlLabels(f.labels)}` : ''}</h4>` +
            `<div class="md">${renderMarkdown(f.note)}</div></div>`
        )
      })
    }

    if (o.includeTlvDump && r.dump) {
      H.push(`<h3>${esc(t('Struttura TLV'))}</h3><pre>${esc(r.dump)}</pre>`)
    }
    if (o.includeIssues && r.issues.length) {
      H.push(`<h3>${esc(t('Verifica'))}</h3><ul class="issues">`)
      for (const is of r.issues) H.push(`<li class="${is.level}">${esc(is.message)}</li>`)
      H.push('</ul>')
    }
    H.push('</section>')
  })
  H.push('</body></html>')
  return H.join('\n')
}
