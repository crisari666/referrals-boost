import type { AppDispatch, RootState } from '@/store';
import { setCallError, setCallPhase, setDialogOpen } from '@/store/twilioVoiceSlice';
import { connectOutboundCall } from '@/lib/twilio-voice-runtime';
import { digitsToE164 } from './phone-e164';

export const startOutboundCall =
  (payload: { toDigits: string; customerId: string }) =>
  async (dispatch: AppDispatch, getState: () => RootState): Promise<void> => {
    const { auth, twilioVoice } = getState();
    const userId = auth.user?.id;
    const userNumber = twilioVoice.userNumber;
    const digits = payload.toDigits.replace(/\D/g, '');
    if (!userId) {
      const msg = 'Sesión no válida';
      dispatch(setCallError(msg));
      dispatch(setCallPhase('error'));
      throw new Error(msg);
    }
    if (!userNumber) {
      const msg = 'No hay número Twilio asignado';
      dispatch(setCallError(msg));
      dispatch(setCallPhase('error'));
      throw new Error(msg);
    }
    if (twilioVoice.registrationStatus !== 'registered') {
      const msg = 'VoIP aún no está listo';
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
        callerId: userNumber.startsWith('+') ? userNumber : `+${userNumber}`,
        userId,
        customerId: payload.customerId,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'No se pudo iniciar la llamada';
      dispatch(setCallError(msg));
      dispatch(setCallPhase('error'));
      throw e;
    }
  };
