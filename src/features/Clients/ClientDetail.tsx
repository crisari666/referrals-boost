import { useParams, Link } from 'react-router-dom';
import { clients, type Client } from '@/data/mockData';
import { useEffect, useMemo, useLayoutEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  clearVendorCreationDetail,
  fetchVendorCustomerCreationDetail,
  fetchVendorCustomerSteps,
} from '@/store/clientsSlice';
import { fetchProjects } from '@/store/projectsSlice';
import { mapCreationCustomerToClient, shouldIncludeMockClientsForUser } from './use-client';
import { ClientDetailHeader } from './client-detail-header';
import { ClientDetailProfileCard } from './client-detail-profile-card';
import { ClientDetailNotesSection } from './client-detail-notes-section';
import { ClientDetailTimelineSection } from './client-detail-timeline-section';
import { EditClientModal } from './EditClientModal';

const ClientDetail = () => {
  const { id } = useParams();
  const authUser = useAppSelector((s) => s.auth.user);
  const vendorCreationDetailStatus = useAppSelector((s) => s.clients.vendorCreationDetailStatus);
  const vendorCreationDetail = useAppSelector((s) => s.clients.vendorCreationDetail);
  const vendorCreationDetailCustomerId = useAppSelector((s) => s.clients.vendorCreationDetailCustomerId);
  const dispatch = useAppDispatch();
  const mocksAllowed = shouldIncludeMockClientsForUser(authUser);
  const mockClient = useMemo(
    () => (id && mocksAllowed ? clients.find((c) => c.id === id) ?? null : null),
    [id, mocksAllowed]
  );
  const isPhysical = authUser?.physical === true;

  const detailForRoute =
    id && vendorCreationDetailCustomerId === id ? vendorCreationDetail : null;
  const remoteClient = useMemo((): Client | null => {
    if (!id || mockClient || !detailForRoute?.customer) return null;
    return mapCreationCustomerToClient(id, detailForRoute.customer);
  }, [id, mockClient, detailForRoute]);

  const client = mockClient ?? remoteClient;
  const loading = Boolean(id) && !mockClient && vendorCreationDetailStatus === 'loading';

  useLayoutEffect(() => {
    if (!id || mockClient) {
      dispatch(clearVendorCreationDetail());
      return;
    }
    const req = dispatch(fetchVendorCustomerCreationDetail(id));
    return () => {
      req.abort();
    };
  }, [id, mockClient, dispatch]);

  useEffect(() => {
    if (mockClient) return;
    const p = dispatch(fetchVendorCustomerSteps());
    return () => {
      p.abort();
    };
  }, [dispatch, mockClient]);

  useEffect(() => {
    if (mockClient) return;
    void dispatch(fetchProjects());
  }, [dispatch, mockClient]);

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

  const initials = client.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('');

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-4">
      <ClientDetailHeader />

      <ClientDetailProfileCard
        client={client}
        initials={initials}
        isMock={Boolean(mockClient)}
        isPhysical={isPhysical}
      />

      <ClientDetailNotesSection isMock={Boolean(mockClient)} mockNotes={client.notes} />

      <ClientDetailTimelineSection isMock={Boolean(mockClient)} client={client} />

      <EditClientModal />
    </div>
  );
};

export default ClientDetail;
