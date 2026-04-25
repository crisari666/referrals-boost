import { ExternalLink, FileCheck, Loader2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type ContractSignedPreviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pdfObjectUrl: string | null;
  isSending: boolean;
  errorMessage: string | null;
  onSend: () => void;
  onEditSignature: () => void;
};

const isMobilePdfEmbed = (): boolean => {
  if (typeof navigator === 'undefined') {
    return false;
  }
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
};

export const ContractSignedPreviewDialog = ({
  open,
  onOpenChange,
  pdfObjectUrl,
  isSending,
  errorMessage,
  onSend,
  onEditSignature,
}: ContractSignedPreviewDialogProps) => {
  const usesMobilePreview = isMobilePdfEmbed();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[90vh] max-w-4xl flex-col gap-4'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <FileCheck className='h-5 w-5' />
            Vista previa del contrato firmado
          </DialogTitle>
          <DialogDescription>
            Revisa el documento. Si todo es correcto, envíalo. Si no, vuelve atrás para cambiar la firma.
          </DialogDescription>
        </DialogHeader>
        <div className='min-h-0 flex-1 overflow-hidden rounded-md border bg-muted/20'>
          {!pdfObjectUrl ? (
            <div className='flex h-64 items-center justify-center text-sm text-muted-foreground'>
              Sin documento
            </div>
          ) : usesMobilePreview ? (
            <div className='flex h-[min(60vh,520px)] flex-col items-center justify-center gap-3 p-4'>
              <p className='text-center text-sm text-muted-foreground'>
                En móvil, abre el PDF para validar la firma más reciente.
              </p>
              <Button asChild type='button' className='gap-2'>
                <a href={pdfObjectUrl} target='_blank' rel='noreferrer'>
                  <ExternalLink className='h-4 w-4' />
                  Abrir vista previa
                </a>
              </Button>
            </div>
          ) : (
            <iframe
              key={pdfObjectUrl}
              title='Vista previa del PDF firmado'
              src={pdfObjectUrl}
              className='h-[min(70vh,720px)] w-full border-0 bg-background'
            />
          )}
        </div>
        {errorMessage ? <p className='text-sm text-destructive'>{errorMessage}</p> : null}
        <DialogFooter className='flex-col gap-2 sm:flex-row sm:justify-end'>
          <Button
            type='button'
            variant='outline'
            onClick={onEditSignature}
            disabled={isSending}
            className='gap-2'
          >
            <Pencil className='h-4 w-4' />
            Modificar firma
          </Button>
          <Button type='button' onClick={onSend} disabled={isSending || !pdfObjectUrl} className='gap-2'>
            {isSending ? (
              <>
                <Loader2 className='h-4 w-4 animate-spin' />
                Enviando…
              </>
            ) : (
              <>
                <FileCheck className='h-4 w-4' />
                Enviar documento
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
