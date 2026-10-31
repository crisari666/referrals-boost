import { describe, expect, it } from 'vitest';
import {
  formatBogotaDateYmd,
  formatBogotaTimeHm,
  scheduleEventDayKey,
} from './bogota-schedule-time';

describe('bogota-schedule-time', () => {
  it('maps true-UTC lead call 21:30Z to Bogota 16:30 on the same calendar day', () => {
    const iso = '2026-10-31T21:30:00.000Z';
    expect(formatBogotaDateYmd(iso)).toBe('2026-10-31');
    expect(formatBogotaTimeHm(iso)).toBe('16:30');
    expect(scheduleEventDayKey({ scheduledAt: iso, eventType: 'call' })).toBe(
      '2026-10-31',
    );
  });

  it('buckets a late Bogota night call on the Bogota day not the next UTC day', () => {
    // 20:00 Bogota 31 Oct = 01:00 UTC 1 Nov
    const iso = '2026-11-01T01:00:00.000Z';
    expect(formatBogotaDateYmd(iso)).toBe('2026-10-31');
    expect(formatBogotaTimeHm(iso)).toBe('20:00');
    expect(scheduleEventDayKey({ scheduledAt: iso, eventType: 'call' })).toBe(
      '2026-10-31',
    );
  });

  it('keeps visit/virtual day key as the UTC ISO date prefix', () => {
    const iso = '2026-10-31T16:30:00.000Z';
    expect(
      scheduleEventDayKey({ scheduledAt: iso, eventType: 'office' }),
    ).toBe('2026-10-31');
  });
});
