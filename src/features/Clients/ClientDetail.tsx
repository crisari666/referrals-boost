import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Client } from '@/features/Clients/types/client.type';
import { useEffect, useMemo, useLayoutEffect, useState } from 'react';
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
import { ClientDetailDownPaymentsSection } from './client-detail-down-payments-section';
import { ClientDetailTimelineSection } from './client-detail-timeline-section';
import { ClientDetailMetaLeadFieldsSection } from './client-detail-meta-lead-fields-section';
import { ClientDetailCaptureSection } from './client-detail-capture-section';
import { ClientDetailTabsBar } from './client-detail-tabs-bar';
import { ClientDetailTabSwipe } from './client-detail-tab-swipe';
import { EditClientModal } from './EditClientModal';
import { Tabs, TabsContent, TabsTrigger } from '@/components/ui/tabs';

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

  const tabValues = useMemo(() => {
    if (isPhysical) {
      return ['meta', 'capture', 'notes', 'payments', 'timeline'] as const;
    }
    return ['notes', 'capture', 'timeline'] as const;
  }, [isPhysical]);

  const defaultTab = isPhysical ? 'meta' : 'notes';
  const [activeTab, setActiveTab] = useState<string>(defaultTab);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab, id]);

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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <ClientDetailTabsBar>
          {isPhysical ? (
            <TabsTrigger value="meta" className="cursor-pointer shrink-0 min-w-[7rem]">
              {t('clients.metaLeadTitle')}
            </TabsTrigger>
          ) : null}
          {!isPhysical ? (
            <TabsTrigger value="notes" className="cursor-pointer shrink-0 min-w-[7rem]">
              {t('clients.notesTitle')}
            </TabsTrigger>
          ) : null}
          <TabsTrigger value="capture" className="cursor-pointer shrink-0 min-w-[7rem]">
            {t('clients.captureTitle')}
          </TabsTrigger>
          {isPhysical ? (
            <TabsTrigger value="notes" className="cursor-pointer shrink-0 min-w-[7rem]">
              {t('clients.notesTitle')}
            </TabsTrigger>
          ) : null}
          {isPhysical ? (
            <TabsTrigger value="payments" className="cursor-pointer shrink-0 min-w-[7rem]">
              {t('downPayments.title')}
            </TabsTrigger>
          ) : null}
          <TabsTrigger value="timeline" className="cursor-pointer shrink-0 min-w-[7rem]">
            {t('clients.timelineApiTitle')}
          </TabsTrigger>
        </ClientDetailTabsBar>
        <ClientDetailTabSwipe
          tabValues={tabValues}
          activeValue={activeTab}
          onValueChange={setActiveTab}
        >
          {isPhysical ? (
            <TabsContent value="meta" className="mt-3">
              <ClientDetailMetaLeadFieldsSection />
            </TabsContent>
          ) : null}
          <TabsContent value="capture" className="mt-3">
            <ClientDetailCaptureSection />
          </TabsContent>
          <TabsContent value="notes" className="mt-3">
            <ClientDetailNotesSection />
          </TabsContent>
          {isPhysical ? (
            <TabsContent value="payments" className="mt-3">
              <ClientDetailDownPaymentsSection />
            </TabsContent>
          ) : null}
          <TabsContent value="timeline" className="mt-3">
            <ClientDetailTimelineSection />
          </TabsContent>
        </ClientDetailTabSwipe>
      </Tabs>

      <EditClientModal />
    </div>
  );
};

export default ClientDetail;
