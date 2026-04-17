import { useEffect } from 'react';
import { Lock, User } from 'lucide-react';
import { ACHIEVEMENTS_GOALS_USERNAME } from '@/constants/app-constants';
import { useToast } from '@/hooks/use-toast';
import { displayUserName, profileInitials } from '@/lib/display-user-name';
import { fetchVendorDashboard } from '@/store/vendorDashboardSlice';
import { useAppDispatch, useAppSelector, type RootState } from '@/store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileAchievementsSection } from './profile-achievements-section';
import { ProfileIdentityCard } from './profile-identity-card';
import { ProfileAccountSection } from './profile-account-section';
import { ProfilePasswordSection } from './profile-password-section';
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

      {/* <ProfileReferralSection referralLink={seller.referralLink} onCopy={copyLink} /> */}

      <Tabs defaultValue="account" className="w-full">
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden mb-3">
          <TabsList className="grid h-12 w-full grid-cols-2 gap-1 rounded-none border-0 bg-muted/50 p-1.5 text-muted-foreground">
            <TabsTrigger
              value="account"
              className="gap-2 rounded-lg cursor-pointer transition-colors duration-200 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=inactive]:hover:bg-background/60 data-[state=active]:[&_svg]:text-foreground data-[state=inactive]:[&_svg]:opacity-60"
            >
              <User className="h-4 w-4 shrink-0" aria-hidden />
              Cuenta
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="gap-2 rounded-lg cursor-pointer transition-colors duration-200 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=inactive]:hover:bg-background/60 data-[state=active]:[&_svg]:text-foreground data-[state=inactive]:[&_svg]:opacity-60"
            >
              <Lock className="h-4 w-4 shrink-0" aria-hidden />
              Seguridad
            </TabsTrigger>
          </TabsList>
          <TabsContent
            value="account"
            className="mt-0 space-y-4 border-t border-border p-4 md:p-6 outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
          >
            <ProfileAccountSection />
            
          </TabsContent>
          <TabsContent
            value="security"
            className="mt-0 border-t border-border p-4 md:p-6 outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
            >
            <ProfilePasswordSection embedded />
          </TabsContent>
        </div>
        <ProfileSummarySection
              clientsTracking={clientsTracking}
              clientsConverted={clientsConverted}
              monthCommissions={monthCommissions}
              totalCommissions={totalCommissions}
        />
        {showGoalsAchievements ? (
          <ProfileAchievementsSection achievements={seller.achievements} />
        ) : null}
      </Tabs>
    </div>
  );
};

export default Profile;
