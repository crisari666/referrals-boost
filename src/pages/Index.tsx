import { Navigate } from 'react-router-dom';
import { DollarSign, Users, Target, TrendingUp } from 'lucide-react';
import StatsCard from '@/components/StatsCard';
import { motion } from 'framer-motion';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchVendorDashboard } from '@/store/vendorDashboardSlice';
import { displayUserName } from '@/lib/display-user-name';
import { getIntlLocaleTag } from '@/i18n/intl-locale';
import { useAppDispatch, useAppSelector, type RootState } from '@/store';

const VENDOR_LEVEL = 4;

const Dashboard = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s: RootState) => s.auth.user);
  const vendorDashboard = useAppSelector((s: RootState) => s.vendorDashboard);
  const localeTag = getIntlLocaleTag();

  const phrase = useMemo(() => {
    const keys = ['dashboard.phrase1', 'dashboard.phrase2', 'dashboard.phrase3', 'dashboard.phrase4'] as const;
    const key = keys[Math.floor(Math.random() * keys.length)];
    return t(key);
  }, [t]);

  const isVendor = user?.level === VENDOR_LEVEL;
  const api = vendorDashboard.data;

  useEffect(() => {
    if (isVendor) {
      void dispatch(fetchVendorDashboard());
    }
  }, [dispatch, isVendor]);

  if (user?.role === 'external_agent') {
    return <Navigate to="/stock" replace />;
  }

  const monthCommissions = isVendor && api ? api.monthCommissions : 0;
  const totalCommissions = isVendor && api ? api.totalHistoryCommissions : 0;
  const clientsTracking = isVendor && api ? api.customersActives : 0;
  const clientsConverted = isVendor && api ? api.customerConversion : 0;
  const monthGoal = isVendor && api ? api.monthlyGoal : 0;

  const goalPercent = monthGoal > 0 ? Math.round((monthCommissions / monthGoal) * 100) : 0;

  const userName = user ? displayUserName(user.name, user.lastName) : '';

  const fmtMoney = (n: number) => `$${n.toLocaleString(localeTag)}`;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <p className="text-sm text-muted-foreground">{t('dashboard.welcomeBack')}</p>
        <h1 className="text-2xl font-extrabold text-foreground">{userName}</h1>
        <p className="text-sm text-primary font-medium">{phrase}</p>
      </motion.div>

      <div className="grid grid-cols-2 gap-3">
        <StatsCard
          title={t('dashboard.commissionsMonth')}
          value={fmtMoney(monthCommissions)}
          icon={DollarSign}
          gradient="commission"
          delay={0.1}
        />
        <StatsCard
          title={t('dashboard.totalHistoric')}
          value={fmtMoney(totalCommissions)}
          icon={TrendingUp}
          gradient="gold"
          delay={0.15}
        />
        <StatsCard
          title={t('dashboard.inFollowUp')}
          value={String(clientsTracking)}
          subtitle={t('dashboard.activeClientsSubtitle')}
          icon={Users}
          gradient="info"
          delay={0.2}
        />
        <StatsCard
          title={t('dashboard.conversions')}
          value={String(clientsConverted)}
          subtitle={t('dashboard.visitedOfficeSubtitle')}
          icon={Target}
          gradient="success"
          delay={0.25}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card rounded-2xl p-5 border border-border shadow-sm"
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {t('dashboard.monthlyGoalLabel')}
            </p>
            <p className="text-lg font-extrabold text-foreground">
              {fmtMoney(monthCommissions)}{' '}
              <span className="text-sm font-medium text-muted-foreground">
                / {fmtMoney(monthGoal)}
              </span>
            </p>
          </div>
          <span className="text-2xl font-extrabold text-primary">{goalPercent}%</span>
        </div>
        <div className="h-3 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full gradient-commission rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${goalPercent}%` }}
            transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
