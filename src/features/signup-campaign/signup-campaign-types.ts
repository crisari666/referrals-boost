export type SignupCampaignStatus =
  | 'active'
  | 'not_started'
  | 'expired'
  | 'disabled';

export interface SignupCampaignPublic {
  name: string;
  description: string;
  status: SignupCampaignStatus;
  dateStart: string;
  dateEnd: string;
  whatsappRedirectUrl: string | null;
}

export interface SignupRegistrationPayload {
  name: string;
  lastName: string;
  document: string;
  city: string;
  phone: string;
  email: string;
}

export type SignupCampaignLoadStatus =
  | 'idle'
  | 'loading'
  | 'success'
  | 'error';

export type SignupCampaignSubmitStatus =
  | 'idle'
  | 'submitting'
  | 'success'
  | 'error';

export interface SignupCampaignSliceState {
  loadStatus: SignupCampaignLoadStatus;
  campaign: SignupCampaignPublic | null;
  loadError: string | null;
  loadErrorKind: 'not_found' | 'unknown' | null;
  submitStatus: SignupCampaignSubmitStatus;
  submitError: string | null;
  successMessage: string | null;
}
