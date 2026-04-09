import { PDFDocument, rgb, type PDFImage } from 'pdf-lib';

import {
  DEFAULT_SIGN_PLACEHOLDER,
  findSignPlaceholderInPdf,
} from '@/lib/find-sign-placeholder-in-pdf';
import {
  isJpegBytes,
  isPngBytes,
  rasterBytesToPng,
} from '@/lib/signature-image';

export { dataUrlToUint8Array } from '@/lib/data-url';

const MAX_SIGNED_PDF_BYTES = 24 * 1024 * 1024;

/** Typed name: larger box (user-approved sizing). */
const TYPE_MIN_W_PT = 200;
const TYPE_MIN_H_PT = 64;
const TYPE_PLACEHOLDER_EXPAND = 1.55;
const TYPE_INNER_PAD = 0.98;

/** Drawn signature: smaller box so strokes don’t dominate the page. */
const DRAW_MIN_W_PT = 108;
const DRAW_MIN_H_PT = 38;
const DRAW_PLACEHOLDER_EXPAND = 1.1;
const DRAW_INNER_PAD = 0.96;

export type SignatureMergeMode = 'draw' | 'type';

async function embedSignatureRaster(
  pdfDoc: PDFDocument,
  bytes: Uint8Array
): Promise<PDFImage> {
  if (isPngBytes(bytes)) {
    return pdfDoc.embedPng(bytes);
  }
  if (isJpegBytes(bytes)) {
    return pdfDoc.embedJpg(bytes);
  }
  const png = await rasterBytesToPng(bytes);
  return pdfDoc.embedPng(png);
}

export async function mergeSignatureImageIntoPdf(
  pdfBytes: ArrayBuffer,
  imageBytes: Uint8Array,
  options?: { placeholder?: string; signatureMode?: SignatureMergeMode }
): Promise<Uint8Array> {
  const mode: SignatureMergeMode = options?.signatureMode ?? 'type';
  const marker = options?.placeholder ?? DEFAULT_SIGN_PLACEHOLDER;
  const rect = await findSignPlaceholderInPdf(pdfBytes, marker);
  if (!rect) {
    throw new Error(
      `No se encontró el marcador "${marker}" en el PDF. Añádelo en el documento donde debe ir la firma.`
    );
  }

  const pdfDoc = await PDFDocument.load(pdfBytes);
  const embeddedImage = await embedSignatureRaster(pdfDoc, imageBytes);
  const pages = pdfDoc.getPages();
  const page = pages[rect.pageIndex];
  if (!page) {
    throw new Error('Página del marcador de firma no válida.');
  }

  const { width: pageW, height: pageH } = page.getSize();

  const minW = mode === 'draw' ? DRAW_MIN_W_PT : TYPE_MIN_W_PT;
  const minH = mode === 'draw' ? DRAW_MIN_H_PT : TYPE_MIN_H_PT;
  const expand = mode === 'draw' ? DRAW_PLACEHOLDER_EXPAND : TYPE_PLACEHOLDER_EXPAND;
  const innerPad = mode === 'draw' ? DRAW_INNER_PAD : TYPE_INNER_PAD;

  let boxW = Math.max(rect.width * expand, minW);
  let boxH = Math.max(rect.height * expand, minH);

  const midY = rect.y + rect.height / 2;
  let boxX: number;
  let boxY = midY - boxH / 2;

  if (mode === 'draw') {
    boxX = rect.x;
  } else {
    const midX = rect.x + rect.width / 2;
    boxX = midX - boxW / 2;
  }

  if (boxY < 0) boxY = 0;
  if (boxY + boxH > pageH) {
    boxY = Math.max(0, pageH - boxH);
    boxH = Math.min(boxH, pageH - boxY);
  }

  if (mode === 'draw') {
    if (boxX < 0) boxX = 0;
    if (boxX + boxW > pageW) {
      boxW = Math.min(boxW, pageW - boxX);
    }
  } else {
    if (boxX < 0) boxX = 0;
    if (boxX + boxW > pageW) {
      boxX = Math.max(0, pageW - boxW);
      boxW = Math.min(boxW, pageW - boxX);
    }
  }

  page.drawRectangle({
    x: boxX,
    y: boxY,
    width: boxW,
    height: boxH,
    color: rgb(1, 1, 1),
    borderWidth: 0,
  });

  const innerW = boxW * innerPad;
  const innerH = boxH * innerPad;
  const originX = boxX + (boxW - innerW) / 2;
  const originY = boxY + (boxH - innerH) / 2;

  const imgAspect = embeddedImage.width / embeddedImage.height;

  const boxAspect = innerW / innerH;
  let drawW: number;
  let drawH: number;
  if (imgAspect > boxAspect) {
    drawW = innerW;
    drawH = drawW / imgAspect;
  } else {
    drawH = innerH;
    drawW = drawH * imgAspect;
  }

  const dx =
    mode === 'draw' ? originX : originX + (innerW - drawW) / 2;
  const dy = originY + (innerH - drawH) / 2;

  page.drawImage(embeddedImage, {
    x: dx,
    y: dy,
    width: drawW,
    height: drawH,
  });

  const out = await pdfDoc.save();
  if (out.byteLength > MAX_SIGNED_PDF_BYTES) {
    throw new Error(
      'El documento firmado es demasiado grande. Prueba con una firma más pequeña.'
    );
  }
  return out;
}

export const mergePngSignatureIntoPdf = mergeSignatureImageIntoPdf;
