import i18n from '@/i18n';
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
    throw new Error(i18n.t('twilio.twilioNumberFetchFailed'));
  }
  return data.result;
}

export type UserTwilioNumbersResponse = {
  result: {
    regular: UserTwilioNumberResult | null;
    international: UserTwilioNumberResult | null;
  };
  message: string;
};

export async function fetchUserTwilioNumbers(): Promise<{
  regular: UserTwilioNumberResult | null;
  international: UserTwilioNumberResult | null;
}> {
  const data = await http.get<UserTwilioNumbersResponse>('twilio-numbers/user-numbers');
  return {
    regular: data?.result?.regular ?? null,
    international: data?.result?.international ?? null,
  };
}
