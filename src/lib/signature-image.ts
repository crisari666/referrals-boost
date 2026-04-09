import { dataUrlToUint8Array } from '@/lib/data-url';

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('No se pudo cargar la imagen.'));
    img.src = src;
  });
}

export function isPngBytes(bytes: Uint8Array): boolean {
  return bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
}

export function isJpegBytes(bytes: Uint8Array): boolean {
  return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
}

export function renderTextSignatureToPng(text: string): Uint8Array {
  const canvas = document.createElement('canvas');
  const w = 400;
  const h = 160;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas no disponible.');
  }
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#0a0a0a';
  let fontSize = 44;
  const fontFamily =
    'ui-serif, "Apple Chancery", "Segoe Script", "Brush Script MT", "Snell Roundhand", cursive';
  const t = text.trim();
  do {
    ctx.font = `italic ${fontSize}px ${fontFamily}`;
    if (ctx.measureText(t).width <= w - 32 || fontSize <= 16) break;
    fontSize -= 2;
  } while (fontSize > 16);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(t, w / 2, h / 2);
  return dataUrlToUint8Array(canvas.toDataURL('image/png'));
}

export async function rasterBytesToPng(bytes: Uint8Array, mimeHint = 'image/png'): Promise<Uint8Array> {
  if (isPngBytes(bytes)) return bytes;
  const blob = new Blob([bytes], { type: mimeHint });
  const url = URL.createObjectURL(blob);
  try {
    const img = await loadImageElement(url);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas no disponible.');
    }
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    return dataUrlToUint8Array(canvas.toDataURL('image/png'));
  } finally {
    URL.revokeObjectURL(url);
  }
}
