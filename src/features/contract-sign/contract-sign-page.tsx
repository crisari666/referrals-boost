import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { useMemo, useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { useSearchParams } from 'react-router-dom';
import { dataUrlToUint8Array, mergePngSignatureIntoPdf } from '@/lib/merge-signature-into-pdf';
import {
  drivePdfLinkToPreviewUrl,
  getAgentContractByToken,
  getAgentContractSignQueryParam,
  getContractPdfArrayBuffer,
  postSignedContractPdf,
} from '@/services/agentContractSignService';
import { toast } from 'sonner';
import { AlreadySignedContractView } from './already-signed-contract-view';
import { ContractSessionErrorState } from './contract-session-error-state';
import { ContractSignatureDialog } from './contract-signature-dialog';
import { ContractSignPageLoading } from './contract-sign-page-loading';
import { contractSignQueryKey } from './contract-sign-query-key';
import { InvalidSignLinkState } from './invalid-sign-link-state';
import { UnsignedContractMainCard } from './unsigned-contract-main-card';
import { UnsignedContractNoPreviewCard } from './unsigned-contract-no-preview-card';

const ContractSignPage = () => {
  const [searchParams] = useSearchParams();
  const paramName = getAgentContractSignQueryParam();
  const token = searchParams.get(paramName);
  const sigRef = useRef<SignatureCanvas>(null);
  const queryClient = useQueryClient();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [signDialogOpen, setSignDialogOpen] = useState(false);

  const contractQuery = useQuery({
    queryKey: contractSignQueryKey(token),
    queryFn: () => getAgentContractByToken(token!),
    enabled: Boolean(token),
  });

  const pdfQuery = useQuery({
    queryKey: [...contractSignQueryKey(token), 'pdf'] as const,
    queryFn: () => getContractPdfArrayBuffer(token!),
    enabled: Boolean(token) && contractQuery.isSuccess && !contractQuery.data?.signed,
  });

  const previewSrc = useMemo(() => {
    const link = contractQuery.data?.pdfLink;
    if (!link) return null;
    return drivePdfLinkToPreviewUrl(link);
  }, [contractQuery.data?.pdfLink]);

  const signedPreviewSrc = useMemo(() => {
    const link = contractQuery.data?.signedPdfLink ?? contractQuery.data?.pdfLink;
    if (!link) return null;
    return drivePdfLinkToPreviewUrl(link);
  }, [contractQuery.data?.signedPdfLink, contractQuery.data?.pdfLink]);

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!token) throw new Error('Missing sign token');
      const pad = sigRef.current;
      if (!pad || pad.isEmpty()) {
        throw new Error('Dibuja tu firma antes de confirmar.');
      }
      const trimmed = pad.getTrimmedCanvas();
      const dataUrl = trimmed.toDataURL('image/png');
      const pngBytes = dataUrlToUint8Array(dataUrl);
      const pdfBytes = pdfQuery.data;
      if (!pdfBytes) throw new Error('El PDF aún no está listo.');
      const merged = await mergePngSignatureIntoPdf(pdfBytes, pngBytes);
      const mergedCopy = new Uint8Array(merged);
      return postSignedContractPdf(
        token,
        new Blob([mergedCopy], { type: 'application/pdf' })
      );
    },
    onSuccess: () => {
      setSubmitError(null);
      toast.success('Contrato firmado correctamente.');
      if (token) {
        queryClient.invalidateQueries({ queryKey: contractSignQueryKey(token) });
      }
      setSignDialogOpen(false);
      sigRef.current?.clear();
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof Error
          ? err.message
          : isAxiosError(err)
            ? (err.response?.data as { message?: string })?.message ?? err.message
            : 'No se pudo enviar el documento firmado.';
      setSubmitError(msg);
      toast.error(msg);
    },
  });

  const handleSignDialogOpenChange = (open: boolean) => {
    setSignDialogOpen(open);
    if (!open) {
      sigRef.current?.clear();
      setSubmitError(null);
    }
  };

  const pdfReady = Boolean(pdfQuery.data) && !pdfQuery.isLoading && !pdfQuery.isError;

  if (!token) {
    return <InvalidSignLinkState />;
  }

  if (contractQuery.isLoading) {
    return <ContractSignPageLoading />;
  }

  if (contractQuery.isError) {
    const status = isAxiosError(contractQuery.error)
      ? contractQuery.error.response?.status
      : undefined;
    const message =
      status === 404
        ? 'Esta sesión de firma no existe o expiró.'
        : 'No se pudo cargar la información del contrato.';
    return <ContractSessionErrorState message={message} />;
  }

  const contract = contractQuery.data!;

  if (contract.signed) {
    return (
      <AlreadySignedContractView
        fullName={contract.fullName}
        signedPreviewSrc={signedPreviewSrc}
      />
    );
  }

  return (
    <div className='min-h-screen bg-muted/30 p-3 md:p-5'>
      <div className='mx-auto flex max-w-4xl flex-col gap-4'>
        {previewSrc ? (
          <UnsignedContractMainCard
            fullName={contract.fullName}
            previewSrc={previewSrc}
            isPdfLoading={pdfQuery.isLoading}
            isPdfError={pdfQuery.isError}
            pdfReady={pdfReady}
            isUploadPending={uploadMutation.isPending}
            onOpenSignDialog={() => {
              setSubmitError(null);
              setSignDialogOpen(true);
            }}
          />
        ) : (
          <UnsignedContractNoPreviewCard />
        )}

        <ContractSignatureDialog
          open={signDialogOpen}
          onOpenChange={handleSignDialogOpenChange}
          signaturePadRef={sigRef}
          submitError={submitError}
          pdfReady={pdfReady}
          isPending={uploadMutation.isPending}
          onConfirm={() => uploadMutation.mutate()}
        />
      </div>
    </div>
  );
};

export default ContractSignPage;
