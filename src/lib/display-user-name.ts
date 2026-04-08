export function displayUserName(name: string, lastName: string) {
  return [name, lastName].filter(Boolean).join(' ').trim() || 'Usuario';
}

export function profileInitials(
  name: string | undefined,
  lastName: string | undefined,
  fallbackFullName: string
) {
  const a = name?.trim()?.[0];
  const b = lastName?.trim()?.[0];
  if (a && b) return (a + b).toUpperCase();
  if (a) return a.toUpperCase();
  const fromFallback = fallbackFullName
    .split(/\s+/)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return fromFallback || '?';
}
