import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock } from 'lucide-react';

type ReserveCountdownBannerProps = {
  expiresAt: string;
  onExpired?: () => void;
};

export function ReserveCountdownBanner({
  expiresAt,
  onExpired,
}: ReserveCountdownBannerProps) {
  const { t } = useTranslation();
  const [minutesLeft, setMinutesLeft] = useState(() =>
    Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 60000)),
  );

  useEffect(() => {
    const tick = () => {
      const leftMs = new Date(expiresAt).getTime() - Date.now();
      const next = Math.max(0, Math.ceil(leftMs / 60000));
      setMinutesLeft(next);
      if (leftMs <= 0) {
        onExpired?.();
      }
    };
    tick();
    const id = window.setInterval(tick, 15000);
    return () => window.clearInterval(id);
  }, [expiresAt, onExpired]);

  if (minutesLeft <= 0) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
        <Clock className="h-4 w-4 shrink-0" />
        {t('lotPurchase.reserveExpired')}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-foreground">
      <Clock className="h-4 w-4 shrink-0 text-primary" />
      {t('lotPurchase.reserveBanner', { minutes: minutesLeft })}
    </div>
  );
}
