import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { LeadConversationAnswers } from '@/services/leadConversationService.types';

type LeadScoreMeterProps = {
  score: number;
  maxScore: number;
  answers: LeadConversationAnswers;
  isMuted: boolean;
};

type ScoreSegment = {
  key: string;
  labelKey: string;
  points: number;
  isEarned: boolean;
  widthClass: string;
};

/**
 * Segmented bar sized by step weight (+1 plan, +2 payment, +3 call),
 * so ventors see at a glance how far the lead went in the assistant flow.
 */
export function LeadScoreMeter({ score, maxScore, answers, isMuted }: LeadScoreMeterProps) {
  const { t } = useTranslation();
  const segments: ScoreSegment[] = [
    { key: 'plan', labelKey: 'clients.leadScoreStepPlan', points: 1, isEarned: Boolean(answers.rangoLote), widthClass: 'flex-[1]' },
    { key: 'payment', labelKey: 'clients.leadScoreStepPayment', points: 2, isEarned: Boolean(answers.formaPago), widthClass: 'flex-[2]' },
    { key: 'schedule', labelKey: 'clients.leadScoreStepSchedule', points: 3, isEarned: Boolean(answers.fechaLlamada) || (Boolean(answers.horarioLlamada) && score >= maxScore), widthClass: 'flex-[3]' },
  ];
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t('clients.leadScoreLabel')}
        </span>
        <span className="text-2xl font-bold tabular-nums text-foreground" aria-live="polite">
          {score}
          <span className="text-sm font-medium text-muted-foreground">/{maxScore}</span>
        </span>
      </div>
      <div
        className="flex gap-1"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={maxScore}
        aria-valuenow={score}
        aria-label={t('clients.leadScoreValue', { score, max: maxScore })}
      >
        {segments.map((segment) => (
          <div key={segment.key} className={cn(segment.widthClass, 'min-w-0')}>
            <div
              className={cn(
                'h-2 rounded-full transition-colors duration-300',
                segment.isEarned ? (isMuted ? 'bg-muted-foreground/50' : 'bg-primary') : 'bg-muted',
              )}
            />
            <p
              className={cn(
                'mt-1.5 text-[11px] leading-tight truncate',
                segment.isEarned ? 'text-foreground font-medium' : 'text-muted-foreground',
              )}
            >
              +{segment.points} {t(segment.labelKey)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
