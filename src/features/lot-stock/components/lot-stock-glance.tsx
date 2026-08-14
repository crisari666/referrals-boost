import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import {
  LOT_STATUS_CODE_KEY,
  LOT_STATUS_LABEL_KEY,
  LOT_STATUS_TONE,
} from '@/features/lot-stock/utils/lot-stock-status';
import { lotStockKey } from '@/features/lot-stock/utils/lot-stock.utils';
import type { PublicProjectLot } from '@/features/lot-stock/types/lot-stock.types';

type LotStockGlanceProps = {
  lots: PublicProjectLot[];
  selectedKey: string | null;
  onSelect: (lot: PublicProjectLot) => void;
};

export function LotStockGlance({ lots, selectedKey, onSelect }: LotStockGlanceProps) {
  const { t } = useTranslation();
  if (lots.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">{t('lotStock.empty')}</p>;
  }
  return (
    <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12">
      {lots.map((lot) => {
        const tone = LOT_STATUS_TONE[lot.status];
        const isSelected = selectedKey === lotStockKey(lot);
        return (
          <button
            key={lotStockKey(lot)}
            type="button"
            onClick={() => onSelect(lot)}
            aria-pressed={isSelected}
            aria-label={`${lot.number} ${t(LOT_STATUS_LABEL_KEY[lot.status])}`}
            className={cn(
              'flex min-h-11 cursor-pointer flex-col items-center justify-center rounded-lg border-2 px-1 py-1.5 transition-colors duration-200',
              'hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              tone.bg,
              tone.border,
              tone.text,
              isSelected && 'ring-2 ring-ring ring-offset-2',
            )}
          >
            <span className="text-xs font-extrabold leading-none">{lot.number}</span>
            <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide opacity-80">
              {t(LOT_STATUS_CODE_KEY[lot.status])}
            </span>
          </button>
        );
      })}
    </div>
  );
}
