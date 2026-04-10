import { PhoneOff } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  hangUpVoiceCall,
  resetCallUi,
  setDialogOpen,
} from '@/store/twilioVoiceSlice';

const phaseLabels: Record<string, string> = {
  idle: 'Listo',
  connecting: 'Conectando…',
  ringing: 'Sonando…',
  open: 'En llamada',
  closed: 'Llamada finalizada',
  error: 'Error',
};

export function VoiceCallStatusDialog() {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.twilioVoice.dialogOpen);
  const phase = useAppSelector((s) => s.twilioVoice.callPhase);
  const error = useAppSelector((s) => s.twilioVoice.callError);
  const onCall = phase === 'open' || phase === 'ringing' || phase === 'connecting';

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && onCall) return;
        if (!next) {
          dispatch(setDialogOpen(false));
          dispatch(resetCallUi());
        }
      }}
    >
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => onCall && e.preventDefault()}
        onEscapeKeyDown={(e) => onCall && e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Llamada VoIP</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <p className="text-sm text-muted-foreground">{phaseLabels[phase] ?? phase}</p>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          {onCall ? (
            <Button
              type="button"
              variant="destructive"
              className="gap-2"
              onClick={() => void dispatch(hangUpVoiceCall())}
            >
              <PhoneOff className="w-4 h-4" />
              Colgar
            </Button>
          ) : (
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                dispatch(setDialogOpen(false));
                dispatch(resetCallUi());
              }}
            >
              Cerrar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
