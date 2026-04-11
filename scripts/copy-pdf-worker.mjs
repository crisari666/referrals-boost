import { copyFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const src = resolve(root, 'node_modules/pdfjs-dist/build/pdf.worker.min.mjs')
const destDir = resolve(root, 'public')
// Use .js so typical static hosts send application/javascript; many map .mjs to application/octet-stream.
const dest = resolve(destDir, 'pdf.worker.min.js')

if (!existsSync(src)) {
  console.error('copy-pdf-worker: missing pdfjs-dist worker at', src)
  process.exit(1)
}
if (!existsSync(destDir)) {
  mkdirSync(destDir, { recursive: true })
}
copyFileSync(src, dest)
