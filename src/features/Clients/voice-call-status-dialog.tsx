import { Mic, MicOff, Phone, PhoneOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  toggleCallMute,
} from '@/store/twilioVoiceSlice';
import { CallScriptPanel } from './call-script/call-script-panel';
import { cn } from '@/lib/utils';

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
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.twilioVoice.dialogOpen);
  const phase = useAppSelector((s) => s.twilioVoice.callPhase);
  const error = useAppSelector((s) => s.twilioVoice.callError);
  const coachNotes = useAppSelector((s) => s.twilioVoice.coachNotes);
  const supervisorConnected = useAppSelector((s) => s.twilioVoice.supervisorConnected);
  const isMuted = useAppSelector((s) => s.twilioVoice.isMuted);
  const onCall = phase === 'open' || phase === 'ringing' || phase === 'connecting';
  const callEnded = phase === 'closed';
  const showTeleprompter = onCall || callEnded || phase === 'error';
  const showCoaching =
    showTeleprompter && (supervisorConnected || coachNotes.length > 0);
  const phaseLabel = phaseLabels[phase] ?? phase;
  const canMute = phase === 'open' || phase === 'ringing';

  const closeDialog = () => {
    dispatch(setDialogOpen(false));
    dispatch(resetCallUi());
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && onCall) return;
        if (!next) closeDialog();
      }}
    >
      <DialogContent
        className={cn(
          'flex w-[min(96vw,72rem)] max-w-6xl flex-col gap-0 overflow-hidden p-0',
          showTeleprompter
            ? 'h-[min(92vh,880px)] sm:max-w-6xl'
            : 'max-h-[90vh] sm:max-w-lg',
        )}
        onPointerDownOutside={(e) => onCall && e.preventDefault()}
        onEscapeKeyDown={(e) => onCall && e.preventDefault()}
      >
        <DialogHeader className="shrink-0 space-y-0 border-b px-4 py-3 text-left sm:text-left">
          <div className="flex flex-wrap items-center justify-between gap-2 pr-8">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border',
                  onCall
                    ? 'border-primary/30 bg-primary/10 text-primary'
                    : callEnded
                      ? 'border-muted-foreground/30 bg-muted text-muted-foreground'
                      : 'border-border bg-muted text-muted-foreground',
                )}
              >
                <Phone className="h-4 w-4" aria-hidden />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-base">Llamada VoIP</DialogTitle>
                <DialogDescription className="mt-0.5 text-xs">
                  {callEnded
                    ? t('callScript.callEndedHint')
                    : onCall
                      ? 'Teleprompter en vivo'
                      : phaseLabel}
                </DialogDescription>
              </div>
            </div>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors duration-200',
                phase === 'open' && 'border-accent/40 bg-accent/10 text-accent',
                phase === 'ringing' && 'border-primary/40 bg-primary/10 text-primary',
                phase === 'connecting' && 'border-border bg-muted text-muted-foreground',
                phase === 'error' && 'border-destructive/40 bg-destructive/10 text-destructive',
                (phase === 'idle' || phase === 'closed') &&
                  'border-border bg-muted text-muted-foreground',
              )}
            >
              {phase === 'open' || phase === 'ringing' ? (
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-50 motion-reduce:animate-none" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
                </span>
              ) : null}
              {phaseLabel}
            </span>
          </div>
        </DialogHeader>

        <div
          className={cn(
            'min-h-0 flex-1 px-4 py-3',
            showTeleprompter ? 'overflow-hidden flex flex-col' : 'overflow-y-auto',
          )}
        >
          {error ? <p className="mb-2 shrink-0 text-sm text-destructive">{error}</p> : null}
          {callEnded ? (
            <div className="mb-2 shrink-0 rounded-md border border-border bg-muted/50 px-3 py-2">
              <p className="text-sm font-semibold text-foreground">
                {t('callScript.callEndedTitle')}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t('callScript.callEndedHint')}
              </p>
            </div>
          ) : null}
          {showTeleprompter ? (
            <div className="min-h-0 flex-1">
              <CallScriptPanel callEnded={callEnded} />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-2">{phaseLabel}</p>
          )}
          {showCoaching ? (
            <div className="mt-2 shrink-0 rounded-md border bg-muted/40 px-2.5 py-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium">Coaching en vivo</p>
                {supervisorConnected && onCall ? (
                  <span className="text-[10px] text-muted-foreground">Supervisor conectado</span>
                ) : null}
              </div>
              {coachNotes.length > 0 ? (
                <ul className="mt-1 max-h-16 space-y-1 overflow-y-auto">
                  {coachNotes.slice(-3).map((note, index) => (
                    <li
                      key={`${note.sentAt}-${index}`}
                      className="rounded border bg-background px-2 py-1 text-xs"
                    >
                      <span className="text-muted-foreground">{note.supervisorName}</span>
                      <span className="mx-1 text-muted-foreground">·</span>
                      <span>{note.message}</span>
                      <span className="ml-1 text-[10px] text-muted-foreground">
                        {formatNoteTime(note.sentAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-0.5 text-[11px] text-muted-foreground">Sin notas aún.</p>
              )}
            </div>
          ) : null}
        </div>

        <DialogFooter className="shrink-0 flex-row flex-wrap items-center justify-end gap-2 border-t bg-muted/20 px-4 py-2.5">
          {canMute ? (
            <Button
              type="button"
              variant={isMuted ? 'default' : 'outline'}
              className="gap-2 cursor-pointer"
              onClick={() => void dispatch(toggleCallMute())}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              {isMuted ? t('callScript.unmuteMic') : t('callScript.muteMic')}
            </Button>
          ) : null}
          {onCall ? (
            <Button
              type="button"
              variant="destructive"
              className="gap-2 cursor-pointer"
              onClick={() => void dispatch(hangUpVoiceCall())}
            >
              <PhoneOff className="w-4 h-4" />
              Colgar
            </Button>
          ) : (
            <Button
              type="button"
              variant="secondary"
              className="cursor-pointer"
              onClick={closeDialog}
            >
              Cerrar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
