import { Phone } from 'lucide-react';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/store';
import { startOutboundCall } from './start-outbound-voice-call';

export type ClientVoiceCallButtonProps = {
  clientId: string;
  phoneDigits: string;
};

export function ClientVoiceCallButton({ clientId, phoneDigits }: ClientVoiceCallButtonProps) {
  const dispatch = useAppDispatch();
  const tokenStatus = useAppSelector((s) => s.twilioVoice.tokenStatus);
  const numberStatus = useAppSelector((s) => s.twilioVoice.numberStatus);
  const registrationStatus = useAppSelector((s) => s.twilioVoice.registrationStatus);

  const hasPhone = Boolean(phoneDigits.replace(/\D/g, ''));
  const busy =
    tokenStatus === 'loading' ||
    numberStatus === 'loading' ||
    registrationStatus === 'loading' ||
    tokenStatus !== 'ready' ||
    numberStatus !== 'ready' ||
    registrationStatus !== 'registered';

  const handleClick = () => {
    void dispatch(
      startOutboundCall({ toDigits: phoneDigits, customerId: clientId })
    ).catch((e: unknown) => {
      const msg = e instanceof Error ? e.message : 'No se pudo iniciar la llamada';
      toast.error(msg);
    });
  };

  if (!hasPhone) {
    return (
      <div className="flex flex-col items-center gap-1 bg-muted/40 rounded-xl py-3 opacity-60">
        <Phone className="w-5 h-5 text-muted-foreground" />
        <span className="text-[10px] font-medium text-muted-foreground">Llamar</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={handleClick}
      className="flex flex-col items-center gap-1 bg-info/10 rounded-xl py-3 disabled:opacity-50 disabled:pointer-events-none"
    >
      <Phone className="w-5 h-5 text-info" />
      <span className="text-[10px] font-medium text-info">Llamar</span>
    </button>
  );
}
