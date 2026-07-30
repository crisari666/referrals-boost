import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Lightbulb, Sparkles, Mic } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  selectCallObjection,
  selectProjectPill,
  setCallScriptStage,
} from '@/store/twilioVoiceSlice';
import {
  CALL_OBJECTIONS,
  CALL_SCRIPT_STAGES,
  PRIMARY_PROJECT_PILLS,
  SECONDARY_PROJECT_PILLS,
  findCallObjection,
  findCallStage,
  findProjectPill,
  type CallObjectionId,
  type CallStageId,
  type ProjectPillId,
} from './ventor-call-script';
import { cn } from '@/lib/utils';

function speakerLabel(
  speaker: string | null,
  t: (key: string) => string,
): string {
  if (speaker === 'agent') return t('callScript.speakerAgent');
  if (speaker === 'customer') return t('callScript.speakerCustomer');
  return t('callScript.speakerUnknown');
}

type CallScriptPanelProps = {
  callEnded?: boolean;
};

export function CallScriptPanel({ callEnded = false }: CallScriptPanelProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);
  const adviceRef = useRef<HTMLDivElement | null>(null);
  const activeStageId = useAppSelector((s) => s.twilioVoice.activeStageId);
  const selectedObjectionId = useAppSelector((s) => s.twilioVoice.selectedObjectionId);
  const selectedProjectPillId = useAppSelector((s) => s.twilioVoice.selectedProjectPillId);
  const liveTranscriptLines = useAppSelector((s) => s.twilioVoice.liveTranscriptLines);
  const lastSuggestion = useAppSelector((s) => s.twilioVoice.lastSuggestion);
  const stage = findCallStage(activeStageId);
  const objection = findCallObjection(selectedObjectionId);
  const pill = findProjectPill(selectedProjectPillId);
  const hasAiSuggestion = Boolean(lastSuggestion);
  const lastSpoken = [...liveTranscriptLines]
    .reverse()
    .find((line) => line.text.trim().length > 0);
  const ventorSpeaking = !callEnded && lastSpoken?.speaker === 'agent';
  const confidencePct = lastSuggestion
    ? Math.round(Math.min(1, Math.max(0, lastSuggestion.confidence)) * 100)
    : 0;
  const showPillPicker = activeStageId === 'pildora';
  const readingKeys = objection
    ? objection.replyKeys
    : showPillPicker && pill
      ? pill.replyKeys
      : stage?.promptKeys ?? [];
  const tipKeys = !objection && !pill ? stage?.tipKeys ?? [] : [];
  const readingTitle = objection
    ? t(objection.labelKey)
    : showPillPicker && pill
      ? t(pill.labelKey)
      : stage
        ? t(stage.titleKey)
        : '';

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [liveTranscriptLines]);

  useEffect(() => {
    if (!lastSuggestion) return;
    adviceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [lastSuggestion?.sentAt, lastSuggestion?.objectionId, lastSuggestion?.stageId]);

  return (
    <div className="grid h-full min-h-0 gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.9fr)]">
      <div className="flex min-h-0 min-w-0 flex-col gap-2 overflow-hidden">
        <div className="flex shrink-0 items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {t('callScript.title')}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              {t('callScript.goldenRule')}
            </p>
          </div>
          <div
            className={cn(
              'inline-flex shrink-0 items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-medium',
              callEnded
                ? 'border-border bg-muted/60 text-muted-foreground'
                : hasAiSuggestion
                  ? 'border-accent/40 bg-accent/10 text-foreground'
                  : 'border-border bg-muted/60 text-muted-foreground',
            )}
          >
            <Sparkles className="h-3 w-3 shrink-0" aria-hidden />
            {callEnded
              ? t('callScript.callEndedTitle')
              : hasAiSuggestion
                ? t('callScript.aiCoachLabel')
                : t('callScript.aiListening')}
          </div>
        </div>

        <div className="shrink-0">
          <div
            className="flex gap-1 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="tablist"
            aria-label={t('callScript.stagesLabel')}
          >
            {CALL_SCRIPT_STAGES.map((item, index) => {
              const selected = item.id === activeStageId;
              const speakingHere = selected && ventorSpeaking;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => dispatch(setCallScriptStage(item.id as CallStageId))}
                  className={cn(
                    'cursor-pointer whitespace-nowrap rounded-md border px-2 py-1 text-[11px] font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    selected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-foreground hover:bg-muted',
                    speakingHere &&
                      'underline decoration-2 underline-offset-4 decoration-primary-foreground ring-2 ring-primary/40',
                  )}
                >
                  {index + 1}. {t(item.titleKey).replace(/^\d+\.\s*/, '')}
                </button>
              );
            })}
          </div>
        </div>

        {showPillPicker ? (
          <div className="shrink-0 space-y-1">
            <p className="px-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t('callScript.projectBranchesLabel')}
            </p>
            <div className="flex gap-1 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {PRIMARY_PROJECT_PILLS.map((item) => {
                const selected = item.id === selectedProjectPillId;
                const speakingHere = selected && ventorSpeaking;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => dispatch(selectProjectPill(item.id as ProjectPillId))}
                    className={cn(
                      'cursor-pointer whitespace-nowrap rounded-md border px-2 py-1 text-[11px] font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      selected
                        ? 'border-accent bg-accent text-accent-foreground'
                        : 'border-border bg-background hover:bg-muted',
                      speakingHere &&
                        'underline decoration-2 underline-offset-4 decoration-accent-foreground ring-2 ring-accent/40',
                    )}
                  >
                    {t(item.labelKey)}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-1 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {SECONDARY_PROJECT_PILLS.map((item) => {
                const selected = item.id === selectedProjectPillId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => dispatch(selectProjectPill(item.id as ProjectPillId))}
                    className={cn(
                      'cursor-pointer whitespace-nowrap rounded-md border border-dashed px-2 py-1 text-[11px] font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      selected
                        ? 'border-muted-foreground bg-muted text-foreground'
                        : 'border-border bg-background text-muted-foreground hover:bg-muted',
                    )}
                  >
                    {t(item.labelKey)}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background">
          {lastSuggestion ? (
            <div
              ref={adviceRef}
              className="shrink-0 border-b border-accent/25 bg-accent/10 px-3 py-2"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-accent" aria-hidden />
                  {t('callScript.autoSuggestion')}
                </p>
                <span className="text-[10px] tabular-nums text-muted-foreground">
                  {t('callScript.confidenceLabel')} {confidencePct}%
                </span>
              </div>
              {lastSuggestion.reason ? (
                <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-foreground/90">
                  {lastSuggestion.reason}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="flex shrink-0 items-center gap-2 border-b border-border/60 px-3 py-1.5">
            <span className="inline-flex h-5 items-center rounded bg-primary px-1.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">
              {t('callScript.sayNowLabel')}
            </span>
            <span
              className={cn(
                'truncate text-[11px] font-medium text-muted-foreground',
                ventorSpeaking && 'underline decoration-2 underline-offset-4 decoration-primary text-foreground',
              )}
            >
              {readingTitle}
            </span>
            {ventorSpeaking ? (
              <span className="ml-auto text-[10px] font-semibold uppercase tracking-wide text-primary">
                {t('callScript.ventorSpeaking')}
              </span>
            ) : objection && lastSuggestion?.objectionId === objection.id ? (
              <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-medium text-accent">
                <Sparkles className="h-3 w-3" aria-hidden />
                AI
              </span>
            ) : null}
          </div>

          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-2.5">
            {readingKeys.length > 0 ? (
              readingKeys.map((key) => (
                <p
                  key={key}
                  className={cn(
                    'text-sm leading-snug text-foreground font-medium sm:text-[15px] sm:leading-relaxed',
                    ventorSpeaking &&
                      'underline decoration-primary/70 decoration-2 underline-offset-[5px]',
                  )}
                >
                  {t(key)}
                </p>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">
                {showPillPicker
                  ? t('callScript.pillsLabel')
                  : t('callScript.selectObjectionHint')}
              </p>
            )}
            {tipKeys.length > 0 ? (
              <div className="flex gap-2 rounded-md border border-border/70 bg-background/80 px-2 py-1.5">
                <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                <div className="min-w-0 space-y-0.5">
                  {tipKeys.map((key) => (
                    <p key={key} className="text-[11px] leading-snug text-muted-foreground">
                      {t(key)}
                    </p>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="shrink-0">
          <div className="mb-1 flex items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t('callScript.objectionsLabel')}
            </p>
            {!objection ? (
              <p className="truncate text-[10px] text-muted-foreground">
                {t('callScript.selectObjectionHint')}
              </p>
            ) : null}
          </div>
          <div className="flex gap-1 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {CALL_OBJECTIONS.map((item) => {
              const selected = item.id === selectedObjectionId;
              const aiPicked = lastSuggestion?.objectionId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    dispatch(
                      selectCallObjection(selected ? null : (item.id as CallObjectionId)),
                    )
                  }
                  className={cn(
                    'cursor-pointer whitespace-nowrap rounded-md border px-2 py-1 text-[11px] font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    selected
                      ? 'border-destructive bg-destructive/10 text-destructive'
                      : aiPicked
                        ? 'border-accent/50 bg-accent/10 text-foreground'
                        : 'border-border bg-background hover:bg-muted',
                  )}
                >
                  {aiPicked && !selected ? (
                    <Sparkles className="mr-1 inline h-3 w-3 text-accent" aria-hidden />
                  ) : null}
                  {t(item.labelKey)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-col overflow-hidden rounded-lg border bg-muted/20">
        <div className="flex shrink-0 items-center justify-between gap-2 border-b bg-background/80 px-2.5 py-1.5">
          <div className="flex items-center gap-1.5">
            <Mic className="h-3.5 w-3.5 text-primary" aria-hidden />
            <p className="text-xs font-semibold text-foreground">
              {t('callScript.transcriptLabel')}
            </p>
          </div>
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
              callEnded
                ? 'border-border bg-muted text-muted-foreground'
                : 'border-primary/30 bg-primary/10 text-primary',
            )}
          >
            {!callEnded ? (
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60 motion-reduce:animate-none" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
            ) : null}
            {callEnded ? t('callScript.transcriptEnded') : t('callScript.liveBadge')}
          </span>
        </div>
        <div
          className="min-h-0 flex-1 space-y-1.5 overflow-y-auto px-2.5 py-2"
          aria-live="polite"
          aria-relevant="additions"
        >
          {liveTranscriptLines.length === 0 ? (
            <div className="flex h-full min-h-[120px] flex-col items-center justify-center gap-2 text-center px-3">
              <Mic className="h-5 w-5 text-muted-foreground" aria-hidden />
              <p className="text-xs text-muted-foreground">{t('callScript.transcriptEmpty')}</p>
            </div>
          ) : (
            liveTranscriptLines.slice(-20).map((line, index) => {
              const isAgent = line.speaker === 'agent';
              const isCustomer = line.speaker === 'customer';
              return (
                <div
                  key={`${line.sentAt}-${index}`}
                  className={cn(
                    'max-w-[95%] rounded-md px-2 py-1 text-xs leading-snug',
                    isAgent && 'ml-auto bg-primary/15 text-foreground',
                    isCustomer && 'mr-auto border bg-background text-foreground',
                    !isAgent && !isCustomer && 'mx-auto bg-muted text-muted-foreground',
                    !line.isFinal && 'opacity-70 italic',
                  )}
                >
                  <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {speakerLabel(line.speaker, t)}
                    {!line.isFinal ? ' · …' : ''}
                  </p>
                  <p>{line.text}</p>
                </div>
              );
            })
          )}
          <div ref={transcriptEndRef} />
        </div>
      </div>
    </div>
  );
}
