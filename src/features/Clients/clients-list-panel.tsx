import { useEffect, useMemo } from 'react';
import ClientRow from './ClientRow';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchProjects } from '@/store/projectsSlice';
import { selectFilteredClients } from '@/store/clientsSlice';

export type ClientsListPanelProps = {
  loadingList: boolean;
};

export function ClientsListPanel({ loadingList }: ClientsListPanelProps) {
  const dispatch = useAppDispatch();
  const projectsList = useAppSelector((s) => s.projects.list);
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
      <p className="text-center text-muted-foreground py-12 text-sm">Cargando clientes...</p>
    );
  }

  return (
    <>
      {clients.map((client, i) => (
        <ClientRow key={client.id} client={client} index={i} projectTitles={projectTitles} />
      ))}
      {clients.length === 0 && (
        <p className="text-center text-muted-foreground py-12 text-sm">No se encontraron clientes</p>
      )}
    </>
  );
}
