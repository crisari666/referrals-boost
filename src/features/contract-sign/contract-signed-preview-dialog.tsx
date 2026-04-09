import { FileCheck, Loader2, Pencil } from 'lucide-react';
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

export const ContractSignedPreviewDialog = ({
  open,
  onOpenChange,
  pdfObjectUrl,
  isSending,
  errorMessage,
  onSend,
  onEditSignature,
}: ContractSignedPreviewDialogProps) => (
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
        {pdfObjectUrl ? (
          <iframe
            title='Vista previa del PDF firmado'
            src={pdfObjectUrl}
            className='h-[min(70vh,720px)] w-full border-0 bg-background'
          />
        ) : (
          <div className='flex h-64 items-center justify-center text-sm text-muted-foreground'>
            Sin documento
          </div>
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
