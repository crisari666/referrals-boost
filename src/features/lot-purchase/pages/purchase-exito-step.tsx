import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/store';
import { getIntlLocaleTag } from '@/i18n/intl-locale';

export function PurchaseExitoStep() {
  const { t } = useTranslation();
  const { projectId } = useParams<{ projectId: string }>();
  const draft = useAppSelector((state) => state.purchaseDraft.draft);
  const order = useAppSelector((state) => state.purchaseOrders.selectedOrder);
  const locale = getIntlLocaleTag();
  const orderId = draft?.orderId || order?.id;

  return (
    <div className="space-y-5 text-center sm:text-left">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary sm:mx-0">
        <CheckCircle2 className="h-8 w-8" />
      </div>
      <div>
        <h2 className="text-xl font-extrabold text-foreground">
          {t('lotPurchase.exitoTitle')}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('lotPurchase.exitoSubtitle')}
        </p>
        {orderId ? (
          <p className="mt-2 text-xs font-semibold text-muted-foreground">
            {t('lotPurchase.exitoOrderId', { id: orderId })}
          </p>
        ) : null}
        {order ? (
          <p className="mt-2 text-sm font-semibold text-foreground">
            {t('lotPurchase.ordersLot', { number: order.lotNumber })} · $
            {order.paidTotal.toLocaleString(locale)} {t('lotPurchase.ordersPaid').toLowerCase()}
          </p>
        ) : null}
      </div>
      <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
        <Button asChild className="cursor-pointer">
          <Link to={orderId ? `/mis-compras/${orderId}` : '/mis-compras'}>
            {t('lotPurchase.exitoGoOrders')}
          </Link>
        </Button>
        <Button asChild variant="outline" className="cursor-pointer">
          <Link to={projectId ? `/stock/${projectId}` : '/stock'}>
            {t('lotPurchase.storeOpen')}
          </Link>
        </Button>
      </div>
    </div>
  );
}
