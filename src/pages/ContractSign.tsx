import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { AlertCircle, CheckCircle2, Loader2, PenLine } from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { dataUrlToUint8Array, mergePngSignatureIntoPdf } from '@/lib/merge-signature-into-pdf';
import {
  drivePdfLinkToPreviewUrl,
  getAgentContractByToken,
  getAgentContractSignQueryParam,
  getContractPdfArrayBuffer,
  postSignedContractPdf,
} from '@/services/agentContractSignService';
import { toast } from 'sonner';

const SIGNATURE_PAD_WIDTH = 440;
const SIGNATURE_PAD_HEIGHT = 160;

const contractSignQueryKey = (token: string | null) =>
  ['agent-contract-sign', token] as const;

const ContractSign = () => {
  const [searchParams] = useSearchParams();
  const paramName = getAgentContractSignQueryParam();
  const token = searchParams.get(paramName);
  const sigRef = useRef<SignatureCanvas>(null);
  const queryClient = useQueryClient();
  const [submitError, setSubmitError] = useState<string | null>(null);

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
        throw new Error('Dibuja tu firma antes de continuar.');
      }
      const trimmed = pad.getTrimmedCanvas();
      const dataUrl = trimmed.toDataURL('image/png');
      const pngBytes = dataUrlToUint8Array(dataUrl);
      const pdfBytes = pdfQuery.data;
      if (!pdfBytes) throw new Error('El PDF aún no está listo.');
      const merged = await mergePngSignatureIntoPdf(pdfBytes, pngBytes);
      const blob = new Blob([merged], { type: 'application/pdf' });
      return postSignedContractPdf(token, blob);
    },
    onSuccess: () => {
      setSubmitError(null);
      toast.success('Contrato firmado correctamente.');
      if (token) {
        queryClient.invalidateQueries({ queryKey: contractSignQueryKey(token) });
      }
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof Error
          ? err.message
          : isAxiosError(err)
            ? (err.response?.data as { message?: string })?.message ??
              err.message
            : 'No se pudo enviar el documento firmado.';
      setSubmitError(msg);
      toast.error(msg);
    },
  });

  const clearSignature = useCallback(() => {
    sigRef.current?.clear();
    setSubmitError(null);
  }, []);

  if (!token) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-muted/30 p-4'>
        <Card className='w-full max-w-md border-destructive/50'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-destructive'>
              <AlertCircle className='h-5 w-5' />
              Enlace inválido
            </CardTitle>
            <CardDescription>
              Falta el token de firma en la URL. Abre el enlace que recibiste por correo.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (contractQuery.isLoading) {
    return (
      <div className='flex min-h-screen flex-col items-center justify-center gap-3 bg-muted/30'>
        <Loader2 className='h-10 w-10 animate-spin text-muted-foreground' />
        <p className='text-sm text-muted-foreground'>Cargando contrato…</p>
      </div>
    );
  }

  if (contractQuery.isError) {
    const status = isAxiosError(contractQuery.error)
      ? contractQuery.error.response?.status
      : undefined;
    const message =
      status === 404
        ? 'Esta sesión de firma no existe o expiró.'
        : 'No se pudo cargar la información del contrato.';
    return (
      <div className='flex min-h-screen items-center justify-center bg-muted/30 p-4'>
        <Card className='w-full max-w-md border-destructive/50'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-destructive'>
              <AlertCircle className='h-5 w-5' />
              Error
            </CardTitle>
            <CardDescription>{message}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const contract = contractQuery.data!;

  if (contract.signed) {
    return (
      <div className='min-h-screen bg-muted/30 p-3 md:p-5'>
        <div className='mx-auto flex max-w-3xl flex-col gap-4'>
          <Card>
            <CardHeader className='space-y-0.5 px-4 py-3'>
              <CardTitle className='flex items-center gap-1.5 text-base font-semibold'>
                <CheckCircle2 className='h-5 w-5 shrink-0 text-green-600' />
                Contrato ya firmado
              </CardTitle>
              <CardDescription className='text-xs'>
                Hola, {contract.fullName}. Este contrato ya fue firmado.
              </CardDescription>
            </CardHeader>
          </Card>
          {signedPreviewSrc ? (
            <Card>
              <CardHeader className='px-4 py-2'>
                <CardTitle className='text-sm font-semibold'>Documento</CardTitle>
              </CardHeader>
              <CardContent className='p-0'>
                <iframe
                  title='Contrato firmado'
                  src={signedPreviewSrc}
                  className='h-[70vh] w-full rounded-b-lg border-0 bg-background'
                />
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-muted/30 p-3 md:p-5'>
      <div className='mx-auto flex max-w-3xl flex-col gap-4'>
        <Card>
          <CardHeader className='space-y-0.5 px-4 py-3'>
            <CardTitle className='flex items-center gap-1.5 text-base font-semibold'>
              <PenLine className='h-5 w-5 shrink-0' />
              Firmar contrato
            </CardTitle>
            <CardDescription className='text-xs'>
              Hola, {contract.fullName}. Revisa el documento y firma abajo.
            </CardDescription>
          </CardHeader>
        </Card>

        {previewSrc ? (
          <Card>
            <CardHeader className='space-y-0.5 px-4 py-2'>
              <CardTitle className='text-sm font-semibold'>Vista previa</CardTitle>
              <CardDescription className='text-xs'>
                Desplázate hasta el final del documento antes de firmar.
              </CardDescription>
            </CardHeader>
            <CardContent className='p-0'>
              <iframe
                title='Contrato'
                src={previewSrc}
                className='h-[50vh] w-full rounded-b-lg border-0 bg-background md:h-[60vh]'
              />
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader className='space-y-0.5 px-4 py-2'>
            <CardTitle className='text-sm font-semibold'>Tu firma</CardTitle>
            <CardDescription className='text-xs'>
              Dibuja en el recuadro. Puedes borrar y volver a intentar.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-3 px-4 pb-4 pt-0'>
            {pdfQuery.isError ? (
              <p className='text-sm text-destructive'>
                No se pudo descargar el PDF para fusionar la firma. Comprueba la
                configuración del servidor o vuelve a intentar.
              </p>
            ) : null}
            {pdfQuery.isLoading ? (
              <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                <Loader2 className='h-4 w-4 animate-spin' />
                Preparando documento…
              </div>
            ) : null}
            <div className='overflow-hidden rounded-md border border-input bg-white'>
              <SignatureCanvas
                ref={sigRef}
                penColor='rgb(0,0,0)'
                canvasProps={{
                  width: SIGNATURE_PAD_WIDTH,
                  height: SIGNATURE_PAD_HEIGHT,
                  className: 'block max-w-full touch-none',
                }}
              />
            </div>
            <div className='flex flex-wrap gap-2'>
              <Button type='button' variant='outline' onClick={clearSignature}>
                Borrar firma
              </Button>
              <Button
                type='button'
                disabled={
                  pdfQuery.isLoading ||
                  pdfQuery.isError ||
                  !pdfQuery.data ||
                  uploadMutation.isPending
                }
                onClick={() => uploadMutation.mutate()}
              >
                {uploadMutation.isPending ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Enviando…
                  </>
                ) : (
                  'Aceptar y firmar'
                )}
              </Button>
            </div>
            {submitError ? (
              <p className='text-sm text-destructive'>{submitError}</p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContractSign;
