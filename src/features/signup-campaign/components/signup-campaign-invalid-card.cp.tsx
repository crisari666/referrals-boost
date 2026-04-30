import { AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface SignupCampaignInvalidCardProps {
  description?: string;
}

export const SignupCampaignInvalidCard = ({ description }: SignupCampaignInvalidCardProps) => {
  const { t } = useTranslation();
  const resolvedDescription = description ?? t('signup.invalidUrlHint');
  return (
    <div className='flex min-h-screen items-center justify-center bg-muted/30 p-4'>
      <Card className='w-full max-w-md border-destructive/50'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-destructive'>
            <AlertCircle className='h-5 w-5' />
            {t('signup.invalidLinkTitle')}
          </CardTitle>
          <CardDescription>{resolvedDescription}</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
};
