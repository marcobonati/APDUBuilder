import { valueIssues } from './formats'
import { hasChildren, isConstructedTag, tagError, valueHex } from './tlv'
import { tagDef } from './tags'
import type { TlvNode } from './types'
import { isHexBytes } from './hex'
import { t } from '../i18n'

export type IssueLevel = 'error' | 'warning' | 'info'

export interface Issue {
  nodeId: string | null
  level: IssueLevel
  message: string
}

export interface Progress {
  /** Required fields with a value / all required fields. */
  filled: number
  total: number
  optionalFilled: number
}

export function validate(nodes: TlvNode[], sw: string, totalBytes: number): Issue[] {
  const issues: Issue[] = []

  function walk(list: TlvNode[], parent: TlvNode | null): void {
    const seen = new Map<string, number>()
    for (const n of list) {
      const add = (level: IssueLevel, message: string): void => {
        issues.push({ nodeId: n.id, level, message })
      }
      if (n.raw) {
        if (!isHexBytes(n.value))
          add('error', t('Dati raw non esadecimali o con numero dispari di cifre'))
        else if (!n.value && n.required) add('warning', t('Dati obbligatori vuoti'))
        continue
      }
      const tErr = tagError(n.tag)
      if (tErr) {
        add('error', `Tag ${n.tag || '?'}: ${tErr}`)
        continue
      }
      const def = tagDef(n.tag)
      const label = `${n.tag} ${def.name}`

      seen.set(n.tag, (seen.get(n.tag) ?? 0) + 1)
      if (seen.get(n.tag) === 2 && !def.repeatable)
        add('warning', `${label}: ${t('tag duplicato nello stesso template')}`)

      if (parent && !parent.concat) {
        const allowed = tagDef(parent.tag).children
        if (allowed && !allowed.includes(n.tag)) {
          add(
            'info',
            t("{tag} non è tipico all'interno di {parent}", { tag: n.tag, parent: parent.tag })
          )
        }
      }
      if (def.source === 'terminal')
        add('info', `${label}: ${t('è un dato del terminale, non della carta')}`)

      if (hasChildren(n)) {
        if (n.children.length === 0 && n.required)
          add('warning', `${label}: ${t('template vuoto')}`)
        if (n.concat) {
          for (const c of n.children) {
            const cdef = tagDef(c.tag)
            if (!c.value && c.required) {
              issues.push({
                nodeId: c.id,
                level: 'warning',
                message: `${c.tag} ${cdef.name}: ${t('campo obbligatorio vuoto')}`
              })
            }
            for (const m of valueIssues(cdef, c.value)) {
              issues.push({
                nodeId: c.id,
                level: isHexBytes(c.value) ? 'warning' : 'error',
                message: `${c.tag}: ${m}`
              })
            }
          }
        } else {
          walk(n.children, n)
        }
      } else {
        if (!n.value && n.required) add('warning', `${label}: ${t('campo obbligatorio vuoto')}`)
        for (const m of valueIssues(def, n.value)) {
          add(isHexBytes(n.value) ? 'warning' : 'error', `${n.tag}: ${m}`)
        }
      }

      if (n.lengthOverride) {
        if (!isHexBytes(n.lengthOverride))
          add('error', `${n.tag}: ${t('lunghezza forzata non esadecimale')}`)
        else {
          const actual = valueHex(n).length / 2
          add(
            'info',
            `${n.tag}: ${t('lunghezza forzata a {forced} (reale {actual} byte)', { forced: n.lengthOverride, actual })}`
          )
        }
      }
      if (isConstructedTag(n.tag) && n.concat)
        add('error', `${n.tag}: ${t('tag costruito usato come formato 1')}`)
    }
  }

  walk(nodes, null)

  if (!/^[0-9A-F]{4}$/.test(sw))
    issues.push({
      nodeId: null,
      level: 'error',
      message: t('Status word non valida')
    })
  else if (sw !== '9000' && !sw.startsWith('61') && !sw.startsWith('62') && nodes.length > 0) {
    issues.push({
      nodeId: null,
      level: 'info',
      message: t('Con SW {sw} la carta normalmente non restituisce dati', { sw })
    })
  }
  if (totalBytes > 256) {
    issues.push({
      nodeId: null,
      level: 'warning',
      message: t('I dati superano 256 byte ({n}): servono extended length o GET RESPONSE', {
        n: totalBytes
      })
    })
  }
  return issues
}

/** Counts filled primitive fields, for the progress indicator. */
export function progress(nodes: TlvNode[]): Progress {
  const p: Progress = { filled: 0, total: 0, optionalFilled: 0 }
  const walk = (list: TlvNode[]): void => {
    for (const n of list) {
      if (!n.raw && hasChildren(n)) walk(n.children)
      else if (n.required) {
        p.total++
        if (n.value) p.filled++
      } else if (n.value) p.optionalFilled++
    }
  }
  walk(nodes)
  return p
}
