import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ClientDetailScheduleDialog } from './client-detail-schedule-dialog';

export type ClientDetailHeaderProps = {
  readonly customerId: string;
  readonly isMock: boolean;
  readonly isPhysical: boolean;
};

export function ClientDetailHeader({
  customerId,
  isMock,
  isPhysical,
}: ClientDetailHeaderProps) {
  const { t } = useTranslation();
  return (
    <div className="flex w-full min-w-0 items-center gap-3">
      <Link
        to="/clients"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-card cursor-pointer transition-colors hover:bg-accent"
      >
        <ArrowLeft className="h-4 w-4 text-foreground" aria-hidden />
        <span className="sr-only">{t('clients.backToClients')}</span>
      </Link>
      <h1 className="min-w-0 flex-1 truncate text-lg font-bold text-foreground md:text-xl">
        {t('clients.detailTitle')}
      </h1>
      {isPhysical ? (
        <ClientDetailScheduleDialog customerId={customerId} isMock={isMock} />
      ) : null}
    </div>
  );
}
