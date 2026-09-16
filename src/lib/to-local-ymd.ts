/**
 * Calendar YYYY-MM-DD in the user's local timezone.
 * Date-only strings (`YYYY-MM-DD`) are returned as-is to avoid UTC midnight shifts.
 */
export function toLocalYmd(value: string | Date | undefined | null): string {
  if (value == null) {
    return formatLocalYmd(new Date());
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') {
      return formatLocalYmd(new Date());
    }
    const dateOnly = trimmed.slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateOnly) && trimmed.length === 10) {
      return dateOnly;
    }
    const parsed = new Date(trimmed);
    if (Number.isNaN(parsed.getTime())) {
      return /^\d{4}-\d{2}-\d{2}$/.test(dateOnly) ? dateOnly : '';
    }
    return formatLocalYmd(parsed);
  }
  if (Number.isNaN(value.getTime())) {
    return '';
  }
  return formatLocalYmd(value);
}

function formatLocalYmd(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
