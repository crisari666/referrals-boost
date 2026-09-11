import * as clientsService from '@/services/clientsService';
import i18n from '@/i18n';
import { getIntlLocaleTag } from '@/i18n/intl-locale';

export function formatCreationDetailUser(
  user: string | clientsService.CreationDetailPopulatedUser
): string {
  if (typeof user === 'string') return user;
  const n = [user.name, user.lastName].filter(Boolean).join(' ').trim();
  return n || user.email || i18n.t('clients.userFallback');
}

export function situationLabel(
  s: clientsService.CreationDetailSituationMeta | string
): string {
  if (typeof s === 'string') return s;
  const parts = [s.title, s.description].filter(Boolean);
  return parts.join(' · ') || i18n.t('clients.situationFallback');
}

export function formatDetailDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleString(getIntlLocaleTag(), { dateStyle: 'short', timeStyle: 'short' });
}

/**
 * Formats ventor schedule `scheduledAt` using the ISO clock fields as stored
 * (no local timezone shift). Matches schedule agenda display.
 */
export function formatScheduledAtExact(iso: string): string {
  if (!iso) return '';
  const [datePart = '', timeAndZone = ''] = iso.split('T');
  const timeHm = timeAndZone.slice(0, 5);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(datePart) ||
    !/^\d{2}:\d{2}$/.test(timeHm)
  ) {
    return iso;
  }
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute] = timeHm.split(':').map(Number);
  const utcWall = new Date(Date.UTC(year, month - 1, day, hour, minute));
  if (Number.isNaN(utcWall.getTime())) {
    return `${datePart} ${timeHm}`;
  }
  return utcWall.toLocaleString(getIntlLocaleTag(), {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'UTC',
  });
}
