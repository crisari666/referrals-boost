import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  loadSignupCampaignByCode,
  resetSignupCampaign,
  selectSignupCampaign,
  selectSignupCampaignLoadErrorKind,
  selectSignupCampaignLoadStatus,
  selectSignupSubmitStatus,
} from '@/store/signupCampaignSlice';
import { SignupCampaignExpiredCard } from './components/signup-campaign-expired-card.cp';
import { SignupCampaignForm } from './components/signup-campaign-form.cp';
import { SignupCampaignInvalidCard } from './components/signup-campaign-invalid-card.cp';
import { SignupCampaignLoading } from './components/signup-campaign-loading.cp';
import { SignupCampaignSuccessCard } from './components/signup-campaign-success-card.cp';

const SignupCampaignPage = () => {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code')?.trim() ?? '';
  const dispatch = useAppDispatch();
  const loadStatus = useAppSelector(selectSignupCampaignLoadStatus);
  const loadErrorKind = useAppSelector(selectSignupCampaignLoadErrorKind);
  const campaign = useAppSelector(selectSignupCampaign);
  const submitStatus = useAppSelector(selectSignupSubmitStatus);
  useEffect(() => {
    if (code === '') {
      return;
    }
    dispatch(loadSignupCampaignByCode(code));
    return () => {
      dispatch(resetSignupCampaign());
    };
  }, [code, dispatch]);
  if (code === '') {
    return <SignupCampaignInvalidCard />;
  }
  if (submitStatus === 'success') {
    return <SignupCampaignSuccessCard />;
  }
  if (loadStatus === 'idle' || loadStatus === 'loading') {
    return <SignupCampaignLoading />;
  }
  if (loadStatus === 'error') {
    if (loadErrorKind === 'not_found') {
      return (
        <SignupCampaignInvalidCard description='Este enlace de registro no existe o ya no está disponible.' />
      );
    }
    return (
      <SignupCampaignInvalidCard description='No pudimos cargar la información de la campaña. Inténtalo de nuevo.' />
    );
  }
  if (campaign?.status !== 'active') {
    return <SignupCampaignExpiredCard />;
  }
  return <SignupCampaignForm code={code} />;
};

export default SignupCampaignPage;
