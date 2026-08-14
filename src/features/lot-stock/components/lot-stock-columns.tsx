import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getIntlLocaleTag } from '@/i18n/intl-locale';
import { LOT_STATUS_CODE_KEY, LOT_STATUS_LABEL_KEY, LOT_STATUS_TONE } from '@/features/lot-stock/utils/lot-stock-status';
import { columnRangeLabel, lotStockKey } from '@/features/lot-stock/utils/lot-stock.utils';
import type { LotStockColumnNav, PublicProjectLot } from '@/features/lot-stock/types/lot-stock.types';

type LotStockColumnsProps = {
  columns: PublicProjectLot[][];
  columnNav: LotStockColumnNav;
  pageIndex: number;
  onPageIndexChange: (index: number) => void;
};

function LotColumnTable({ lots, title }: { lots: PublicProjectLot[]; title: string }) {
  const { t } = useTranslation();
  const intlLocale = getIntlLocaleTag();
  return (
    <section className="min-w-[280px] flex-1 rounded-xl border border-border bg-card sm:min-w-[320px]">
      <table className="w-full caption-bottom text-xs">
        <thead className="sticky top-0 z-10 bg-card shadow-[0_1px_0_hsl(var(--border))]">
          <tr>
            <th colSpan={5} className="px-3 py-2 text-left text-xs font-bold text-foreground">
              {title}
            </th>
          </tr>
          <tr>
            <th className="px-2 py-2 text-left font-semibold text-muted-foreground">{t('lotStock.colNumber')}</th>
            <th className="px-2 py-2 text-right font-semibold text-muted-foreground">{t('lotStock.colArea')}</th>
            <th className="px-2 py-2 text-right font-semibold text-muted-foreground">{t('lotStock.colPrice')}</th>
            <th className="px-2 py-2 text-left font-semibold text-muted-foreground">{t('lotStock.colVentor')}</th>
            <th className="px-2 py-2 text-left font-semibold text-muted-foreground" title={t('lotStock.colStatus')}>
              {t('lotStock.colStatus').charAt(0)}
            </th>
          </tr>
        </thead>
        <tbody>
          {lots.map((lot) => {
            const tone = LOT_STATUS_TONE[lot.status];
            return (
              <tr key={lotStockKey(lot)} className={cn('border-b border-border/60', tone.bg, tone.text)}>
                <td className="px-2 py-1.5 font-extrabold">{lot.number}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{Math.round(lot.area)}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">
                  {lot.price.toLocaleString(intlLocale)}
                </td>
                <td className="max-w-[7rem] truncate px-2 py-1.5">
                  {lot.ventorName?.trim() ? lot.ventorName : t('lotStock.noVentor')}
                </td>
                <td
                  className="px-2 py-1.5 text-center font-extrabold"
                  title={
                    lot.status === 'hold' && lot.holdUntil
                      ? `${t(LOT_STATUS_LABEL_KEY[lot.status])} · ${t('lotStock.holdUntilLabel')} ${new Date(lot.holdUntil).toLocaleString(intlLocale, { dateStyle: 'short', timeStyle: 'short' })}`
                      : t(LOT_STATUS_LABEL_KEY[lot.status])
                  }
                >
                  {t(LOT_STATUS_CODE_KEY[lot.status])}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

function ColumnsScroll({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-max min-w-full flex-nowrap items-start gap-3 pb-2">
      {children}
    </div>
  );
}

export function LotStockColumns({
  columns,
  columnNav,
  pageIndex,
  onPageIndexChange,
}: LotStockColumnsProps) {
  const { t } = useTranslation();
  if (columns.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">{t('lotStock.empty')}</p>;
  }
  if (columnNav === 'pages') {
    const safeIndex = Math.min(pageIndex, columns.length - 1);
    const column = columns[safeIndex] ?? [];
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="cursor-pointer"
            disabled={safeIndex <= 0}
            aria-label={t('lotStock.prevSection')}
            onClick={() => onPageIndexChange(Math.max(0, safeIndex - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <p className="text-sm font-semibold text-foreground">
            {t('lotStock.pageOf', { current: safeIndex + 1, total: columns.length })}
          </p>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="cursor-pointer"
            disabled={safeIndex >= columns.length - 1}
            aria-label={t('lotStock.nextSection')}
            onClick={() => onPageIndexChange(Math.min(columns.length - 1, safeIndex + 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <ColumnsScroll>
          <LotColumnTable
            lots={column}
            title={t('lotStock.columnSection', { range: columnRangeLabel(column) })}
          />
        </ColumnsScroll>
      </div>
    );
  }
  return (
    <ColumnsScroll>
      {columns.map((column) => (
        <LotColumnTable
          key={columnRangeLabel(column)}
          lots={column}
          title={t('lotStock.columnSection', { range: columnRangeLabel(column) })}
        />
      ))}
    </ColumnsScroll>
  );
}
