import { CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const message = useAppSelector(selectSignupSuccessMessage);
  return (
    <div className='flex min-h-screen items-center justify-center bg-muted/30 p-4'>
      <Card className='w-full max-w-md border-emerald-200/60'>
        <CardHeader className='space-y-2 text-center'>
          <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600'>
            <CheckCircle2 className='h-7 w-7' />
          </div>
          <CardTitle className='text-xl'>{t('signup.successTitle')}</CardTitle>
          <CardDescription>
            {message ?? t('signup.contractSentBanner')}
          </CardDescription>
        </CardHeader>
        <CardContent className='text-center text-sm text-muted-foreground'>
          {t('signup.successSpamHint')}
        </CardContent>
      </Card>
    </div>
  );
};
