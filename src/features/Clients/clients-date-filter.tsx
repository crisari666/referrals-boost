import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  type ClientsDateFilterKind,
  setListCustomDateFilter,
  setListDateFilterKind,
} from '@/store/clientsSlice';

export function ClientsDateFilter() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const dateFilterKind = useAppSelector((state) => state.clients.listDateFilterKind);
  const customDateFilter = useAppSelector((state) => state.clients.listCustomDateFilter);

  const dateFilterTabs = useMemo(
    (): { id: ClientsDateFilterKind; label: string }[] => [
      { id: 'all', label: t('clients.dateFilterAll') },
      { id: 'today', label: t('clients.dateFilterToday') },
      { id: 'yesterday', label: t('clients.dateFilterYesterday') },
      { id: 'custom', label: t('clients.dateFilterCustom') },
    ],
    [t],
  );

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="grid w-full grid-cols-4 rounded-xl border border-border bg-card p-1 sm:inline-flex sm:w-auto sm:grid-cols-none">
        {dateFilterTabs.map((tab) => {
          const active = dateFilterKind === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => dispatch(setListDateFilterKind(tab.id))}
              className={`w-full px-3 py-1.5 text-xs sm:text-sm rounded-lg transition-colors cursor-pointer ${
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {dateFilterKind === 'custom' && (
        <input
          type="date"
          value={customDateFilter}
          onChange={(e) => dispatch(setListCustomDateFilter(e.target.value))}
          className="h-9 rounded-xl border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      )}
    </div>
  );
}
