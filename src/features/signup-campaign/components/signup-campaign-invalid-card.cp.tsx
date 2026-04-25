import { AlertCircle } from 'lucide-react';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface SignupCampaignInvalidCardProps {
  description?: string;
}

export const SignupCampaignInvalidCard = ({
  description = 'Falta el código de la campaña en la URL. Abre el enlace que recibiste de tu líder.',
}: SignupCampaignInvalidCardProps) => (
  <div className='flex min-h-screen items-center justify-center bg-muted/30 p-4'>
    <Card className='w-full max-w-md border-destructive/50'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-destructive'>
          <AlertCircle className='h-5 w-5' />
          Enlace inválido
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  </div>
);
