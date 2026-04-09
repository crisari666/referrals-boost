import { Loader2, Upload } from 'lucide-react';
import type { RefObject } from 'react';
import { useEffect, useRef, useState } from 'react';
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
import { renderTextSignatureToPng } from '@/lib/signature-image';
import { toast } from 'sonner';

const SIGNATURE_PAD_WIDTH = 400;
const SIGNATURE_PAD_HEIGHT = 160;

const ACCEPT_IMAGE = 'image/png,image/jpeg,image/webp,image/gif';

type SignTab = 'draw' | 'type' | 'file';

type ContractSignatureDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  signaturePadRef: RefObject<SignatureCanvas>;
  submitError: string | null;
  pdfReady: boolean;
  isPending: boolean;
  onConfirm: (signatureImageBytes: Uint8Array) => void;
};

export const ContractSignatureDialog = ({
  open,
  onOpenChange,
  signaturePadRef,
  submitError,
  pdfReady,
  isPending,
  onConfirm,
}: ContractSignatureDialogProps) => {
  const [tab, setTab] = useState<SignTab>('draw');
  const [typedSignature, setTypedSignature] = useState('');
  const [fileBytes, setFileBytes] = useState<Uint8Array | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setTab('draw');
      setTypedSignature('');
      setFileBytes(null);
      setFileName(null);
      setFilePreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
      signaturePadRef.current?.clear();
    }
  }, [open, signaturePadRef]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('El archivo debe ser una imagen.');
      return;
    }
    setFilePreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setFileName(file.name);
    void file.arrayBuffer().then((buf) => {
      setFileBytes(new Uint8Array(buf));
    });
  };

  const clearCurrentTab = () => {
    if (tab === 'draw') signaturePadRef.current?.clear();
    if (tab === 'type') setTypedSignature('');
    if (tab === 'file') {
      setFileBytes(null);
      setFileName(null);
      setFilePreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const submitSignature = () => {
    try {
      if (tab === 'draw') {
        const pad = signaturePadRef.current;
        if (!pad || pad.isEmpty()) {
          throw new Error('Dibuja tu firma o elige otra pestaña.');
        }
        const dataUrl = pad.getTrimmedCanvas().toDataURL('image/png');
        onConfirm(dataUrlToUint8Array(dataUrl));
        return;
      }
      if (tab === 'type') {
        const t = typedSignature.trim();
        if (!t) throw new Error('Escribe tu nombre o firma.');
        onConfirm(renderTextSignatureToPng(t));
        return;
      }
      if (!fileBytes?.length) {
        throw new Error('Selecciona una imagen de firma.');
      }
      onConfirm(fileBytes);
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
            Dibuja, escribe tu nombre o sube una imagen. Luego confirma para firmar el documento.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as SignTab)} className='w-full'>
          <TabsList className='grid w-full grid-cols-3'>
            <TabsTrigger value='draw'>Dibujar</TabsTrigger>
            <TabsTrigger value='type'>Escribir</TabsTrigger>
            <TabsTrigger value='file'>Archivo</TabsTrigger>
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

          <TabsContent value='file' className='mt-3 space-y-3'>
            <div className='space-y-2'>
              <Label htmlFor='signature-file'>Imagen (PNG, JPG, WebP…)</Label>
              <Input
                id='signature-file'
                ref={fileInputRef}
                type='file'
                accept={ACCEPT_IMAGE}
                className='cursor-pointer'
                onChange={handleFileChange}
              />
            </div>
            {filePreviewUrl ? (
              <>
                <div className='flex items-center gap-2 rounded-md border bg-muted/30 p-2'>
                  <Upload className='h-4 w-4 shrink-0 text-muted-foreground' />
                  <span className='min-w-0 flex-1 truncate text-xs text-muted-foreground'>
                    {fileName}
                  </span>
                </div>
                <div className='overflow-hidden rounded-md border bg-white'>
                  <img
                    src={filePreviewUrl}
                    alt='Vista previa de la firma'
                    className='mx-auto max-h-40 w-auto object-contain'
                  />
                </div>
              </>
            ) : (
              <p className='text-xs text-muted-foreground'>
                Sube una foto o escaneado de tu firma sobre fondo claro.
              </p>
            )}
          </TabsContent>
        </Tabs>

        {submitError ? <p className='text-sm text-destructive'>{submitError}</p> : null}

        <DialogFooter className='flex-col gap-2 sm:flex-row sm:justify-end'>
          <Button type='button' variant='outline' onClick={clearCurrentTab} disabled={isPending}>
            Limpiar
          </Button>
          <Button
            type='button'
            variant='secondary'
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button type='button' disabled={!pdfReady || isPending} onClick={submitSignature}>
            {isPending ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Enviando…
              </>
            ) : (
              'Confirmar y firmar'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
