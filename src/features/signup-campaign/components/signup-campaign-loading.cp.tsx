import { Loader2 } from 'lucide-react';

export const SignupCampaignLoading = () => (
  <div className='flex min-h-screen flex-col items-center justify-center gap-3 bg-muted/30'>
    <Loader2 className='h-10 w-10 animate-spin text-muted-foreground' />
    <p className='text-sm text-muted-foreground'>Cargando campaña…</p>
  </div>
);
