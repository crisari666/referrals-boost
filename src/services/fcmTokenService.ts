import { http } from '@/lib/http';

/**
 * Registers (upserts) the agent browser FCM token on omega_office_back.
 */
export async function updateUserFcmToken(token: string): Promise<void> {
  const trimmed = token.trim();
  if (trimmed === '') {
    return;
  }
  await http.patch('users/fcm-token', {
    token: trimmed,
    platform: 'web',
  });
}
