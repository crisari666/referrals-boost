import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import ClientRow from './ClientRow';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchProjects } from '@/store/projectsSlice';
import { selectFilteredClients, setListSort, type ClientsListSort } from '@/store/clientsSlice';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type ClientsListPanelProps = {
  loadingList: boolean;
};

export function ClientsListPanel({ loadingList }: ClientsListPanelProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const projectsList = useAppSelector((s) => s.projects.list);
  const listSort = useAppSelector((s) => s.clients.listSort);
  const clients = useAppSelector(selectFilteredClients);

  useEffect(() => {
    void dispatch(fetchProjects());
  }, [dispatch]);

  const projectTitles = useMemo(() => {
    const map: Record<string, string> = {};
    for (const p of projectsList) {
      map[p.id] = p.title;
    }
    return map;
  }, [projectsList]);

  if (loadingList) {
    return (
      <p className="text-center text-muted-foreground py-12 text-sm">{t('clients.loadingList')}</p>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
        <span className="text-xs text-muted-foreground shrink-0">{t('clients.listSortLabel')}</span>
        <Select
          value={listSort}
          onValueChange={(v) => dispatch(setListSort(v as ClientsListSort))}
        >
          <SelectTrigger className="w-full sm:w-[220px] h-10 rounded-xl border-border cursor-pointer">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt" className="cursor-pointer">
              {t('clients.listSortCreatedAt')}
            </SelectItem>
            <SelectItem value="lastUpdate" className="cursor-pointer">
              {t('clients.listSortLastUpdate')}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      {clients.map((client, i) => (
        <ClientRow key={client.id} client={client} index={i} projectTitles={projectTitles} />
      ))}
      {clients.length === 0 && (
        <p className="text-center text-muted-foreground py-12 text-sm">{t('clients.emptyList')}</p>
      )}
    </>
  );
}
