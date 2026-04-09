import { Loader2 } from 'lucide-react';
import type { RefObject } from 'react';
import { useEffect, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { dataUrlToUint8Array } from '@/lib/data-url';
import type { SignatureMergeMode } from '@/lib/merge-signature-into-pdf';
import { renderTextSignatureToPng } from '@/lib/signature-image';
import { toast } from 'sonner';

const SIGNATURE_PAD_WIDTH = 400;
const SIGNATURE_PAD_HEIGHT = 160;

type SignTab = 'draw' | 'type';

type ContractSignatureDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  signaturePadRef: RefObject<SignatureCanvas>;
  submitError: string | null;
  pdfReady: boolean;
  isPreparingPreview: boolean;
  onRequestPreview: (signatureImageBytes: Uint8Array, mode: SignatureMergeMode) => void;
};

export const ContractSignatureDialog = ({
  open,
  onOpenChange,
  signaturePadRef,
  submitError,
  pdfReady,
  isPreparingPreview,
  onRequestPreview,
}: ContractSignatureDialogProps) => {
  const [tab, setTab] = useState<SignTab>('draw');
  const [typedSignature, setTypedSignature] = useState('');

  useEffect(() => {
    if (!open) {
      setTab('draw');
      setTypedSignature('');
      signaturePadRef.current?.clear();
    }
  }, [open, signaturePadRef]);

  const clearCurrentTab = () => {
    if (tab === 'draw') signaturePadRef.current?.clear();
    if (tab === 'type') setTypedSignature('');
  };

  const submitSignature = () => {
    try {
      if (tab === 'draw') {
        const pad = signaturePadRef.current;
        if (!pad || pad.isEmpty()) {
          throw new Error('Dibuja tu firma o elige Escribir.');
        }
        const dataUrl = pad.getTrimmedCanvas().toDataURL('image/png');
        onRequestPreview(dataUrlToUint8Array(dataUrl), 'draw');
        return;
      }
      const t = typedSignature.trim();
      if (!t) throw new Error('Escribe tu nombre o firma.');
      onRequestPreview(renderTextSignatureToPng(t), 'type');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No se pudo preparar la firma.';
      toast.error(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md gap-4'>
        <DialogHeader>
          <DialogTitle>Tu firma</DialogTitle>
          <DialogDescription>
            Dibuja o escribe tu nombre. Después verás el PDF con la firma antes de enviarlo.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as SignTab)} className='w-full'>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='draw'>Dibujar</TabsTrigger>
            <TabsTrigger value='type'>Escribir</TabsTrigger>
          </TabsList>

          <TabsContent value='draw' className='mt-3'>
            {open ? (
              <div className='overflow-hidden rounded-md border border-input bg-white'>
                <SignatureCanvas
                  ref={signaturePadRef}
                  penColor='rgb(0,0,0)'
                  canvasProps={{
                    width: SIGNATURE_PAD_WIDTH,
                    height: SIGNATURE_PAD_HEIGHT,
                    className: 'block max-w-full touch-none',
                  }}
                />
              </div>
            ) : null}
            <p className='mt-2 text-xs text-muted-foreground'>
              Usa el dedo o el ratón en el recuadro.
            </p>
          </TabsContent>

          <TabsContent value='type' className='mt-3 space-y-3'>
            <div className='space-y-2'>
              <Label htmlFor='typed-signature'>Nombre o firma (texto)</Label>
              <Input
                id='typed-signature'
                placeholder='Ej. Juan Pérez'
                value={typedSignature}
                onChange={(e) => setTypedSignature(e.target.value)}
                autoComplete='name'
                maxLength={120}
              />
            </div>
            <p className='text-xs text-muted-foreground'>
              El texto se mostrará con estilo manuscrito en el PDF.
            </p>
          </TabsContent>
        </Tabs>

        {submitError ? <p className='text-sm text-destructive'>{submitError}</p> : null}

        <DialogFooter className='flex-col gap-2 sm:flex-row sm:justify-end'>
          <Button type='button' variant='outline' onClick={clearCurrentTab} disabled={isPreparingPreview}>
            Limpiar
          </Button>
          <Button
            type='button'
            variant='secondary'
            onClick={() => onOpenChange(false)}
            disabled={isPreparingPreview}
          >
            Cancelar
          </Button>
          <Button
            type='button'
            disabled={!pdfReady || isPreparingPreview}
            onClick={submitSignature}
          >
            {isPreparingPreview ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Generando vista previa…
              </>
            ) : (
              'Ver vista previa'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
