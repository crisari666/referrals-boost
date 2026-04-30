import { Clock, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAppSelector } from '@/store';
import {
  selectSignupCampaign,
  selectSignupCampaignWhatsappUrl,
} from '@/store/signupCampaignSlice';
import type { SignupCampaignStatus } from '../signup-campaign-types';

const titleKeyByStatus: Record<Exclude<SignupCampaignStatus, 'active'>, string> = {
  not_started: 'signup.expiredTitleNotStarted',
  expired: 'signup.expiredTitleExpired',
  disabled: 'signup.expiredTitleDisabled',
};

const descriptionKeyByStatus: Record<Exclude<SignupCampaignStatus, 'active'>, string> = {
  not_started: 'signup.expiredDescNotStarted',
  expired: 'signup.expiredDescExpired',
  disabled: 'signup.expiredDescDisabled',
};

export const SignupCampaignExpiredCard = () => {
  const { t } = useTranslation();
  const campaign = useAppSelector(selectSignupCampaign);
  const whatsappUrl = useAppSelector(selectSignupCampaignWhatsappUrl);
  const status =
    campaign?.status && campaign.status !== 'active'
      ? campaign.status
      : 'expired';
  const title = t(titleKeyByStatus[status]);
  const description = t(descriptionKeyByStatus[status]);
  return (
    <div className='flex min-h-screen items-center justify-center bg-muted/30 p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader className='space-y-2'>
          <div className='flex items-center gap-2 text-muted-foreground'>
            <Clock className='h-5 w-5' />
            <span className='text-xs uppercase tracking-wide'>
              {t('signup.expiredBadge')}
            </span>
          </div>
          <CardTitle className='text-xl'>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className='space-y-3'>
          {whatsappUrl ? (
            <a
              href={whatsappUrl}
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors duration-200 hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2'
            >
              <MessageCircle className='h-4 w-4' />
              {t('signup.contactWhatsapp')}
            </a>
          ) : (
            <p className='text-xs text-muted-foreground'>
              {t('signup.contactLeaderInfo')}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
