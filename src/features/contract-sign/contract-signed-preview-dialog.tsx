import { ExternalLink, FileCheck, Loader2, Pencil } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const usesMobilePreview = isMobilePdfEmbed();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[90vh] max-w-4xl flex-col gap-4'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <FileCheck className='h-5 w-5' />
            {t('contract.previewSignedTitle')}
          </DialogTitle>
          <DialogDescription>
            {t('contract.previewSignedDescription')}
          </DialogDescription>
        </DialogHeader>
        <div className='min-h-0 flex-1 overflow-hidden rounded-md border bg-muted/20'>
          {!pdfObjectUrl ? (
            <div className='flex h-64 items-center justify-center text-sm text-muted-foreground'>
              {t('contract.previewNoDocument')}
            </div>
          ) : usesMobilePreview ? (
            <div className='flex h-[min(60vh,520px)] flex-col items-center justify-center gap-3 p-4'>
              <p className='text-center text-sm text-muted-foreground'>
                {t('contract.previewMobileHint')}
              </p>
              <Button asChild type='button' className='gap-2'>
                <a href={pdfObjectUrl} target='_blank' rel='noreferrer'>
                  <ExternalLink className='h-4 w-4' />
                  {t('contract.previewOpenButton')}
                </a>
              </Button>
            </div>
          ) : (
            <iframe
              key={pdfObjectUrl}
              title={t('contract.previewIframeTitle')}
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
            {t('contract.previewEditSignature')}
          </Button>
          <Button type='button' onClick={onSend} disabled={isSending || !pdfObjectUrl} className='gap-2'>
            {isSending ? (
              <>
                <Loader2 className='h-4 w-4 animate-spin' />
                {t('contract.previewSending')}
              </>
            ) : (
              <>
                <FileCheck className='h-4 w-4' />
                {t('contract.previewSendDocument')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
