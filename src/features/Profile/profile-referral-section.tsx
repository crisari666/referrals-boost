import { Link2, Copy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

export type ProfileReferralSectionProps = {
  referralLink: string;
  onCopy: () => void;
};

export function ProfileReferralSection({ referralLink, onCopy }: ProfileReferralSectionProps) {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-card rounded-2xl p-5 border border-border shadow-sm"
    >
      <div className="flex items-center gap-2 mb-3">
        <Link2 className="w-4 h-4 text-primary" />
        <h3 className="font-bold text-foreground">{t('profile.referralTitle')}</h3>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onCopy}
          title={referralLink}
          className="w-10 h-10 gradient-commission rounded-xl flex items-center justify-center shrink-0"
          aria-label={t('profile.linkCopiedTitle')}
        >
          <Copy className="w-4 h-4 text-primary-foreground" />
        </button>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        {t('profile.referralHelpText')}
      </p>
    </motion.div>
  );
}
