import * as http from '@/lib/http';

export type ValidateFirstAccessResult = {
  valid: boolean;
  reason?: 'expired' | 'used' | 'not_found';
  email?: string;
};

export async function validateFirstAccessToken(token: string): Promise<ValidateFirstAccessResult> {
  return http.get<ValidateFirstAccessResult>(
    `agent-first-access/validate/${encodeURIComponent(token)}`,
  );
}

export async function setFirstAccessPassword(params: {
  token: string;
  newPassword: string;
}): Promise<{ email: string; user: string }> {
  return http.post<{ email: string; user: string }>('agent-first-access/set-password', {
    token: params.token,
    newPassword: params.newPassword,
  });
}
