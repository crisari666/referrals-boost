import { useParams, Link } from 'react-router-dom';
import { clients, projects, statusLabels, type ClientStatus, type Client } from '@/data/mockData';
import { useState, useEffect, useMemo, useLayoutEffect } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '@/store';
import * as clientsService from '@/services/clientsService';
import { mapVendorDocumentTypeToMs } from '@/services/clientsService';
import { addCustomerNoteRequest, fetchVendorCustomerSteps } from '@/store/clientsSlice';
import {
  mapCreationCustomerToClient,
  shouldIncludeMockClientsForUser,
} from './use-client';
import { ClientDetailHeader } from './client-detail-header';
import { ClientDetailProfileCard } from './client-detail-profile-card';
import { ClientDetailNotesSection } from './client-detail-notes-section';
import { ClientDetailTimelineSection } from './client-detail-timeline-section';
import { EditClientModal, type EditClientFormState } from './EditClientModal';

const editClientSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio').max(100),
  email: z.string().trim().email('Correo inválido').max(255),
  whatsapp: z.string().trim().min(1, 'WhatsApp es obligatorio').max(40),
  phone: z.string().trim().min(1, 'El teléfono es obligatorio').max(40),
  documentType: z.string().optional(),
  document: z.string().trim().max(30).optional(),
  projectInterest: z.string().optional().or(z.literal('')),
});

const emptyEditForm: EditClientFormState = {
  name: '',
  email: '',
  whatsapp: '',
  phone: '',
  documentType: '',
  document: '',
  projectInterest: '',
};

function buildEditFormFromCustomer(
  c: clientsService.CreationDetailCustomer
): EditClientFormState {
  const fullName = [c.name, c.lastName].filter(Boolean).join(' ').trim() || c.name;
  const firstProject =
    c.interestProyect?.find((x) => x.proyect?.trim())?.proyect?.trim() ?? '';
  let documentTypeUi = '';
  const dt = c.documentType?.toLowerCase();
  if (dt === 'cc') documentTypeUi = 'INE';
  else if (dt === 'passport') documentTypeUi = 'Pasaporte';
  return {
    name: fullName,
    email: c.email ?? '',
    whatsapp: c.whatsapp ?? '',
    phone: c.phone ?? '',
    documentType: documentTypeUi,
    document: c.document ?? '',
    projectInterest: firstProject,
  };
}

const ClientDetail = () => {
  const { id } = useParams();
  const authUser = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const mocksAllowed = shouldIncludeMockClientsForUser(authUser);
  const mockClient = useMemo(
    () => (id && mocksAllowed ? clients.find((c) => c.id === id) ?? null : null),
    [id, mocksAllowed]
  );
  const [remoteClient, setRemoteClient] = useState<Client | null>(null);
  const [creationDetail, setCreationDetail] =
    useState<clientsService.CustomerCreationDetailPayload | null>(null);
  const [remoteLoading, setRemoteLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<ClientStatus>('nuevo');
  const [statusOpen, setStatusOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<EditClientFormState>(emptyEditForm);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [editSubmitting, setEditSubmitting] = useState(false);
  const isPhysical = authUser?.physical === true;

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

  useEffect(() => {
    if (mockClient) return;
    const p = dispatch(fetchVendorCustomerSteps());
    return () => {
      p.abort();
    };
  }, [dispatch, mockClient]);

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

  const refreshRemoteCustomer = async (customerId: string) => {
    const res = await clientsService.getCustomerCreationDetail(customerId);
    if (res.error || !res.result?.customer) return;
    setCreationDetail(res.result);
    setRemoteClient(mapCreationCustomerToClient(customerId, res.result.customer));
  };

  const handleAddNote = async (note: string) => {
    if (!id || mockClient) return;
    const created = await dispatch(addCustomerNoteRequest({ customerId: id, note })).unwrap();
    setCreationDetail((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        notes: [created, ...prev.notes],
      };
    });
  };

  const handleLegacyStatusChange = (newStatus: ClientStatus) => {
    setCurrentStatus(newStatus);
    setStatusOpen(false);
    toast.success(`Estado actualizado a "${statusLabels[newStatus]}"`);
  };

  const handleCatalogStepChange = async (stepId: string) => {
    if (!id || mockClient) return;
    try {
      await clientsService.patchMsCustomerStep(id, stepId);
      await refreshRemoteCustomer(id);
      toast.success('Etapa actualizada');
    } catch {
      toast.error('No se pudo actualizar la etapa');
    }
  };

  const openEditModal = () => {
    if (!creationDetail?.customer) return;
    setEditForm(buildEditFormFromCustomer(creationDetail.customer));
    setEditErrors({});
    setEditOpen(true);
  };

  const updateEditField = (field: string, value: string) => {
    setEditForm((f) => ({ ...f, [field]: value }));
    setEditErrors((e) => ({ ...e, [field]: '' }));
  };

  const handleEditSubmit = async () => {
    if (!id || mockClient) return;
    const parsed = editClientSchema.safeParse(editForm);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.errors.forEach((e) => {
        fieldErrors[e.path[0] as string] = e.message;
      });
      setEditErrors(fieldErrors);
      return;
    }
    const parts = parsed.data.name.trim().split(/\s+/);
    const namePart = parts[0] ?? '';
    const lastNamePart = parts.slice(1).join(' ');
    const docType = mapVendorDocumentTypeToMs(parsed.data.documentType);
    const body: clientsService.UpdateMsCustomerPayload = {
      name: namePart,
      lastName: lastNamePart,
      phone: parsed.data.phone.trim(),
      whatsapp: parsed.data.whatsapp.trim(),
      email: parsed.data.email.trim(),
      ...(parsed.data.document?.trim()
        ? { document: parsed.data.document.trim() }
        : { document: '' }),
      ...(docType ? { documentType: docType } : {}),
      interestedProjects: parsed.data.projectInterest?.trim()
        ? [
            {
              projectId: parsed.data.projectInterest.trim(),
              date: new Date().toISOString().slice(0, 10),
            },
          ]
        : [],
    };
    setEditSubmitting(true);
    try {
      await clientsService.updateMsCustomer(id, body);
      await refreshRemoteCustomer(id);
      setEditOpen(false);
      toast.success('Cliente actualizado');
    } catch {
      toast.error('No se pudo guardar los cambios');
    } finally {
      setEditSubmitting(false);
    }
  };

  const currentStepId = apiCustomer?.customerStepId ?? null;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-4">
      <ClientDetailHeader />

      <ClientDetailProfileCard
        client={client}
        initials={initials}
        projectTitle={projectTitle}
        apiCustomer={apiCustomer}
        isPhysical={isPhysical}
        showEditCustomer={!mockClient && Boolean(creationDetail?.customer)}
        onEditCustomerClick={mockClient ? undefined : openEditModal}
        currentCustomerStepId={currentStepId}
        currentStatus={currentStatus}
        statusOpen={statusOpen}
        onStatusOpenChange={setStatusOpen}
        onLegacyStatusChange={handleLegacyStatusChange}
        onCatalogStepChange={mockClient ? undefined : handleCatalogStepChange}
      />

      <ClientDetailNotesSection
        isMock={Boolean(mockClient)}
        mockNotes={client.notes}
        apiNotes={apiNotes}
        onAddNote={handleAddNote}
      />

      <ClientDetailTimelineSection isMock={Boolean(mockClient)} client={client} apiLogs={apiLogs} />

      <EditClientModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        form={editForm}
        errors={editErrors}
        updateField={updateEditField}
        onSubmit={handleEditSubmit}
        submitting={editSubmitting}
      />
    </div>
  );
};

export default ClientDetail;
