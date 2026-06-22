import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Client } from '@/features/Clients/types/client.type';
import { useEffect, useMemo, useLayoutEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  clearVendorCreationDetail,
  fetchVendorCustomerCreationDetail,
  fetchVendorCustomerSteps,
} from '@/store/clientsSlice';
import { fetchProjects } from '@/store/projectsSlice';
import { mapCreationCustomerToClient } from './use-client';
import { ClientDetailHeader } from './client-detail-header';
import { ClientDetailProfileCard } from './client-detail-profile-card';
import { ClientDetailNotesSection } from './client-detail-notes-section';
import { ClientDetailTimelineSection } from './client-detail-timeline-section';
import { ClientDetailMetaLeadFieldsSection } from './client-detail-meta-lead-fields-section';
import { EditClientModal } from './EditClientModal';

const ClientDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const authUser = useAppSelector((s) => s.auth.user);
  const vendorCreationDetailStatus = useAppSelector((s) => s.clients.vendorCreationDetailStatus);
  const vendorCreationDetail = useAppSelector((s) => s.clients.vendorCreationDetail);
  const vendorCreationDetailCustomerId = useAppSelector((s) => s.clients.vendorCreationDetailCustomerId);
  const dispatch = useAppDispatch();
  const isPhysical = authUser?.physical === true;

  const detailForRoute =
    id && vendorCreationDetailCustomerId === id ? vendorCreationDetail : null;
  const client = useMemo((): Client | null => {
    if (!id || !detailForRoute?.customer) return null;
    return mapCreationCustomerToClient(id, detailForRoute.customer);
  }, [id, detailForRoute]);

  const loading = Boolean(id) && vendorCreationDetailStatus === 'loading';

  useLayoutEffect(() => {
    if (!id) {
      dispatch(clearVendorCreationDetail());
      return;
    }
    const req = dispatch(fetchVendorCustomerCreationDetail(id));
    return () => {
      req.abort();
    };
  }, [id, dispatch]);

  useEffect(() => {
    const p = dispatch(fetchVendorCustomerSteps());
    return () => {
      p.abort();
    };
  }, [dispatch]);

  useEffect(() => {
    void dispatch(fetchProjects());
  }, [dispatch]);

  if (!id || (!loading && !client)) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">{t('clients.notFound')}</p>
        <Link to="/clients" className="text-primary font-medium text-sm mt-2 inline-block">
          {t('clients.backToClients')}
        </Link>
      </div>
    );
  }

  if (loading || !client) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground text-sm">{t('clients.loadingDetail')}</p>
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
      <ClientDetailHeader customerId={id} isPhysical={isPhysical} />

      <ClientDetailProfileCard
        client={client}
        initials={initials}
        isPhysical={isPhysical}
      />
      {isPhysical ? <ClientDetailMetaLeadFieldsSection /> : null}

      <ClientDetailNotesSection />

      <ClientDetailTimelineSection />

      <EditClientModal />
    </div>
  );
};

export default ClientDetail;
