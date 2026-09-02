import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LotPurchaseShell } from '@/features/lot-purchase/components/lot-purchase-shell';
import {
  loadOrderById,
  payMockInstallment,
} from '@/features/lot-purchase/store/purchase-orders-slice';
import { ORDER_STATUS_LABEL_KEY } from '@/features/lot-purchase/utils/order-status';
import { useAppDispatch, useAppSelector } from '@/store';
import { getIntlLocaleTag } from '@/i18n/intl-locale';

export function BuyerOrderDetailPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { orderId } = useParams<{ orderId: string }>();
  const order = useAppSelector((state) => state.purchaseOrders.selectedOrder);
  const error = useAppSelector((state) => state.purchaseOrders.error);
  const locale = getIntlLocaleTag();

  useEffect(() => {
    if (orderId) {
      dispatch(loadOrderById(orderId));
    }
  }, [dispatch, orderId]);

  return (
    <LotPurchaseShell>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Link
          to="/mis-compras"
          className="mb-4 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors duration-200 hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('lotPurchase.orderBack')}
        </Link>
        {!order || error === 'ORDER_NOT_FOUND' ? (
          <p className="text-sm text-muted-foreground">
            {t('lotPurchase.ordersEmpty')}
          </p>
        ) : (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-extrabold text-foreground">
                {t('lotPurchase.orderDetailTitle')}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {order.projectTitle} ·{' '}
                {t('lotPurchase.ordersLot', { number: order.lotNumber })}
              </p>
              <p className="mt-2 text-sm font-semibold text-primary">
                {t(ORDER_STATUS_LABEL_KEY[order.status])}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">
                    {t('lotPurchase.pagoTotal')}
                  </dt>
                  <dd className="font-bold">
                    ${order.pricing.total.toLocaleString(locale)}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">
                    {t('lotPurchase.ordersPaid')}
                  </dt>
                  <dd className="font-bold">
                    ${order.paidTotal.toLocaleString(locale)}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">
                    {t('lotPurchase.ordersBalance')}
                  </dt>
                  <dd className="font-bold">
                    $
                    {Math.max(
                      0,
                      order.pricing.total - order.paidTotal,
                    ).toLocaleString(locale)}
                  </dd>
                </div>
              </dl>
            </div>
            <section>
              <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                {t('lotPurchase.orderPayments')}
              </h2>
              <ul className="mt-3 space-y-2">
                {order.payments.map((payment) => (
                  <li
                    key={payment.id}
                    className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2 text-sm"
                  >
                    <span>
                      {payment.label === 'down_payment'
                        ? t('lotPurchase.paymentDown')
                        : t('lotPurchase.paymentInstallment')}
                      <span className="ml-2 text-xs text-muted-foreground">
                        {new Date(payment.paidAt).toLocaleString(locale, {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </span>
                    </span>
                    <span className="font-semibold">
                      ${payment.amount.toLocaleString(locale)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
            {order.status !== 'paid' ? (
              <Button
                type="button"
                className="cursor-pointer"
                onClick={() => dispatch(payMockInstallment(order.id))}
              >
                {t('lotPurchase.orderPayNext')}
              </Button>
            ) : null}
          </div>
        )}
      </div>
    </LotPurchaseShell>
  );
}
