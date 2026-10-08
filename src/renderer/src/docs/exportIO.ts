/**
 * Saves the generated documentation. In Electron the main process shows the
 * save dialog (and prints the PDF); in a plain browser the Markdown is
 * downloaded and the PDF goes through the browser print dialog.
 * Returns the path written, '' when handled by the browser, null when cancelled.
 */
export async function exportDocFile(
  format: 'md' | 'pdf',
  content: string,
  suggestedName: string,
  title: string
): Promise<string | null> {
  if (window.api) return window.api.exportDoc({ format, content, suggestedName, title })
  if (format === 'md') {
    const url = URL.createObjectURL(new Blob([content], { type: 'text/markdown' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `${suggestedName}.md`
    a.click()
    URL.revokeObjectURL(url)
  } else {
    const w = window.open('', '_blank')
    if (!w) return null
    w.document.write(content)
    w.document.close()
    w.print()
  }
  return ''
}
