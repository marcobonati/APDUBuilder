// Writes dist/SHA256SUMS.txt for the distributable artifacts, so downloads can be verified
// with `shasum -a 256 -c SHA256SUMS.txt` (macOS/Linux) or `Get-FileHash` (Windows).
import { createHash } from 'node:crypto'
import { createReadStream, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const DIST = 'dist'
const ARTIFACT = /\.(dmg|zip|exe|AppImage|deb)$/

const files = readdirSync(DIST)
  .filter((f) => ARTIFACT.test(f) && statSync(join(DIST, f)).isFile())
  .sort()
if (files.length === 0) {
  console.error('No artifacts in dist/: run a build first.')
  process.exit(1)
}

const lines = []
for (const f of files) {
  const hash = createHash('sha256')
  for await (const chunk of createReadStream(join(DIST, f))) hash.update(chunk)
  const mb = (statSync(join(DIST, f)).size / 1048576).toFixed(1)
  lines.push(`${hash.digest('hex')}  ${f}`)
  console.log(`${f.padEnd(52)} ${mb.padStart(7)} MB`)
}
writeFileSync(join(DIST, 'SHA256SUMS.txt'), lines.join('\n') + '\n')
console.log(`\n${files.length} artifacts, checksums in ${join(DIST, 'SHA256SUMS.txt')}`)
