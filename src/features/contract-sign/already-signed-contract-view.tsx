import { CheckCircle2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type AlreadySignedContractViewProps = {
  fullName: string;
  signedPreviewSrc: string | null;
};

export const AlreadySignedContractView = ({
  fullName,
  signedPreviewSrc,
}: AlreadySignedContractViewProps) => (
  <div className='min-h-screen bg-muted/30 p-3 md:p-5'>
    <div className='mx-auto flex max-w-3xl flex-col gap-4'>
      <Card>
        <CardHeader className='space-y-0.5 px-4 py-3'>
          <CardTitle className='flex items-center gap-1.5 text-base font-semibold'>
            <CheckCircle2 className='h-5 w-5 shrink-0 text-green-600' />
            Contrato ya firmado
          </CardTitle>
          <CardDescription className='text-xs'>
            Hola, {fullName}. Este contrato ya fue firmado.
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
