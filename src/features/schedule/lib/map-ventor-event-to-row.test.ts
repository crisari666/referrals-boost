import { describe, expect, it } from 'vitest';
import type { VentorScheduleEventApi } from '@/services/scheduleService';
import { mapVentorEventToVisitRow } from './map-ventor-event-to-row';

const baseEvent = {
  id: 'e1',
  userId: 'u1',
  customerId: 'c1',
  status: 'pending' as const,
  customer: { id: 'c1', displayName: 'Sergio' },
};

describe('mapVentorEventToVisitRow', () => {
  it('converts call true UTC 21:30Z to Bogota 16:30', () => {
    const ev: VentorScheduleEventApi = {
      ...baseEvent,
      eventType: 'call',
      scheduledAt: '2026-10-31T21:30:00.000Z',
    };
    const actual = mapVentorEventToVisitRow(ev, []);
    expect(actual.dateYmd).toBe('2026-10-31');
    expect(actual.timeHm).toBe('16:30');
  });

  it('converts call true UTC 14:30Z (9:30am Bogota) to 09:30', () => {
    const ev: VentorScheduleEventApi = {
      ...baseEvent,
      eventType: 'call',
      scheduledAt: '2026-10-15T14:30:00.000Z',
    };
    const actual = mapVentorEventToVisitRow(ev, []);
    expect(actual.dateYmd).toBe('2026-10-15');
    expect(actual.timeHm).toBe('09:30');
  });

  it('converts call true UTC 23:30Z (6:30pm Bogota) to 18:30 not 23:30', () => {
    const ev: VentorScheduleEventApi = {
      ...baseEvent,
      eventType: 'call',
      scheduledAt: '2026-10-15T23:30:00.000Z',
    };
    const actual = mapVentorEventToVisitRow(ev, []);
    expect(actual.dateYmd).toBe('2026-10-15');
    expect(actual.timeHm).toBe('18:30');
  });

  it('keeps visit/office wall-clock-as-Z time unchanged', () => {
    const ev: VentorScheduleEventApi = {
      ...baseEvent,
      eventType: 'office',
      scheduledAt: '2026-10-31T16:30:00.000Z',
    };
    const actual = mapVentorEventToVisitRow(ev, []);
    expect(actual.dateYmd).toBe('2026-10-31');
    expect(actual.timeHm).toBe('16:30');
  });
});
