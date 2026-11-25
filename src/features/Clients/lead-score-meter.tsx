import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { LeadConversationAnswers, LeadScoreSegment } from '@/services/leadConversationService.types';

type LeadScoreMeterProps = {
  score: number;
  maxScore: number;
  answers: LeadConversationAnswers;
  isMuted: boolean;
  /** V2 server-provided breakdown; when present it replaces the fixed V1 layout. */
  scoreSegments?: LeadScoreSegment[];
};

type ScoreSegment = {
  key: string;
  labelKey?: string;
  label?: string;
  points: number;
  isEarned: boolean;
  widthClass: string;
};

function buildV1Segments(answers: LeadConversationAnswers, score: number, maxScore: number): ScoreSegment[] {
  return [
    { key: 'plan', labelKey: 'clients.leadScoreStepPlan', points: 1, isEarned: Boolean(answers.rangoLote), widthClass: 'flex-[1]' },
    { key: 'payment', labelKey: 'clients.leadScoreStepPayment', points: 2, isEarned: Boolean(answers.formaPago), widthClass: 'flex-[2]' },
    { key: 'schedule', labelKey: 'clients.leadScoreStepSchedule', points: 3, isEarned: Boolean(answers.fechaLlamada) || (Boolean(answers.horarioLlamada) && score >= maxScore), widthClass: 'flex-[3]' },
  ];
}

function buildServerSegments(scoreSegments: LeadScoreSegment[]): ScoreSegment[] {
  return scoreSegments.map((segment) => ({
    key: segment.key,
    label: segment.label,
    points: segment.points,
    isEarned: segment.isEarned,
    widthClass: '',
  }));
}

/**
 * Segmented bar. V1 uses fixed step weights (+1 plan, +2 payment, +3 call);
 * V2 renders the server `scoreSegments`, each sized proportionally to its points.
 */
export function LeadScoreMeter({ score, maxScore, answers, isMuted, scoreSegments }: LeadScoreMeterProps) {
  const { t } = useTranslation();
  const hasServerSegments = scoreSegments !== undefined && scoreSegments.length > 0;
  const segments: ScoreSegment[] = hasServerSegments
    ? buildServerSegments(scoreSegments)
    : buildV1Segments(answers, score, maxScore);
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
          <div
            key={segment.key}
            className={cn(segment.widthClass, 'min-w-0')}
            style={hasServerSegments ? { flexGrow: Math.max(segment.points, 0.5), flexBasis: 0 } : undefined}
          >
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
              title={segment.label}
            >
              +{segment.points} {segment.labelKey ? t(segment.labelKey) : segment.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
