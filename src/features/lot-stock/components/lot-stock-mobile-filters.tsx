import { useTranslation } from 'react-i18next';
import { Check, ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LOT_STATUS_LABEL_KEY,
  LOT_STATUS_TONE,
} from '@/features/lot-stock/utils/lot-stock-status';
import {
  LOT_STOCK_STATUS_ORDER,
  type LotStatusSummary,
  type ProjectLotStatus,
} from '@/features/lot-stock/types/lot-stock.types';
import { cn } from '@/lib/utils';

type StageOption = {
  key: string;
  name: string;
};

type LotStockStatusFilterProps = {
  summary: LotStatusSummary;
  statusFilter: ProjectLotStatus | 'all';
  onStatusChange: (status: ProjectLotStatus | 'all') => void;
  compact?: boolean;
};

export function LotStockStatusFilterList({
  summary,
  statusFilter,
  onStatusChange,
  compact = false,
}: LotStockStatusFilterProps) {
  const { t } = useTranslation();
  return (
    <div className={cn(compact ? 'flex flex-col gap-1.5' : 'flex flex-wrap items-center gap-2')}>
      {LOT_STOCK_STATUS_ORDER.map((status) => {
        const tone = LOT_STATUS_TONE[status];
        const count = summary[status];
        const isActive = statusFilter === status;
        return (
          <button
            key={status}
            type="button"
            onClick={() => onStatusChange(isActive ? 'all' : status)}
            className={cn(
              'inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm font-semibold transition-colors duration-200',
              !compact && 'w-auto rounded-full px-2.5 py-1 text-xs',
              compact && 'w-full',
              isActive
                ? `${tone.bg} ${tone.border} ${tone.text}`
                : 'border-border bg-card text-muted-foreground hover:text-foreground',
            )}
          >
            <span className={cn('h-2 w-2 shrink-0 rounded-full', tone.dot)} />
            <span className="flex-1">{t(LOT_STATUS_LABEL_KEY[status])}</span>
            <span className="tabular-nums">{count}</span>
            {isActive && compact ? <Check className="h-3.5 w-3.5" /> : null}
          </button>
        );
      })}
    </div>
  );
}

type LotStockMobileFiltersProps = {
  summary: LotStatusSummary;
  statusFilter: ProjectLotStatus | 'all';
  onStatusChange: (status: ProjectLotStatus | 'all') => void;
  showStageFilter: boolean;
  stageOptions: StageOption[];
  stageFilter: string | 'all';
  onStageChange: (stage: string | 'all') => void;
  hideStatusTrigger?: boolean;
};

export function LotStockMobileFilters({
  summary,
  statusFilter,
  onStatusChange,
  showStageFilter,
  stageOptions,
  stageFilter,
  onStageChange,
  hideStatusTrigger = false,
}: LotStockMobileFiltersProps) {
  const { t } = useTranslation();
  const activeCount =
    statusFilter === 'all' ? summary.available : summary[statusFilter];
  const activeLabel =
    statusFilter === 'all'
      ? t('lotStock.summaryAvailable')
      : t(LOT_STATUS_LABEL_KEY[statusFilter]);

  if (hideStatusTrigger && !showStageFilter) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 md:hidden">
      {!hideStatusTrigger ? (
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="inline-flex h-10 min-w-0 flex-1 cursor-pointer items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 text-sm font-semibold text-foreground transition-colors duration-200 hover:bg-secondary/60"
              aria-label={t('lotStock.summaryToggle')}
            >
              <span className="flex min-w-0 items-center gap-2">
                <span
                  className={cn(
                    'h-2 w-2 shrink-0 rounded-full',
                    statusFilter === 'all'
                      ? LOT_STATUS_TONE.available.dot
                      : LOT_STATUS_TONE[statusFilter].dot,
                  )}
                />
                <span className="truncate">
                  {activeLabel}{' '}
                  <span className="tabular-nums text-muted-foreground">{activeCount}</span>
                </span>
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-[min(100vw-2rem,20rem)] p-2">
            <p className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              {t('lotStock.summaryTitle')}
            </p>
            <LotStockStatusFilterList
              summary={summary}
              statusFilter={statusFilter}
              onStatusChange={onStatusChange}
              compact
            />
          </PopoverContent>
        </Popover>
      ) : null}
      {showStageFilter ? (
        <Select
          value={stageFilter}
          onValueChange={(value) => onStageChange(value as string | 'all')}
        >
          <SelectTrigger
            className={cn(
              'cursor-pointer',
              hideStatusTrigger ? 'h-8 w-full text-xs' : 'h-10 w-[42%] min-w-[7.5rem]',
            )}
          >
            <SelectValue placeholder={t('lotStock.filterAllStages')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('lotStock.filterAllStages')}</SelectItem>
            {stageOptions.map((stage) => (
              <SelectItem key={stage.key} value={stage.key}>
                {stage.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}
    </div>
  );
}
