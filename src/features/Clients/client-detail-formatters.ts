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
