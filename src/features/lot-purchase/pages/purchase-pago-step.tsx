import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { setDraftOrderId } from '@/features/lot-purchase/store/purchase-draft-slice';
import { placePurchaseOrder } from '@/features/lot-purchase/store/purchase-orders-slice';
import { buildPricingFromTotal } from '@/features/lot-purchase/services/lot-purchase.service';
import { useAppDispatch, useAppSelector, store } from '@/store';
import { getIntlLocaleTag } from '@/i18n/intl-locale';

export function PurchasePagoStep() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { projectId, lotId } = useParams<{ projectId: string; lotId: string }>();
  const isAuthenticated = useAppSelector(
    (state) => state.buyerAuth.isAuthenticated,
  );
  const buyer = useAppSelector((state) => state.buyerAuth.session?.buyer);
  const draft = useAppSelector((state) => state.purchaseDraft.draft);
  const locale = getIntlLocaleTag();
  const pricing =
    draft?.pricing ??
    (draft ? buildPricingFromTotal(draft.lot.price) : null);

  if (!isAuthenticated || !buyer) {
    return <Navigate to={`/comprar/${projectId}/${lotId}/cuenta`} replace />;
  }
  if (!draft?.buyerData) {
    return <Navigate to={`/comprar/${projectId}/${lotId}/datos`} replace />;
  }
  if (!draft.legalAccepted) {
    return <Navigate to={`/comprar/${projectId}/${lotId}/legal`} replace />;
  }
  if (!pricing) return null;

  const handlePay = (): void => {
    const buyerProfile = {
      ...buyer,
      fullName: draft.buyerData!.fullName,
      documentId: draft.buyerData!.documentId,
      city: draft.buyerData!.city,
      email: draft.buyerData!.email,
      phone: draft.buyerData!.phone,
    };
    dispatch(
      placePurchaseOrder({
        lot: draft.lot,
        buyer: buyerProfile,
        pricing,
        legalAcceptedAt: new Date().toISOString(),
      }),
    );
    const orderId = store.getState().purchaseOrders.selectedOrder?.id;
    if (orderId) {
      dispatch(setDraftOrderId(orderId));
    }
    navigate(`/comprar/${projectId}/${lotId}/exito`);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-extrabold text-foreground">
          {t('lotPurchase.pagoTitle')}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('lotPurchase.pagoSubtitle')}
        </p>
      </div>
      <div className="rounded-2xl border border-border bg-card p-4">
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">{t('lotPurchase.pagoTotal')}</dt>
            <dd className="font-extrabold text-foreground">
              ${pricing.total.toLocaleString(locale)}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">{t('lotPurchase.pagoDown')}</dt>
            <dd className="font-semibold text-foreground">
              ${pricing.downPayment.toLocaleString(locale)}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">
              {t('lotPurchase.pagoInstallments', {
                count: pricing.installmentCount,
              })}
            </dt>
            <dd className="font-semibold text-foreground">
              ${pricing.installmentAmount.toLocaleString(locale)}
            </dd>
          </div>
        </dl>
      </div>
      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <Lock className="h-3.5 w-3.5" />
        {t('lotPurchase.pagoSecureNote')}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button type="button" className="cursor-pointer" onClick={handlePay}>
          {t('lotPurchase.pagoSimulate')}
        </Button>
        <Button asChild variant="outline" className="cursor-pointer">
          <Link to={`/comprar/${projectId}/${lotId}/legal`}>
            {t('lotPurchase.back')}
          </Link>
        </Button>
      </div>
    </div>
  );
}
