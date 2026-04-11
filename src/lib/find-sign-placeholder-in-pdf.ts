import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';

const pdfWorkerSrc = `${import.meta.env.BASE_URL}pdf.worker.min.js`;

let workerConfigured = false;

function ensurePdfWorker(): void {
  if (workerConfigured) return;
  GlobalWorkerOptions.workerSrc = pdfWorkerSrc;
  workerConfigured = true;
}

export const DEFAULT_SIGN_PLACEHOLDER = '{{SIGN}}';

export type SignPlaceholderRect = {
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

type TextSegment = {
  str: string;
  x: number;
  y: number;
  w: number;
  h: number;
  charStart: number;
};

function collectTextSegments(items: unknown[]): TextSegment[] {
  let charStart = 0;
  const segments: TextSegment[] = [];
  for (const raw of items) {
    if (!raw || typeof raw !== 'object') continue;
    const item = raw as {
      str?: string;
      transform?: number[];
      width?: number;
      height?: number;
    };
    if (typeof item.str !== 'string' || item.str.length === 0) continue;
    if (!Array.isArray(item.transform) || item.transform.length < 6) continue;
    const tr = item.transform;
    const w = typeof item.width === 'number' ? item.width : 0;
    const h =
      typeof item.height === 'number' && item.height > 0
        ? item.height
        : Math.max(Math.abs(tr[3]), 10);
    segments.push({
      str: item.str,
      x: tr[4],
      y: tr[5],
      w,
      h,
      charStart,
    });
    charStart += item.str.length;
  }
  return segments;
}

/**
 * Locates `{{SIGN}}` (or custom marker) using PDF.js text positions (user space, same as pdf-lib).
 */
export async function findSignPlaceholderInPdf(
  pdfBytes: ArrayBuffer,
  marker: string = DEFAULT_SIGN_PLACEHOLDER
): Promise<SignPlaceholderRect | null> {
  ensurePdfWorker();
  const data = pdfBytes.slice(0);
  const pdf = await getDocument({ data }).promise;
  const pad = 4;

  for (let p = 1; p <= pdf.numPages; p += 1) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    const segments = collectTextSegments(content.items as unknown[]);
    if (segments.length === 0) continue;

    const fullText = segments.map((s) => s.str).join('');
    const idx = fullText.indexOf(marker);
    if (idx === -1) continue;

    const rangeEnd = idx + marker.length;
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    let pos = 0;
    for (const seg of segments) {
      const segEnd = pos + seg.str.length;
      if (segEnd > idx && pos < rangeEnd) {
        minX = Math.min(minX, seg.x);
        maxX = Math.max(maxX, seg.x + seg.w);
        minY = Math.min(minY, seg.y);
        maxY = Math.max(maxY, seg.y + seg.h);
      }
      pos = segEnd;
    }

    if (minX === Infinity) continue;

    return {
      pageIndex: p - 1,
      x: minX - pad,
      y: minY - pad,
      width: maxX - minX + pad * 2,
      height: maxY - minY + pad * 2,
    };
  }
  return null;
}
