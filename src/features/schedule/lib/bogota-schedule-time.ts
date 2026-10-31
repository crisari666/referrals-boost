/** Lead AI `call` events store true UTC; display/bucket in America/Bogota. */
export const BOGOTA_TIME_ZONE = 'America/Bogota' as const;

const bogotaYmdFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: BOGOTA_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const bogotaHourFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: BOGOTA_TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

/**
 * Bogota calendar day `YYYY-MM-DD` for a true-UTC ISO instant (lead `call` events).
 */
export function formatBogotaDateYmd(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return bogotaYmdFormatter.format(date);
}

/**
 * Bogota wall-clock `HH:mm` for a true-UTC ISO instant (lead `call` events).
 */
export function formatBogotaTimeHm(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const formatted = bogotaHourFormatter.format(date);
  const match = /^(\d{2}):(\d{2})$/.exec(formatted);
  return match ? `${match[1]}:${match[2]}` : formatted;
}

/** Day key for schedule `byDay` cache: Bogota for `call`, else UTC ISO date prefix. */
export function scheduleEventDayKey(event: {
  readonly scheduledAt: string;
  readonly eventType: string;
}): string {
  if (event.eventType === 'call') {
    const bogota = formatBogotaDateYmd(event.scheduledAt);
    if (bogota.length > 0) return bogota;
  }
  return event.scheduledAt.slice(0, 10);
}
