import { Loader2 } from 'lucide-react';
import type { RefObject } from 'react';
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

const SIGNATURE_PAD_WIDTH = 400;
const SIGNATURE_PAD_HEIGHT = 160;

type ContractSignatureDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  signaturePadRef: RefObject<SignatureCanvas>;
  submitError: string | null;
  pdfReady: boolean;
  isPending: boolean;
  onConfirm: () => void;
};

export const ContractSignatureDialog = ({
  open,
  onOpenChange,
  signaturePadRef,
  submitError,
  pdfReady,
  isPending,
  onConfirm,
}: ContractSignatureDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className='max-w-md gap-4'>
      <DialogHeader>
        <DialogTitle>Tu firma</DialogTitle>
        <DialogDescription>
          Dibuja en el recuadro. Puedes borrar y volver a intentar antes de confirmar.
        </DialogDescription>
      </DialogHeader>
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
      {submitError ? <p className='text-sm text-destructive'>{submitError}</p> : null}
      <DialogFooter className='flex-col gap-2 sm:flex-row sm:justify-end'>
        <Button
          type='button'
          variant='outline'
          onClick={() => signaturePadRef.current?.clear()}
          disabled={isPending}
        >
          Borrar
        </Button>
        <Button
          type='button'
          variant='secondary'
          onClick={() => onOpenChange(false)}
          disabled={isPending}
        >
          Cancelar
        </Button>
        <Button type='button' disabled={!pdfReady || isPending} onClick={onConfirm}>
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
