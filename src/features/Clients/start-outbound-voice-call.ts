import i18n from '@/i18n';
import type { AppDispatch, RootState } from '@/store';
import { setCallError, setCallPhase, setDialogOpen } from '@/store/twilioVoiceSlice';
import { connectOutboundCall } from '@/lib/twilio-voice-runtime';
import { digitsToE164 } from './phone-e164';

export const startOutboundCall =
  (payload: { toDigits: string; customerId: string; isInternational?: boolean }) =>
  async (dispatch: AppDispatch, getState: () => RootState): Promise<void> => {
    const { auth, twilioVoice } = getState();
    const userId = auth.user?.id;
    const digits = payload.toDigits.replace(/\D/g, '');
    if (!userId) {
      const msg = i18n.t('twilio.invalidSession');
      dispatch(setCallError(msg));
      dispatch(setCallPhase('error'));
      throw new Error(msg);
    }
    if (twilioVoice.registrationStatus !== 'registered') {
      const msg = i18n.t('twilio.voipNotReady');
      dispatch(setCallError(msg));
      dispatch(setCallPhase('error'));
      throw new Error(msg);
    }
    const isIntl = payload.isInternational === true;
    console.log({payload})
    const callerNumber = isIntl
      ? twilioVoice.userInternationalNumber
      : twilioVoice.userNumber;
    if (!callerNumber) {
      const msg = isIntl
        ? i18n.t('twilio.noInternationalNumber')
        : i18n.t('twilio.noTwilioNumber');
      dispatch(setCallError(msg));
      dispatch(setCallPhase('error'));
      throw new Error(msg);
    }
    const toE164 = digitsToE164(digits);
    dispatch(setDialogOpen(true));
    dispatch(setCallPhase('connecting'));
    dispatch(setCallError(null));
    try {
      await connectOutboundCall({
        to: toE164,
        callerId: callerNumber.startsWith('+') ? callerNumber : `+${callerNumber}`,
        userId,
        customerId: payload.customerId,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : i18n.t('twilio.callStartFailed');
      dispatch(setCallError(msg));
      dispatch(setCallPhase('error'));
      throw e;
    }
  };
