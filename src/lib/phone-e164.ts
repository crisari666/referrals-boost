import type { CountryCode } from '@/lib/country-codes';

const BLOCKED_LOCAL_NUMBERS = [
  '1234567',
  '12345678',
  '123456789',
  '1234567890',
  '12345678901',
  '123456789012',
  '0123456789',
  '9876543210',
  '987654321',
];

export function buildE164(country: CountryCode, local: string): string {
  const digits = local.replace(/\D/g, '');
  return `+${country.dial}${digits}`;
}

export function isValidLocalPhone(local: string): boolean {
  const digits = local.replace(/\D/g, '');
  if (digits.length < 7 || digits.length > 15) return false;
  if (/^(\d)\1+$/.test(digits)) return false;
  if (BLOCKED_LOCAL_NUMBERS.includes(digits)) return false;
  return true;
}

/** Align with customers-ms `normalizeCustomerPhone` (no `+`, no spaces). */
export function digitsOnlyForMs(value: string): string {
  return value.trim().replace(/[+\s]+/g, '');
}

export function buildMsPhone(country: CountryCode, local: string): string {
  return digitsOnlyForMs(buildE164(country, local));
}
