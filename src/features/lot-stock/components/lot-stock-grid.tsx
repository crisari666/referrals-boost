import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import {
  LOT_STATUS_CODE_KEY,
  LOT_STATUS_LABEL_KEY,
  LOT_STATUS_TONE,
} from '@/features/lot-stock/utils/lot-stock-status';
import { lotStockKey } from '@/features/lot-stock/utils/lot-stock.utils';
import type { PublicProjectLot } from '@/features/lot-stock/types/lot-stock.types';

type LotStockGridProps = {
  lots: PublicProjectLot[];
  selectedKey: string | null;
  onSelect: (lot: PublicProjectLot) => void;
};

export function LotStockGrid({ lots, selectedKey, onSelect }: LotStockGridProps) {
  const { t } = useTranslation();
  if (lots.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">{t('lotStock.empty')}</p>;
  }
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
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
              'flex min-h-14 cursor-pointer flex-col items-center justify-center rounded-xl border-2 px-1 py-2 transition-colors duration-200',
              'hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              tone.bg,
              tone.border,
              tone.text,
              isSelected && 'ring-2 ring-ring ring-offset-2',
            )}
          >
            <span className="text-sm font-extrabold leading-none">{lot.number}</span>
            <span className="mt-1 text-[10px] font-medium opacity-80">
              {t('lotStock.areaM2', { area: Math.round(lot.area) })}
            </span>
            <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide">
              {t(LOT_STATUS_CODE_KEY[lot.status])}
            </span>
          </button>
        );
      })}
    </div>
  );
}
