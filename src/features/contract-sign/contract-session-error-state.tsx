import { AlertCircle } from 'lucide-react';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type ContractSessionErrorStateProps = {
  message: string;
};

export const ContractSessionErrorState = ({
  message,
}: ContractSessionErrorStateProps) => (
  <div className='flex min-h-screen items-center justify-center bg-muted/30 p-4'>
    <Card className='w-full max-w-md border-destructive/50'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-destructive'>
          <AlertCircle className='h-5 w-5' />
          Error
        </CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
    </Card>
  </div>
);
