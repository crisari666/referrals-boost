import { CheckCircle2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAppSelector } from '@/store';
import { selectSignupSuccessMessage } from '@/store/signupCampaignSlice';

export const SignupCampaignSuccessCard = () => {
  const message = useAppSelector(selectSignupSuccessMessage);
  return (
    <div className='flex min-h-screen items-center justify-center bg-muted/30 p-4'>
      <Card className='w-full max-w-md border-emerald-200/60'>
        <CardHeader className='space-y-2 text-center'>
          <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600'>
            <CheckCircle2 className='h-7 w-7' />
          </div>
          <CardTitle className='text-xl'>¡Registro enviado!</CardTitle>
          <CardDescription>
            {message ??
              'Hemos enviado el contrato de corretaje a tu bandeja de entrada para que realice la firma digital'}
          </CardDescription>
        </CardHeader>
        <CardContent className='text-center text-sm text-muted-foreground'>
          Revisa también tu carpeta de correo no deseado por si el mensaje cae allí.
        </CardContent>
      </Card>
    </div>
  );
};
