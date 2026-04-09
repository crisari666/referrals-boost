import { PDFDocument, rgb } from 'pdf-lib';

import {
  DEFAULT_SIGN_PLACEHOLDER,
  findSignPlaceholderInPdf,
} from '@/lib/find-sign-placeholder-in-pdf';

const MAX_SIGNED_PDF_BYTES = 24 * 1024 * 1024;

export async function mergePngSignatureIntoPdf(
  pdfBytes: ArrayBuffer,
  pngBytes: Uint8Array,
  options?: { placeholder?: string }
): Promise<Uint8Array> {
  const marker = options?.placeholder ?? DEFAULT_SIGN_PLACEHOLDER;
  const rect = await findSignPlaceholderInPdf(pdfBytes, marker);
  if (!rect) {
    throw new Error(
      `No se encontró el marcador "${marker}" en el PDF. Añádelo en el documento donde debe ir la firma.`
    );
  }

  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pngImage = await pdfDoc.embedPng(pngBytes);
  const pages = pdfDoc.getPages();
  const page = pages[rect.pageIndex];
  if (!page) {
    throw new Error('Página del marcador de firma no válida.');
  }

  const { width: boxW, height: boxH } = {
    width: Math.max(rect.width, 24),
    height: Math.max(rect.height, 16),
  };

  page.drawRectangle({
    x: rect.x,
    y: rect.y,
    width: boxW,
    height: boxH,
    color: rgb(1, 1, 1),
    borderWidth: 0,
  });

  const innerPad = 0.92;
  const innerW = boxW * innerPad;
  const innerH = boxH * innerPad;
  const originX = rect.x + (boxW - innerW) / 2;
  const originY = rect.y + (boxH - innerH) / 2;

  const imgAspect = pngImage.width / pngImage.height;
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

  const dx = originX + (innerW - drawW) / 2;
  const dy = originY + (innerH - drawH) / 2;

  page.drawImage(pngImage, {
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

export function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
