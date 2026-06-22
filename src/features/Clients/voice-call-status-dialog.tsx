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

function formatNoteTime(sentAt: string): string {
  const d = new Date(sentAt);
  if (Number.isNaN(d.getTime())) return sentAt;
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

export function VoiceCallStatusDialog() {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.twilioVoice.dialogOpen);
  const phase = useAppSelector((s) => s.twilioVoice.callPhase);
  const error = useAppSelector((s) => s.twilioVoice.callError);
  const coachNotes = useAppSelector((s) => s.twilioVoice.coachNotes);
  const supervisorConnected = useAppSelector((s) => s.twilioVoice.supervisorConnected);
  const onCall = phase === 'open' || phase === 'ringing' || phase === 'connecting';
  const showCoaching = onCall && (supervisorConnected || coachNotes.length > 0);

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
          {showCoaching ? (
            <div className="rounded-md border bg-muted/40 p-3 space-y-2">
              <p className="text-sm font-medium">Coaching en vivo</p>
              {supervisorConnected ? (
                <p className="text-xs text-muted-foreground">
                  Un supervisor está acompañando esta llamada.
                </p>
              ) : null}
              {coachNotes.length > 0 ? (
                <ul className="max-h-40 space-y-2 overflow-y-auto">
                  {coachNotes.map((note, index) => (
                    <li
                      key={`${note.sentAt}-${index}`}
                      className="rounded border bg-background px-2 py-1.5 text-sm"
                    >
                      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                        <span>{note.supervisorName}</span>
                        <span>{formatNoteTime(note.sentAt)}</span>
                      </div>
                      <p className="mt-0.5">{note.message}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground">Sin notas de coaching aún.</p>
              )}
            </div>
          ) : null}
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
