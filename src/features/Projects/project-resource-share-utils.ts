export const PROJECT_RESOURCE_WHATSAPP_BUTTON_CLASSNAME =
  'inline-flex h-9 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md border border-input bg-background px-3 text-sm font-medium transition-colors duration-200 hover:bg-accent hover:text-accent-foreground';

export const getFilenameFromUrl = (url: string, fallbackName: string) => {
  try {
    const parsedUrl = new URL(url);
    const pathName = parsedUrl.pathname.split('/').pop();
    if (pathName) return decodeURIComponent(pathName);
    return fallbackName;
  } catch {
    return fallbackName;
  }
};

export const getMimeTypeFromFilename = (filename: string) => {
  const normalized = filename.toLowerCase();
  if (normalized.endsWith('.mp4')) return 'video/mp4';
  if (normalized.endsWith('.pdf')) return 'application/pdf';
  if (normalized.endsWith('.png')) return 'image/png';
  if (normalized.endsWith('.webp')) return 'image/webp';
  if (normalized.endsWith('.gif')) return 'image/gif';
  if (normalized.endsWith('.jpg') || normalized.endsWith('.jpeg')) return 'image/jpeg';
  return 'application/octet-stream';
};

export const getFilenameFromDisposition = (contentDisposition: string | null, fallbackName: string) => {
  if (!contentDisposition) return fallbackName;
  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) return decodeURIComponent(utf8Match[1]);
  const filenameMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  if (filenameMatch?.[1]) return filenameMatch[1];
  return fallbackName;
};
