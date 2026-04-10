import { useEffect } from 'react';
import { ACHIEVEMENTS_GOALS_USERNAME } from '@/constants/app-constants';
import { useToast } from '@/hooks/use-toast';
import { displayUserName, profileInitials } from '@/lib/display-user-name';
import { fetchVendorDashboard } from '@/store/vendorDashboardSlice';
import { useAppDispatch, useAppSelector, type RootState } from '@/store';
import { ProfileAchievementsSection } from './profile-achievements-section';
import { ProfileIdentityCard } from './profile-identity-card';
import { ProfilePasswordSection } from './profile-password-section';
import { ProfileReferralSection } from './profile-referral-section';
import { ProfileSummarySection } from './profile-summary-section';

const VENDOR_LEVEL = 4;

const Profile = () => {
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s: RootState) => s.auth.user);
  const seller = useAppSelector((s: RootState) => s.profile.seller);
  const vendorDashboard = useAppSelector((s: RootState) => s.vendorDashboard);

  const isVendor = user?.level === VENDOR_LEVEL;
  const api = vendorDashboard.data;

  useEffect(() => {
    if (isVendor) {
      void dispatch(fetchVendorDashboard());
    }
  }, [dispatch, isVendor]);

  const nameShown = user ? displayUserName(user.name, user.lastName) : seller.name;
  const initials = profileInitials(user?.name, user?.lastName, seller.name);

  const clientsTracking = isVendor && api ? api.customersActives : seller.clientsTracking;
  const clientsConverted = isVendor && api ? api.customerConversion : seller.clientsConverted;
  const monthCommissions = isVendor && api ? api.monthCommissions : seller.monthCommissions;
  const totalCommissions = isVendor && api ? api.totalHistoryCommissions : seller.totalCommissions;

  const showGoalsAchievements = user?.user === ACHIEVEMENTS_GOALS_USERNAME;

  const copyLink = () => {
    navigator.clipboard.writeText(seller.referralLink);
    toast({ title: '¡Enlace copiado!', description: 'Compártelo con tus clientes potenciales' });
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-4">
      <h1 className="text-2xl font-extrabold text-foreground">Mi Perfil</h1>

      <ProfileIdentityCard
        displayName={nameShown}
        initials={initials}
        levelKey={seller.level}
        levelProgress={seller.levelProgress}
      />

      <ProfileReferralSection referralLink={seller.referralLink} onCopy={copyLink} />

      <ProfilePasswordSection />

      <ProfileSummarySection
        clientsTracking={clientsTracking}
        clientsConverted={clientsConverted}
        monthCommissions={monthCommissions}
        totalCommissions={totalCommissions}
      />

      {showGoalsAchievements ? (
        <ProfileAchievementsSection achievements={seller.achievements} />
      ) : null}
    </div>
  );
};

export default Profile;
