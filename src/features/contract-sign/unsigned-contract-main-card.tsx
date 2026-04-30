import { Loader2, PenLine } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type UnsignedContractMainCardProps = {
  fullName: string;
  previewSrc: string;
  isPdfLoading: boolean;
  isPdfError: boolean;
  pdfReady: boolean;
  isUploadPending: boolean;
  onOpenSignDialog: () => void;
};

export const UnsignedContractMainCard = ({
  fullName,
  previewSrc,
  isPdfLoading,
  isPdfError,
  pdfReady,
  isUploadPending,
  onOpenSignDialog,
}: UnsignedContractMainCardProps) => {
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader className='space-y-2 border-b px-4 py-3'>
        <div className='flex flex-row items-start justify-between gap-3'>
          <div className='min-w-0 flex-1 space-y-0.5'>
            <CardTitle className='flex items-center gap-1.5 text-base font-semibold'>
              <PenLine className='h-5 w-5 shrink-0' />
              {t('contract.unsignedCardTitle')}
            </CardTitle>
            <CardDescription className='text-xs'>
              {t('contract.unsignedCardDescription', { name: fullName })}
            </CardDescription>
          </div>
          <Button
            type='button'
            size='lg'
            className='shrink-0 font-semibold tracking-wide sm:min-w-[140px]'
            disabled={!pdfReady || isUploadPending}
            onClick={onOpenSignDialog}
          >
            {t('contract.unsignedSignButton')}
          </Button>
        </div>
        {isPdfError ? (
          <p className='text-xs text-destructive'>
            {t('contract.unsignedPdfError')}
          </p>
        ) : null}
        {isPdfLoading ? (
          <p className='flex items-center gap-2 text-xs text-muted-foreground'>
            <Loader2 className='h-3.5 w-3.5 shrink-0 animate-spin' />
            {t('contract.unsignedPreparingPdf')}
          </p>
        ) : null}
      </CardHeader>
      <CardContent className='p-0'>
        <iframe
          title={t('contract.unsignedIframeTitle')}
          src={previewSrc}
          className='min-h-[calc(100vh-12rem)] w-full border-0 bg-background md:min-h-[calc(100vh-10rem)]'
        />
      </CardContent>
    </Card>
  );
};
