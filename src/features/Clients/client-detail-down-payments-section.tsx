import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CreditCard, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  addPaymentFeeThunk,
  clearDownPayments,
  createDownPaymentThunk,
  fetchDownPaymentsByCustomer,
} from '@/features/Clients/store/down-payments-slice';
import {
  fetchDownPaymentContractBlob,
  fetchFeeEvidenceBlob,
} from '@/services/down-paymentsService';

const FILE_ACCEPT = 'image/jpeg,image/png,image/webp,application/pdf';

const PAYMENT_METHODS = [
  'Tarjeta de Credito',
  'Transferencia Bancaria',
  'Efectivo',
] as const;

function formatCurrency(value: number): string {
  return value.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  });
}

export function ClientDetailDownPaymentsSection() {
  const { t } = useTranslation();
  const { id: customerId } = useParams();
  const dispatch = useAppDispatch();
  const isPhysical = useAppSelector((s) => s.auth.user?.physical === true);
  const clientName = useAppSelector((s) => {
    const detail = s.clients.vendorCreationDetail;
    const c = detail?.customer;
    if (!c) return '';
    return `${c.name ?? ''} ${c.lastName ?? ''}`.trim();
  });
  const projects = useAppSelector((s) => s.projects.list);
  const items = useAppSelector((s) => s.downPayments.items);
  const isLoading = useAppSelector((s) => s.downPayments.isLoading);
  const isSaving = useAppSelector((s) => s.downPayments.isSaving);
  const error = useAppSelector((s) => s.downPayments.error);
  const [projectId, setProjectId] = useState('');
  const [lotNumber, setLotNumber] = useState('');
  const [expectedValue, setExpectedValue] = useState('');
  const [firstPaymentValue, setFirstPaymentValue] = useState('');
  const [datePayment, setDatePayment] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [feeValue, setFeeValue] = useState('');
  const [feeDate, setFeeDate] = useState('');
  const [feeReceipt, setFeeReceipt] = useState('');
  const [feeMethod, setFeeMethod] = useState('');
  const [feeNotes, setFeeNotes] = useState('');
  const [feeEvidence, setFeeEvidence] = useState<File | null>(null);
  const [feeTargetId, setFeeTargetId] = useState<string | null>(null);
  const contractRef = useRef<HTMLInputElement>(null);
  const evidenceRef = useRef<HTMLInputElement>(null);
  const feeEvidenceRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!customerId || !isPhysical) return;
    void dispatch(fetchDownPaymentsByCustomer(customerId));
    return () => {
      dispatch(clearDownPayments());
    };
  }, [customerId, dispatch, isPhysical]);

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === projectId) ?? null,
    [projects, projectId],
  );

  useEffect(() => {
    if (!selectedProject) return;
    setExpectedValue(String(selectedProject.separation ?? 0));
  }, [selectedProject?.id]);

  const activeForProject = useMemo(
    () => (projectId ? items.find((d) => d.projectId === projectId) ?? null : null),
    [items, projectId],
  );

  const feeTarget = useMemo(
    () => items.find((d) => d.id === feeTargetId) ?? null,
    [items, feeTargetId],
  );

  useEffect(() => {
    if (activeForProject && activeForProject.remaining > 0) {
      setFeeTargetId(activeForProject.id);
      return;
    }
    if (activeForProject && activeForProject.remaining <= 0) {
      setFeeTargetId(null);
    }
  }, [activeForProject?.id, activeForProject?.remaining]);

  if (!isPhysical || !customerId) return null;

  const openBlob = async (fetchBlob: () => Promise<Blob>) => {
    const blob = await fetchBlob();
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener,noreferrer');
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  const handleCreate = async () => {
    if (!selectedProject || !contractFile || !lotNumber || !expectedValue || !firstPaymentValue || !datePayment) {
      return;
    }
    const result = await dispatch(
      createDownPaymentThunk({
        body: {
          customerId,
          projectId: selectedProject.id,
          lotNumber: lotNumber.trim(),
          expectedValue: Number(expectedValue),
          firstPaymentValue: Number(firstPaymentValue),
          datePayment: `${datePayment}T12:00:00.000Z`,
          receiptNumber: receiptNumber || undefined,
          paymentMethod: paymentMethod || undefined,
          notes: notes || undefined,
          customerName: clientName || undefined,
          projectName: selectedProject.title,
        },
        contractFile,
        evidenceFile: evidenceFile ?? undefined,
      }),
    );
    if (createDownPaymentThunk.fulfilled.match(result)) {
      setLotNumber('');
      setFirstPaymentValue('');
      setDatePayment('');
      setReceiptNumber('');
      setPaymentMethod('');
      setNotes('');
      setContractFile(null);
      setEvidenceFile(null);
      if (contractRef.current) contractRef.current.value = '';
      if (evidenceRef.current) evidenceRef.current.value = '';
    }
  };

  const handleAddFee = async () => {
    if (!feeTarget || feeTarget.remaining <= 0 || !feeValue || !feeDate) return;
    const result = await dispatch(
      addPaymentFeeThunk({
        downPaymentId: feeTarget.id,
        body: {
          paymentValue: Number(feeValue),
          datePayment: `${feeDate}T12:00:00.000Z`,
          receiptNumber: feeReceipt || undefined,
          paymentMethod: feeMethod || undefined,
          notes: feeNotes || undefined,
        },
        evidenceFile: feeEvidence ?? undefined,
      }),
    );
    if (addPaymentFeeThunk.fulfilled.match(result)) {
      setFeeValue('');
      setFeeDate('');
      setFeeReceipt('');
      setFeeMethod('');
      setFeeNotes('');
      setFeeEvidence(null);
      if (feeEvidenceRef.current) feeEvidenceRef.current.value = '';
      if (result.payload.remaining <= 0) {
        setFeeTargetId(null);
      }
    }
  };

  return (
    <section className="rounded-xl border bg-card p-4 space-y-4">
      <div className="flex items-center gap-2">
        <CreditCard className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold">{t('downPayments.title')}</h2>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="space-y-2">
        <Label>{t('downPayments.project')}</Label>
        <Select value={projectId} onValueChange={setProjectId}>
          <SelectTrigger>
            <SelectValue placeholder={t('downPayments.project')} />
          </SelectTrigger>
          <SelectContent>
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {projectId ? (
          <p className="text-xs text-muted-foreground">
            {activeForProject
              ? activeForProject.status === 'completed'
                ? t('downPayments.completedBanner')
                : t('downPayments.pendingFeesOnlyHint')
              : t('downPayments.onePerProjectHint')}
          </p>
        ) : null}
      </div>
      {projectId && !activeForProject ? (
        <div className="space-y-3 border-t pt-3">
          <h3 className="text-sm font-medium">{t('downPayments.createTitle')}</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <Label>{t('downPayments.expectedValue')}</Label>
              <Input
                type="number"
                min={1}
                value={expectedValue}
                onChange={(e) => setExpectedValue(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>{t('downPayments.firstPayment')}</Label>
              <Input
                type="number"
                min={1}
                value={firstPaymentValue}
                onChange={(e) => setFirstPaymentValue(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>{t('downPayments.lotNumber')}</Label>
              <Input value={lotNumber} onChange={(e) => setLotNumber(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <Label>{t('downPayments.datePayment')}</Label>
              <Input
                type="date"
                value={datePayment}
                onChange={(e) => setDatePayment(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>{t('downPayments.receiptNumber')}</Label>
              <Input value={receiptNumber} onChange={(e) => setReceiptNumber(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>{t('downPayments.paymentMethod')}</Label>
              <Select
                value={paymentMethod}
                onValueChange={setPaymentMethod}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('downPayments.paymentMethod')} />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <Label>{t('downPayments.notes')}</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>
          <div className="space-y-1">
            <Label>{t('downPayments.contractRequired')}</Label>
            <Input
              ref={contractRef}
              type="file"
              accept={FILE_ACCEPT}
              onChange={(e) => setContractFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <div className="space-y-1">
            <Label>{t('downPayments.evidenceOptional')}</Label>
            <Input
              ref={evidenceRef}
              type="file"
              accept={FILE_ACCEPT}
              onChange={(e) => setEvidenceFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <Button
            type="button"
            onClick={() => void handleCreate()}
            disabled={isSaving || !contractFile}
            className="cursor-pointer"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : t('downPayments.submitCreate')}
          </Button>
        </div>
      ) : null}
      {feeTarget && feeTarget.remaining > 0 ? (
        <div className="space-y-3 border-t pt-3">
          <h3 className="text-sm font-medium">{t('downPayments.addFeeTitle')}</h3>
          <p className="text-xs text-muted-foreground">
            {(feeTarget.projectName ??
              projects.find((p) => p.id === feeTarget.projectId)?.title ??
              feeTarget.projectId)}{' '}
            · {t('downPayments.lotNumber')} {feeTarget.lotNumber}
          </p>
          <p className="text-xs text-muted-foreground">
            {t('downPayments.expected')}: {formatCurrency(feeTarget.expectedValue)} ·{' '}
            {t('downPayments.paid')}: {formatCurrency(feeTarget.totalPaid)} ·{' '}
            {t('downPayments.remaining')}: {formatCurrency(feeTarget.remaining)}
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <Label>{t('downPayments.feePayment')}</Label>
              <Input
                type="number"
                min={1}
                max={feeTarget.remaining}
                value={feeValue}
                onChange={(e) => setFeeValue(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>{t('downPayments.datePayment')}</Label>
              <Input type="date" value={feeDate} onChange={(e) => setFeeDate(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>{t('downPayments.receiptNumber')}</Label>
              <Input value={feeReceipt} onChange={(e) => setFeeReceipt(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1">
            <Label>{t('downPayments.paymentMethod')}</Label>
            <Select value={feeMethod} onValueChange={setFeeMethod}>
              <SelectTrigger>
                <SelectValue placeholder={t('downPayments.paymentMethod')} />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>{t('downPayments.notes')}</Label>
            <Textarea value={feeNotes} onChange={(e) => setFeeNotes(e.target.value)} rows={2} />
          </div>
          <div className="space-y-1">
            <Label>{t('downPayments.evidenceOptional')}</Label>
            <Input
              ref={feeEvidenceRef}
              type="file"
              accept={FILE_ACCEPT}
              onChange={(e) => setFeeEvidence(e.target.files?.[0] ?? null)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={() => void handleAddFee()}
              disabled={isSaving || !feeValue || !feeDate}
              className="cursor-pointer"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : t('downPayments.submitFee')}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setFeeTargetId(null)}
              className="cursor-pointer"
            >
              {t('common.cancel')}
            </Button>
          </div>
        </div>
      ) : null}
      {activeForProject && activeForProject.remaining <= 0 ? (
        <p className="text-sm text-emerald-700">{t('downPayments.completedBanner')}</p>
      ) : null}
      <div className="border-t pt-3 space-y-2">
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('downPayments.empty')}</p>
        ) : (
          items.map((dp) => {
            const projectTitle =
              dp.projectName ?? projects.find((p) => p.id === dp.projectId)?.title ?? dp.projectId;
            const canAddFee = dp.remaining > 0;
            return (
              <div key={dp.id} className="rounded-lg border p-3 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">
                      {projectTitle} · {t('downPayments.lotNumber')} {dp.lotNumber}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t('downPayments.expected')}: {formatCurrency(dp.expectedValue)} ·{' '}
                      {t('downPayments.paid')}: {formatCurrency(dp.totalPaid)} ·{' '}
                      {t('downPayments.remaining')}: {formatCurrency(dp.remaining)} ·{' '}
                      {dp.remaining > 0
                        ? t('downPayments.pending')
                        : t('downPayments.completed')}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {canAddFee ? (
                      <Button
                        type="button"
                        size="sm"
                        variant={feeTargetId === dp.id ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => setFeeTargetId(dp.id)}
                      >
                        {t('downPayments.addFeeTitle')}
                      </Button>
                    ) : null}
                    {dp.hasContract ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="cursor-pointer"
                        onClick={() =>
                          void openBlob(() => fetchDownPaymentContractBlob(dp.id))
                        }
                      >
                        <FileText className="h-3.5 w-3.5 mr-1" />
                        {t('downPayments.viewContract')}
                      </Button>
                    ) : null}
                  </div>
                </div>
                {(dp.fees ?? []).length > 0 ? (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      {t('downPayments.fees')}
                    </p>
                    {dp.fees!.map((fee) => (
                      <div
                        key={fee.id}
                        className="flex flex-wrap items-center justify-between gap-2 text-xs"
                      >
                        <span>
                          {new Date(fee.datePayment).toLocaleDateString()} ·{' '}
                          {formatCurrency(fee.paymentValue)}
                        </span>
                        {fee.hasEvidence ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="cursor-pointer h-7"
                            onClick={() => void openBlob(() => fetchFeeEvidenceBlob(fee.id))}
                          >
                            {t('downPayments.viewEvidence')}
                          </Button>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
