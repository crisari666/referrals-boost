import ClientRow from './ClientRow';
import type { Client } from '@/data/mockData';

export type ClientsListPanelProps = {
  loadingList: boolean;
  clients: Client[];
};

export function ClientsListPanel({ loadingList, clients }: ClientsListPanelProps) {
  if (loadingList) {
    return (
      <p className="text-center text-muted-foreground py-12 text-sm">Cargando clientes...</p>
    );
  }

  return (
    <>
      {clients.map((client, i) => (
        <ClientRow key={client.id} client={client} index={i} />
      ))}
      {clients.length === 0 && (
        <p className="text-center text-muted-foreground py-12 text-sm">No se encontraron clientes</p>
      )}
    </>
  );
}
