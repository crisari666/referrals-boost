import { Loader2 } from 'lucide-react';
import type { RefObject } from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
          throw new Error(t('contract.sigEmptyDraw'));
        }
        const dataUrl = pad.getTrimmedCanvas().toDataURL('image/png');
        onRequestPreview(dataUrlToUint8Array(dataUrl), 'draw');
        return;
      }
      const typedTrim = typedSignature.trim();
      if (!typedTrim) throw new Error(t('contract.sigEmptyType'));
      onRequestPreview(renderTextSignatureToPng(typedTrim), 'type');
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('contract.sigPrepareFailed');
      toast.error(msg);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md gap-4'>
        <DialogHeader>
          <DialogTitle>{t('contract.sigDialogTitle')}</DialogTitle>
          <DialogDescription>
            {t('contract.sigDialogDescription')}
          </DialogDescription>
        </DialogHeader>
        <Tabs value={tab} onValueChange={(v) => setTab(v as SignTab)} className='w-full'>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='draw'>{t('contract.sigTabDraw')}</TabsTrigger>
            <TabsTrigger value='type'>{t('contract.sigTabType')}</TabsTrigger>
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
              {t('contract.sigDrawHint')}
            </p>
          </TabsContent>
          <TabsContent value='type' className='mt-3 space-y-3'>
            <div className='space-y-2'>
              <Label htmlFor='typed-signature'>{t('contract.sigTypedLabel')}</Label>
              <Input
                id='typed-signature'
                placeholder={t('contract.sigTypedPlaceholder')}
                value={typedSignature}
                onChange={(e) => setTypedSignature(e.target.value)}
                autoComplete='name'
                maxLength={120}
              />
            </div>
            <p className='text-xs text-muted-foreground'>
              {t('contract.sigTypedHint')}
            </p>
          </TabsContent>
        </Tabs>
        {submitError ? <p className='text-sm text-destructive'>{submitError}</p> : null}
        <DialogFooter className='flex-col gap-2 sm:flex-row sm:justify-end'>
          <Button type='button' variant='outline' onClick={clearCurrentTab} disabled={isPreparingPreview}>
            {t('contract.sigClear')}
          </Button>
          <Button
            type='button'
            variant='secondary'
            onClick={() => onOpenChange(false)}
            disabled={isPreparingPreview}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type='button'
            disabled={!pdfReady || isPreparingPreview}
            onClick={submitSignature}
          >
            {isPreparingPreview ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                {t('contract.sigPreviewGenerating')}
              </>
            ) : (
              t('contract.sigPreviewButton')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
