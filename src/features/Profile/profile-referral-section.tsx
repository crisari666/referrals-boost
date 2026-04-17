import { Link2, Copy } from 'lucide-react';
import { motion } from 'framer-motion';

export type ProfileReferralSectionProps = {
  referralLink: string;
  onCopy: () => void;
};

export function ProfileReferralSection({ referralLink, onCopy }: ProfileReferralSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-card rounded-2xl p-5 border border-border shadow-sm"
    >
      <div className="flex items-center gap-2 mb-3">
        <Link2 className="w-4 h-4 text-primary" />
        <h3 className="font-bold text-foreground">Tu Enlace de Referido</h3>
      </div>
      <div className="flex items-center gap-2">
        {/* <div className="flex-1 bg-secondary rounded-xl px-4 py-3 text-sm text-foreground truncate font-mono">
          {referralLink}
        </div> */}
        <button
          type="button"
          onClick={onCopy}
          className="w-10 h-10 gradient-commission rounded-xl flex items-center justify-center shrink-0"
        >
          <Copy className="w-4 h-4 text-primary-foreground" />
        </button>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Comparte este enlace y cada cliente que se registre quedará vinculado a ti automáticamente.
      </p>
    </motion.div>
  );
}
