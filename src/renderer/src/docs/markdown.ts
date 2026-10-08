/**
 * Small Markdown renderer for user notes: headings, paragraphs, emphasis,
 * inline code, fenced code, lists (nested by indentation), blockquotes,
 * tables, links and rules. The source is HTML-escaped before any markup is
 * produced, so notes can never inject HTML into the app or the exported
 * documentation.
 */

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const SAFE_URL = /^(https?:|mailto:)/i

function inline(src: string): string {
  // Code spans are set aside first so their content is not formatted.
  const codes: string[] = []
  let s = src.replace(/`([^`]+)`/g, (_, c: string) => {
    codes.push(`<code>${esc(c)}</code>`)
    return `\u0000${codes.length - 1}\u0000`
  })
  s = esc(s)
  s = s.replace(/\[([^\]]+)\]\(((?:[^()\s]|\([^()\s]*\))+)\)/g, (_, text: string, url: string) => {
    // The URL was escaped with the rest of the text: undo &amp; before checking it.
    const href = url.replace(/&amp;/g, '&')
    if (!SAFE_URL.test(href)) return text
    return `<a href="${esc(href)}" target="_blank" rel="noopener noreferrer">${text}</a>`
  })
  s = s
    .replace(/\*\*(?=\S)(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(?=\S)(.+?)__/g, '<strong>$1</strong>')
    .replace(/~~(?=\S)(.+?)~~/g, '<del>$1</del>')
    .replace(/(^|[^*\w])\*(?=\S)([^*]+?)\*(?!\w)/g, '$1<em>$2</em>')
    .replace(/(^|[^_\w])_(?=\S)([^_]+?)_(?!\w)/g, '$1<em>$2</em>')
  // eslint-disable-next-line no-control-regex
  return s.replace(/\u0000(\d+)\u0000/g, (_, i: string) => codes[Number(i)])
}

const FENCE = /^\s*(```|~~~)/
const HEADING = /^(#{1,6})\s+(.*?)\s*#*\s*$/
const RULE = /^\s*([-*_])(\s*\1){2,}\s*$/
const QUOTE = /^\s*>\s?/
const ITEM = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/
const TABLE_SEP = /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/

function indentOf(line: string): number {
  return line.match(/^\s*/)![0].replace(/\t/g, '    ').length
}

function splitRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split(/(?<!\\)\|/)
    .map((c) => c.trim().replace(/\\\|/g, '|'))
}

function isBlockStart(line: string): boolean {
  return (
    FENCE.test(line) || HEADING.test(line) || RULE.test(line) || QUOTE.test(line) || ITEM.test(line)
  )
}

function renderList(lines: string[], start: number): { html: string; next: number } {
  const first = lines[start].match(ITEM)!
  const base = first[1].replace(/\t/g, '    ').length
  const ordered = /\d/.test(first[2])
  const items: string[] = []
  let i = start
  while (i < lines.length) {
    const m = lines[i].match(ITEM)
    if (!m || indentOf(lines[i]) !== base || /\d/.test(m[2]) !== ordered) break
    // Item text plus continuation lines and nested blocks (more indented).
    const body: string[] = [m[3]]
    i++
    while (i < lines.length) {
      const l = lines[i]
      if (!l.trim()) {
        if (i + 1 < lines.length && lines[i + 1].trim() && indentOf(lines[i + 1]) > base) {
          body.push('')
          i++
          continue
        }
        break
      }
      if (indentOf(l) <= base && (ITEM.test(l) || isBlockStart(l))) break
      body.push(indentOf(l) > base ? l.slice(Math.min(indentOf(l), base + 2)) : l.trim())
      i++
    }
    const nested = body.slice(1).some((l) => isBlockStart(l) || !l.trim())
    items.push(
      nested
        ? `<li>${inline(body[0])}${renderBlocks(body.slice(1))}</li>`
        : `<li>${inline(body.join(' '))}</li>`
    )
  }
  const tag = ordered ? 'ol' : 'ul'
  const num = ordered ? parseInt(first[2], 10) : 1
  const attr = ordered && num !== 1 ? ` start="${num}"` : ''
  return { html: `<${tag}${attr}>${items.join('')}</${tag}>`, next: i }
}

function renderBlocks(lines: string[]): string {
  const out: string[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (!line.trim()) {
      i++
      continue
    }
    const fence = line.match(FENCE)
    if (fence) {
      const code: string[] = []
      i++
      while (i < lines.length && !lines[i].trim().startsWith(fence[1])) code.push(lines[i++])
      i++
      out.push(`<pre><code>${esc(code.join('\n'))}</code></pre>`)
      continue
    }
    const h = line.match(HEADING)
    if (h) {
      out.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`)
      i++
      continue
    }
    if (RULE.test(line)) {
      out.push('<hr>')
      i++
      continue
    }
    if (QUOTE.test(line)) {
      const quote: string[] = []
      while (i < lines.length && QUOTE.test(lines[i])) quote.push(lines[i++].replace(QUOTE, ''))
      out.push(`<blockquote>${renderBlocks(quote)}</blockquote>`)
      continue
    }
    if (ITEM.test(line)) {
      const list = renderList(lines, i)
      out.push(list.html)
      i = list.next
      continue
    }
    if (line.includes('|') && i + 1 < lines.length && TABLE_SEP.test(lines[i + 1])) {
      const head = splitRow(line)
      const align = splitRow(lines[i + 1]).map((c) =>
        c.startsWith(':') && c.endsWith(':') ? 'center' : c.endsWith(':') ? 'right' : ''
      )
      const cell = (tag: string, c: string, k: number): string =>
        `<${tag}${align[k] ? ` style="text-align:${align[k]}"` : ''}>${inline(c)}</${tag}>`
      i += 2
      const rows: string[] = []
      while (i < lines.length && lines[i].trim() && lines[i].includes('|')) {
        const cells = splitRow(lines[i++])
        rows.push(`<tr>${head.map((_, k) => cell('td', cells[k] ?? '', k)).join('')}</tr>`)
      }
      out.push(
        `<table><thead><tr>${head.map((c, k) => cell('th', c, k)).join('')}</tr></thead>` +
          `<tbody>${rows.join('')}</tbody></table>`
      )
      continue
    }
    const para: string[] = []
    while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) {
      para.push(lines[i++].trimStart())
    }
    // Two trailing spaces (or a backslash) force a line break, as in CommonMark.
    const text = para
      .map((l, k) => {
        if (k === para.length - 1 || !/( {2}|\\)$/.test(l)) return l.trimEnd()
        return l.replace(/\\$/, '').trimEnd() + '\n'
      })
      .join(' ')
    out.push(`<p>${inline(text).replace(/\n /g, '<br>')}</p>`)
  }
  return out.join('\n')
}

/** Renders Markdown to safe HTML. */
export function renderMarkdown(src: string): string {
  return renderBlocks(src.replace(/\r\n?/g, '\n').split('\n'))
}

/**
 * Shifts the headings of a Markdown text by `by` levels (max 6), so that a
 * note embedded in a larger document does not break its outline.
 */
export function demoteHeadings(src: string, by: number): string {
  let fenced = false
  return src
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((l) => {
      if (FENCE.test(l)) fenced = !fenced
      if (fenced) return l
      return l.replace(/^(#{1,6})(?=\s)/, (h) => '#'.repeat(Math.min(6, h.length + by)))
    })
    .join('\n')
}
