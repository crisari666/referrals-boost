import { get, post } from '@/lib/http';
import type {
  SignupCampaignPublic,
  SignupRegistrationPayload,
} from '../signup-campaign-types';

export interface SubmitSignupResponse {
  success: true;
  message: string;
}

export function fetchCampaignByCode(code: string): Promise<SignupCampaignPublic> {
  return get<SignupCampaignPublic>(
    `/signup-campaigns/by-code/${encodeURIComponent(code)}`
  );
}

export function submitSignupRegistration(
  code: string,
  payload: SignupRegistrationPayload
): Promise<SubmitSignupResponse> {
  return post<SubmitSignupResponse>(
    `/signup-campaigns/${encodeURIComponent(code)}/register`,
    payload
  );
}
