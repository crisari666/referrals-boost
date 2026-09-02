import { useCallback, useEffect } from 'react';
import { Link, Navigate, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { LotSummaryCard } from '@/features/lot-purchase/components/lot-summary-card';
import { PurchaseStepper } from '@/features/lot-purchase/components/purchase-stepper';
import { ReserveCountdownBanner } from '@/features/lot-purchase/components/reserve-countdown-banner';
import {
  clearPurchaseDraft,
  startPurchaseDraft,
} from '@/features/lot-purchase/store/purchase-draft-slice';
import {
  PURCHASE_WIZARD_STEPS,
  type PurchaseWizardStep,
} from '@/features/lot-purchase/types/lot-purchase.types';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchLotStock, selectLotStock } from '@/features/lot-stock/store/lot-stock-slice';

function resolveWizardStep(pathname: string): PurchaseWizardStep {
  const segment = pathname.split('/').filter(Boolean).pop() ?? 'resumen';
  if ((PURCHASE_WIZARD_STEPS as string[]).includes(segment)) {
    return segment as PurchaseWizardStep;
  }
  return 'resumen';
}

export function PurchaseWizardLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { projectId, lotId } = useParams<{ projectId: string; lotId: string }>();
  const draft = useAppSelector((state) => state.purchaseDraft.draft);
  const { lots, projectTitle } = useAppSelector(selectLotStock);
  const step = resolveWizardStep(location.pathname);

  useEffect(() => {
    if (!projectId) return;
    void dispatch(fetchLotStock(projectId));
  }, [dispatch, projectId]);

  useEffect(() => {
    if (!projectId || !lotId) return;
    if (draft?.lot.lotId === lotId && draft.lot.projectId === projectId) return;
    const lot = lots.find((item) => item.id === lotId);
    if (!lot || lot.status !== 'available') return;
    dispatch(
      startPurchaseDraft({
        projectId,
        projectTitle: projectTitle || draft?.lot.projectTitle || '',
        lotId: lot.id,
        lotNumber: lot.number,
        lotArea: lot.area,
        price: lot.price,
        stageName: lot.stageName || '',
      }),
    );
  }, [dispatch, draft, lotId, lots, projectId, projectTitle]);

  const handleExpired = useCallback(() => {
    dispatch(clearPurchaseDraft());
    if (projectId) {
      navigate(`/stock/${projectId}`);
    } else {
      navigate('/stock');
    }
  }, [dispatch, navigate, projectId]);

  if (!projectId || !lotId) {
    return <Navigate to="/stock" replace />;
  }

  if (!draft || draft.lot.lotId !== lotId) {
    if (lots.length === 0) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
          <p className="text-sm text-muted-foreground">{t('lotStock.loading')}</p>
        </div>
      );
    }
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-4">
        <p className="text-sm text-muted-foreground">{t('lotPurchase.draftMissing')}</p>
        <Link
          to={`/stock/${projectId}`}
          className="cursor-pointer text-sm font-semibold text-primary transition-opacity duration-200 hover:opacity-80"
        >
          {t('lotPurchase.selectBack')}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Link
            to={`/stock/${projectId}`}
            className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-secondary transition-colors duration-200 hover:bg-secondary/80"
            aria-label={t('lotPurchase.back')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              {t('lotPurchase.brand')}
            </p>
            <h1 className="truncate text-sm font-extrabold text-foreground">
              {t('lotPurchase.wizardTitle')}
            </h1>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          {step !== 'exito' ? (
            <ReserveCountdownBanner
              expiresAt={draft.expiresAt}
              onExpired={handleExpired}
            />
          ) : null}
          <PurchaseStepper current={step} />
          <Outlet />
        </div>
        <div className="hidden lg:block">
          <div className="sticky top-24">
            <LotSummaryCard lot={draft.lot} />
          </div>
        </div>
        <div className="lg:hidden">
          <LotSummaryCard lot={draft.lot} compact />
        </div>
      </div>
    </div>
  );
}
