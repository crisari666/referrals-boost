import { useTranslation } from 'react-i18next';
import { getIntlLocaleTag } from '@/i18n/intl-locale';
import type { PurchaseDraftLot } from '@/features/lot-purchase/types/lot-purchase.types';

type LotSummaryCardProps = {
  lot: PurchaseDraftLot;
  compact?: boolean;
};

export function LotSummaryCard({ lot, compact = false }: LotSummaryCardProps) {
  const { t } = useTranslation();
  const locale = getIntlLocaleTag();

  return (
    <aside
      className={
        compact
          ? 'rounded-xl border border-border bg-card p-3'
          : 'rounded-2xl border border-border bg-card p-4 shadow-sm'
      }
    >
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {t('lotPurchase.lotProject')}
      </p>
      <p className="mt-0.5 font-extrabold text-foreground">{lot.projectTitle}</p>
      <p className="mt-3 text-sm font-bold text-foreground">
        {t('lotPurchase.lotSummary', { number: lot.lotNumber })}
      </p>
      <dl className="mt-2 space-y-1 text-sm text-muted-foreground">
        <div className="flex justify-between gap-2">
          <dt>{t('lotPurchase.lotArea', { area: Math.round(lot.lotArea) })}</dt>
        </div>
        {lot.stageName ? (
          <div className="flex justify-between gap-2">
            <dt>{t('lotPurchase.lotStage')}</dt>
            <dd className="font-medium text-foreground">{lot.stageName}</dd>
          </div>
        ) : null}
        <div className="flex justify-between gap-2">
          <dt>{t('lotPurchase.lotPrice')}</dt>
          <dd className="font-extrabold text-foreground">
            ${lot.price.toLocaleString(locale)}
          </dd>
        </div>
      </dl>
    </aside>
  );
}
