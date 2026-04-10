export function digitsToE164(digits: string): string {
  const d = digits.replace(/\D/g, '');
  if (!d) return '';
  if (d.length === 10) {
    return `+1${d}`;
  }
  if (d.length === 11 && d.startsWith('1')) {
    return `+${d}`;
  }
  return `+${d}`;
}
