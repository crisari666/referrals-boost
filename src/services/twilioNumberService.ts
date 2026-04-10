import { http } from '@/lib/http';

export type UserTwilioNumberResult = {
  _id: string;
  name: string;
  user: string;
  PNID: string;
  number: string;
  friendlyNumber: string;
  isOccupied: boolean;
  occupiedByFlowId: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

export type UserTwilioNumberResponse = {
  result: UserTwilioNumberResult;
  message: string;
};

export async function fetchUserTwilioNumber(): Promise<UserTwilioNumberResult> {
  const data = await http.get<UserTwilioNumberResponse>('twilio-numbers/user-number');
  if (!data?.result?.number) {
    throw new Error('No se pudo obtener el número Twilio del usuario');
  }
  return data.result;
}
