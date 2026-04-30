import * as http from '@/lib/http';

export type BasicUserNameRow = {
  id: string;
  name: string;
  lastName: string;
  displayName: string;
};

type BasicUsersByIdsResponse = {
  result: BasicUserNameRow[];
  error: string | null;
  message: string;
};

export async function listBasicUsersByIds(ids: string[]): Promise<BasicUserNameRow[]> {
  const payload = { ids };
  const response = await http.post<BasicUsersByIdsResponse>('users/basic/by-ids', payload);
  return Array.isArray(response?.result) ? response.result : [];
}
