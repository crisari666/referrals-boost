import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ExternalLink, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { setDraftLegalAccepted } from '@/features/lot-purchase/store/purchase-draft-slice';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchProjects } from '@/store/projectsSlice';
import { getRagIngestAssetUrl } from '@/services/projectsService';

export function PurchaseLegalStep() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { projectId, lotId } = useParams<{ projectId: string; lotId: string }>();
  const isAuthenticated = useAppSelector(
    (state) => state.buyerAuth.isAuthenticated,
  );
  const draft = useAppSelector((state) => state.purchaseDraft.draft);
  const projects = useAppSelector((state) => state.projects.list);
  const [acceptedRead, setAcceptedRead] = useState(false);
  const [acceptedDraft, setAcceptedDraft] = useState(false);

  useEffect(() => {
    if (projects.length === 0) {
      void dispatch(fetchProjects());
    }
  }, [dispatch, projects.length]);

  const project = useMemo(
    () => projects.find((item) => item.id === projectId),
    [projectId, projects],
  );
  const legalDocs = project?.legalDocuments ?? [];

  if (!isAuthenticated) {
    return <Navigate to={`/comprar/${projectId}/${lotId}/cuenta`} replace />;
  }
  if (!draft?.buyerData) {
    return <Navigate to={`/comprar/${projectId}/${lotId}/datos`} replace />;
  }

  const canContinue = acceptedRead && acceptedDraft;

  const handleContinue = () => {
    if (!canContinue) return;
    dispatch(setDraftLegalAccepted(true));
    navigate(`/comprar/${projectId}/${lotId}/pago`);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-extrabold text-foreground">
          {t('lotPurchase.legalTitle')}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('lotPurchase.legalSubtitle')}
        </p>
      </div>
      {legalDocs.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
          {t('lotPurchase.legalEmpty')}
        </p>
      ) : (
        <ul className="space-y-2">
          {legalDocs.map((doc) => {
            const href = getRagIngestAssetUrl(doc.fileName);
            return (
              <li key={doc.id}>
                <a
                  href={href || undefined}
                  target="_blank"
                  rel="noreferrer"
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-colors duration-200 hover:border-primary/40"
                >
                  <FileText className="h-4 w-4 shrink-0 text-primary" />
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
                    {t(doc.labelKey)}
                  </span>
                  <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="sr-only">{t('lotPurchase.legalOpen')}</span>
                </a>
              </li>
            );
          })}
        </ul>
      )}
      <p className="text-xs text-muted-foreground">{t('lotPurchase.legalNote')}</p>
      <div className="space-y-3 rounded-xl border border-border bg-card p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            id="legal-read"
            checked={acceptedRead}
            onCheckedChange={(value) => setAcceptedRead(value === true)}
            className="mt-0.5 cursor-pointer"
          />
          <Label htmlFor="legal-read" className="cursor-pointer text-sm font-normal leading-snug">
            {t('lotPurchase.legalAcceptRead')}
          </Label>
        </div>
        <div className="flex items-start gap-3">
          <Checkbox
            id="legal-draft"
            checked={acceptedDraft}
            onCheckedChange={(value) => setAcceptedDraft(value === true)}
            className="mt-0.5 cursor-pointer"
          />
          <Label htmlFor="legal-draft" className="cursor-pointer text-sm font-normal leading-snug">
            {t('lotPurchase.legalAcceptDraft')}
          </Label>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          className="cursor-pointer"
          disabled={!canContinue}
          onClick={handleContinue}
        >
          {t('lotPurchase.continue')}
        </Button>
        <Button asChild variant="outline" className="cursor-pointer">
          <Link to={`/comprar/${projectId}/${lotId}/datos`}>
            {t('lotPurchase.back')}
          </Link>
        </Button>
      </div>
    </div>
  );
}
