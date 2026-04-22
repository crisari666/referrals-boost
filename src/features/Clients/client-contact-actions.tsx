import { useEffect } from 'react';
import { MessageCircle, CalendarPlus } from 'lucide-react';
import ScheduleDialog from "@/features/schedule/ui/ScheduleDialog";
import type { Client } from '@/data/mockData';
import { useAppDispatch } from '@/store';
import {
  ensureVoiceSession,
  setCallError,
  setCallPhase,
  setRegistrationStatus,
  setTokenError,
  voiceSessionCleared,
} from '@/store/twilioVoiceSlice';
import {
  destroyTwilioDevice,
  setTwilioVoiceListeners,
} from '@/lib/twilio-voice-runtime';
import { ClientVoiceCallButton } from './client-voice-call-button';
import { VoiceCallStatusDialog } from './voice-call-status-dialog';

export type ClientContactActionsProps = {
  client: Client;
  clientId: string;
  isPhysical: boolean;
};

export function ClientContactActions({ client, clientId, isPhysical }: ClientContactActionsProps) {
  const dispatch = useAppDispatch();
  const waDigits = client.whatsapp.replace(/\D/g, '');

  useEffect(() => {
    setTwilioVoiceListeners({
      onDeviceRegistered: () => {
        dispatch(setRegistrationStatus('registered'));
      },
      onDeviceError: (message) => {
        dispatch(setRegistrationStatus('error'));
        dispatch(setTokenError(message));
      },
      onCallPhase: (phase) => {
        dispatch(setCallPhase(phase));
      },
      onCallError: (message) => {
        dispatch(setCallError(message));
      },
    });
    return () => {
      setTwilioVoiceListeners({});
    };
  }, [dispatch]);

  useEffect(() => {
    if (!isPhysical) return;
    void dispatch(ensureVoiceSession());
    return () => {
      void destroyTwilioDevice();
      dispatch(voiceSessionCleared());
    };
  }, [isPhysical, dispatch]);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-5">
        {waDigits ? (
          <a
            href={`https://wa.me/${waDigits}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 bg-accent/10 rounded-xl py-3"
          >
            <MessageCircle className="w-5 h-5 text-accent" />
            <span className="text-[10px] font-medium text-accent">WhatsApp</span>
          </a>
        ) : (
          <div className="flex flex-col items-center gap-1 bg-muted/40 rounded-xl py-3 opacity-60">
            <MessageCircle className="w-5 h-5 text-muted-foreground" />
            <span className="text-[10px] font-medium text-muted-foreground">WhatsApp</span>
          </div>
        )}

        <ClientVoiceCallButton clientId={clientId} phoneDigits={client.phone ?? ''} />

        <ScheduleDialog
          clientId={clientId}
          trigger={
            <button
              type="button"
              className="flex flex-col items-center gap-1 bg-primary/10 rounded-xl py-3 w-full"
            >
              <CalendarPlus className="w-5 h-5 text-primary" />
              <span className="text-[10px] font-medium text-primary">Agendar</span>
            </button>
          }
        />
      </div>
      <VoiceCallStatusDialog />
    </>
  );
}
