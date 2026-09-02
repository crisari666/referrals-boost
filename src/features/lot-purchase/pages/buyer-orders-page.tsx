import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LotPurchaseShell } from '@/features/lot-purchase/components/lot-purchase-shell';
import { loadBuyerOrders } from '@/features/lot-purchase/store/purchase-orders-slice';
import { ORDER_STATUS_LABEL_KEY } from '@/features/lot-purchase/utils/order-status';
import { useAppDispatch, useAppSelector } from '@/store';
import { getIntlLocaleTag } from '@/i18n/intl-locale';

export function BuyerOrdersPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const buyer = useAppSelector((state) => state.buyerAuth.session?.buyer);
  const orders = useAppSelector((state) => state.purchaseOrders.orders);
  const locale = getIntlLocaleTag();

  useEffect(() => {
    if (buyer?.id) {
      dispatch(loadBuyerOrders(buyer.id));
    }
  }, [buyer?.id, dispatch]);

  return (
    <LotPurchaseShell>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-extrabold text-foreground">
          {t('lotPurchase.ordersTitle')}
        </h1>
        {orders.length === 0 ? (
          <div className="mt-10 flex flex-col items-center gap-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <p className="text-sm text-muted-foreground">
              {t('lotPurchase.ordersEmpty')}
            </p>
            <Button asChild className="cursor-pointer">
              <Link to="/stock">{t('lotPurchase.ordersGoStore')}</Link>
            </Button>
          </div>
        ) : (
          <ul className="mt-6 space-y-3">
            {orders.map((order) => {
              const balance = Math.max(0, order.pricing.total - order.paidTotal);
              return (
                <li key={order.id}>
                  <Link
                    to={`/mis-compras/${order.id}`}
                    className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors duration-200 hover:border-primary/40"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-foreground">
                        {order.projectTitle}
                      </p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {t('lotPurchase.ordersLot', { number: order.lotNumber })}
                      </p>
                      <p className="mt-2 text-xs font-semibold text-primary">
                        {t(ORDER_STATUS_LABEL_KEY[order.status])}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t('lotPurchase.ordersPaid')}: $
                        {order.paidTotal.toLocaleString(locale)} ·{' '}
                        {t('lotPurchase.ordersBalance')}: $
                        {balance.toLocaleString(locale)}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-primary" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </LotPurchaseShell>
  );
}
