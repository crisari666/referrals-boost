import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LotSummaryCard } from '@/features/lot-purchase/components/lot-summary-card';
import { useAppSelector } from '@/store';
import { getIntlLocaleTag } from '@/i18n/intl-locale';

export function PurchaseResumenStep() {
  const { t } = useTranslation();
  const { projectId, lotId } = useParams<{ projectId: string; lotId: string }>();
  const draft = useAppSelector((state) => state.purchaseDraft.draft);
  const locale = getIntlLocaleTag();

  if (!draft || !projectId || !lotId) return null;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-extrabold text-foreground">
          {t('lotPurchase.stepResumen')}
        </h2>
        <p className="mt-1 flex items-start gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          {t('lotPurchase.accountSubtitle')}
        </p>
      </div>
      <div className="lg:hidden">
        <LotSummaryCard lot={draft.lot} />
      </div>
      <div className="rounded-2xl border border-border bg-card p-4">
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">{t('lotPurchase.lotProject')}</dt>
            <dd className="font-semibold text-foreground">{draft.lot.projectTitle}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">
              {t('lotPurchase.lotSummary', { number: draft.lot.lotNumber })}
            </dt>
            <dd className="font-semibold text-foreground">
              {t('lotPurchase.lotArea', { area: Math.round(draft.lot.lotArea) })}
            </dd>
          </div>
          <div className="flex justify-between gap-3 border-t border-border pt-2">
            <dt className="font-semibold text-foreground">{t('lotPurchase.lotPrice')}</dt>
            <dd className="text-lg font-extrabold text-foreground">
              ${draft.lot.price.toLocaleString(locale)}
            </dd>
          </div>
        </dl>
      </div>
      <Button asChild className="w-full cursor-pointer sm:w-auto">
        <Link to={`/comprar/${projectId}/${lotId}/cuenta`}>
          {t('lotPurchase.continue')}
        </Link>
      </Button>
    </div>
  );
}
