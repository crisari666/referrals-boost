import { AlertCircle } from 'lucide-react';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const InvalidSignLinkState = () => (
  <div className='flex min-h-screen items-center justify-center bg-muted/30 p-4'>
    <Card className='w-full max-w-md border-destructive/50'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-destructive'>
          <AlertCircle className='h-5 w-5' />
          Enlace inválido
        </CardTitle>
        <CardDescription>
          Falta el token de firma en la URL. Abre el enlace que recibiste por correo.
        </CardDescription>
      </CardHeader>
    </Card>
  </div>
);
