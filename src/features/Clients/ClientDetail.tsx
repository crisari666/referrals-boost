import { useParams, Link } from 'react-router-dom';
import { clients, projects, statusLabels, type ClientStatus, type Client } from '@/data/mockData';
import { useState, useEffect, useMemo, useLayoutEffect } from 'react';
import { toast } from 'sonner';
import { useAppSelector } from '@/store';
import * as clientsService from '@/services/clientsService';
import { mapCreationCustomerToClient } from './use-client';
import { ClientDetailHeader } from './client-detail-header';
import { ClientDetailProfileCard } from './client-detail-profile-card';
import { ClientDetailNotesSection } from './client-detail-notes-section';
import { ClientDetailTimelineSection } from './client-detail-timeline-section';

const ClientDetail = () => {
  const { id } = useParams();
  const mockClient = useMemo(
    () => (id ? clients.find((c) => c.id === id) ?? null : null),
    [id]
  );
  const [remoteClient, setRemoteClient] = useState<Client | null>(null);
  const [creationDetail, setCreationDetail] =
    useState<clientsService.CustomerCreationDetailPayload | null>(null);
  const [remoteLoading, setRemoteLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<ClientStatus>('nuevo');
  const [statusOpen, setStatusOpen] = useState(false);
  const user = useAppSelector((s) => s.auth.user);
  const isPhysical = user?.physical === true;

  const client = mockClient ?? remoteClient;
  const loading = Boolean(id) && !mockClient && remoteLoading;
  const apiCustomer = !mockClient ? creationDetail?.customer : null;

  useEffect(() => {
    if (!id || mockClient) {
      setRemoteClient(null);
      setCreationDetail(null);
      setRemoteLoading(false);
      return;
    }
    let cancelled = false;
    setRemoteLoading(true);
    clientsService
      .getCustomerCreationDetail(id)
      .then((res) => {
        if (cancelled) return;
        if (res.error || res.result === null || !res.result.customer) {
          setRemoteClient(null);
          setCreationDetail(null);
          return;
        }
        setCreationDetail(res.result);
        setRemoteClient(mapCreationCustomerToClient(id, res.result.customer));
      })
      .catch(() => {
        if (!cancelled) {
          setRemoteClient(null);
          setCreationDetail(null);
        }
      })
      .finally(() => {
        if (!cancelled) setRemoteLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, mockClient]);

  useLayoutEffect(() => {
    if (client) setCurrentStatus(client.status);
  }, [client]);

  if (!id || (!loading && !client)) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Cliente no encontrado</p>
        <Link to="/clients" className="text-primary font-medium text-sm mt-2 inline-block">
          Volver a clientes
        </Link>
      </div>
    );
  }

  if (loading || !client) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground text-sm">Cargando cliente...</p>
      </div>
    );
  }

  const projectTitle =
    projects.find((p) => p.id === client.projectInterest)?.title ??
    (client.projectInterest?.trim() ? client.projectInterest : undefined);
  const initials = client.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('');

  const apiNotes = creationDetail?.notes ?? [];
  const apiLogs = creationDetail?.customerLogSituations ?? [];

  const handleStatusChange = (newStatus: ClientStatus) => {
    setCurrentStatus(newStatus);
    setStatusOpen(false);
    toast.success(`Estado actualizado a "${statusLabels[newStatus]}"`);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-4">
      <ClientDetailHeader />

      <ClientDetailProfileCard
        client={client}
        initials={initials}
        projectTitle={projectTitle}
        apiCustomer={apiCustomer}
        isPhysical={isPhysical}
        currentStatus={currentStatus}
        statusOpen={statusOpen}
        onStatusOpenChange={setStatusOpen}
        onStatusChange={handleStatusChange}
      />

      <ClientDetailNotesSection
        isMock={Boolean(mockClient)}
        mockNotes={client.notes}
        apiNotes={apiNotes}
      />

      <ClientDetailTimelineSection isMock={Boolean(mockClient)} client={client} apiLogs={apiLogs} />
    </div>
  );
};

export default ClientDetail;
