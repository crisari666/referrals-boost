import * as clientsService from '@/services/clientsService';

export function formatCreationDetailUser(
  user: string | clientsService.CreationDetailPopulatedUser
): string {
  if (typeof user === 'string') return user;
  const n = [user.name, user.lastName].filter(Boolean).join(' ').trim();
  return n || user.email || 'Usuario';
}

export function situationLabel(
  s: clientsService.CreationDetailSituationMeta | string
): string {
  if (typeof s === 'string') return s;
  const parts = [s.title, s.description].filter(Boolean);
  return parts.join(' · ') || 'Situación';
}

export function formatDetailDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' });
}
