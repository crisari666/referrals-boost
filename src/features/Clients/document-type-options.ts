export const VENDOR_DOCUMENT_TYPE_OPTIONS = [
  { label: 'Cédula', value: 'cc' },
  { label: 'Pasaporte', value: 'passport' },
  { label: 'Cédula extranjera', value: 'foreign_cc' },
] as const;

export type VendorDocumentTypeValue =
  (typeof VENDOR_DOCUMENT_TYPE_OPTIONS)[number]['value'];

const MS_DOCUMENT_TYPE_VALUES = new Set<string>(
  VENDOR_DOCUMENT_TYPE_OPTIONS.map((option) => option.value),
);

export function mapMsDocumentTypeToUiLabel(
  documentType: string | undefined,
): string {
  if (!documentType?.trim()) return '';
  const normalized = documentType.trim().toLowerCase();
  const match = VENDOR_DOCUMENT_TYPE_OPTIONS.find(
    (option) => option.value === normalized,
  );
  return match?.label ?? '';
}

export function isVendorDocumentTypeValue(value: string): value is VendorDocumentTypeValue {
  return MS_DOCUMENT_TYPE_VALUES.has(value);
}
