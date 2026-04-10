import { patch } from '@/lib/http';

export async function changeOwnPassword(params: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  await patch('users/me/password', {
    currentPassword: params.currentPassword,
    newPassword: params.newPassword,
  });
}
