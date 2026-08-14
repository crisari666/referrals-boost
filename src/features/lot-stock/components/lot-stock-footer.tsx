import { Building2, LayoutGrid, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { ProjectLotKind } from '@/features/lot-stock/types/lot-stock.types';

type LotStockFooterProps = {
  kind: ProjectLotKind;
  onKindChange: (kind: ProjectLotKind) => void;
  onOpenSettings: () => void;
};

export function LotStockFooter({ kind, onKindChange, onOpenSettings }: LotStockFooterProps) {
  const { t } = useTranslation();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-2 py-1.5 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-around">
        <button
          type="button"
          onClick={() => onKindChange('lot')}
          className={cn(
            'flex min-h-11 min-w-20 cursor-pointer flex-col items-center justify-center rounded-lg px-4 py-1 transition-colors duration-200',
            kind === 'lot' ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <LayoutGrid className="h-5 w-5" />
          <span className="mt-0.5 text-[10px] font-semibold">{t('lotStock.kindLots')}</span>
        </button>
        <button
          type="button"
          onClick={() => onKindChange('commercial')}
          className={cn(
            'flex min-h-11 min-w-20 cursor-pointer flex-col items-center justify-center rounded-lg px-4 py-1 transition-colors duration-200',
            kind === 'commercial' ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <Building2 className="h-5 w-5" />
          <span className="mt-0.5 text-[10px] font-semibold">{t('lotStock.kindCommercial')}</span>
        </button>
        <button
          type="button"
          onClick={onOpenSettings}
          className="flex min-h-11 min-w-20 cursor-pointer flex-col items-center justify-center rounded-lg px-4 py-1 text-muted-foreground transition-colors duration-200 hover:text-foreground"
          aria-label={t('lotStock.settings')}
        >
          <Settings className="h-5 w-5" />
          <span className="mt-0.5 text-[10px] font-semibold">{t('lotStock.settings')}</span>
        </button>
      </div>
    </nav>
  );
}
