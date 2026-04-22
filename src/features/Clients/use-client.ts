import { useAppSelector, useAppDispatch } from '@/store';
import { addClient, setClientList, fetchVendorCustomerSteps } from '@/store/clientsSlice';
import {
  clients as mockClients,
  type Client,
  type ClientStatus,
  type DocumentType,
} from '@/data/mockData';
import * as clientsService from '@/services/clientsService';
import type { AuthUser } from '@/types/auth';
import type { AddClientFormState } from './AddClientModal';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import axios from 'axios';

function parseNestJsMessage(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;
  const m = (data as { message?: unknown }).message;
  if (typeof m === 'string') return m;
  if (Array.isArray(m)) return m.filter(Boolean).map(String).join(', ');
  return null;
}

const MOCK_CLIENTS_DEMO_LOGIN = 'kdev999';

export function shouldIncludeMockClientsForUser(user: AuthUser | null): boolean {
  if (!user) return false;
  const login = user.user.toLowerCase();
  const localPart = user.email.split('@')[0]?.toLowerCase() ?? '';
  return login === MOCK_CLIENTS_DEMO_LOGIN || localPart === MOCK_CLIENTS_DEMO_LOGIN;
}

const apiStatusToClient: Record<number, ClientStatus> = {
  0: 'nuevo',
  1: 'interesado',
  2: 'agendo_cita',
  3: 'pago_reserva',
  4: 'cerrado',
};

export function mapApiCustomerToClient(c: clientsService.CustomerByCreator): Client {
  const name = [c.name, c.lastName].filter(Boolean).join(' ').trim() || c.name;
  const interests = c.interestedProjects ?? [];
  const lastProjectId =
    interests.length > 0
      ? String(interests[interests.length - 1]?.projectId ?? '').trim()
      : '';
  return {
    id: c._id,
    name,
    email: c.email || undefined,
    phone: c.phone || undefined,
    whatsapp: c.whatsapp ?? '',
    projectInterest: lastProjectId,
    status: apiStatusToClient[c.status] ?? 'nuevo',
    createdAt: c.createdAt?.split('T')[0] ?? '',
    assignedDate: c.assignedDate?.split('T')[0] ?? undefined,
    notes: [],
    interactions: [],
    ...(c.customerStepId != null && String(c.customerStepId).trim() !== ''
      ? { customerStepId: String(c.customerStepId) }
      : {}),
  };
}

export function mapCreationCustomerToClient(
  customerId: string,
  c: clientsService.CreationDetailCustomer
): Client {
  const name = [c.name, c.lastName].filter(Boolean).join(' ').trim() || c.name;
  const items = c.interestProyect ?? [];
  const lastProyect =
    items.length > 0 ? String(items[items.length - 1]?.proyect ?? '').trim() : '';
  return {
    id: customerId,
    name,
    email: c.email || undefined,
    phone: c.phone || undefined,
    whatsapp: c.whatsapp ?? '',
    projectInterest: lastProyect,
    status: apiStatusToClient[c.status] ?? 'nuevo',
    createdAt: c.createdAt?.split('T')[0] ?? '',
    notes: [],
    interactions: [],
    ...(c.customerStepId != null && String(c.customerStepId).trim() !== ''
      ? { customerStepId: String(c.customerStepId) }
      : {}),
  };
}

const clientSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio').max(100),
  email: z.string().trim().email('Correo inválido').max(255),
  whatsapp: z.string().trim().min(1, 'WhatsApp es obligatorio').max(40),
  phone: z.string().trim().min(1, 'El teléfono es obligatorio').max(40),
  documentType: z.string().optional(),
  document: z.string().trim().max(30).optional(),
  projectInterest: z.string().optional().or(z.literal('')),
  description: z.string().trim().min(1, 'La descripción es obligatoria'),
});

const emptyForm: AddClientFormState = {
  name: '',
  email: '',
  whatsapp: '',
  phone: '',
  documentType: '',
  document: '',
  projectInterest: '',
  description: '',
};

export function useClient() {
  const dispatch = useAppDispatch();
  const clientList = useAppSelector((state) => state.clients.list);
  const authUser = useAppSelector((state) => state.auth.user);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadingList, setLoadingList] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoadingList(true);
    const stepsTask = dispatch(fetchVendorCustomerSteps());
    clientsService
      .getCustomersByCreator()
      .then((res) => {
        if (cancelled || res.error) return;
        const apiList = (res.result ?? []).map(mapApiCustomerToClient);
        const combined = shouldIncludeMockClientsForUser(authUser)
          ? [...mockClients, ...apiList]
          : apiList;
        dispatch(setClientList(combined));
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingList(false);
      });
    return () => {
      cancelled = true;
      stepsTask.abort();
    };
  }, [dispatch, authUser]);

  const updateField = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: '' }));
  };

  const handleSubmit = async () => {
    const result = clientSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((e) => {
        fieldErrors[e.path[0] as string] = e.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      const dateStr = new Date().toISOString().split('T')[0];
      const interestProyect: clientsService.InterestProyectItem[] | undefined =
        result.data.projectInterest?.trim()
          ? [{ proyect: result.data.projectInterest.trim(), date: dateStr }]
          : undefined;

      const payload: clientsService.CreateVendorCustomerPayload = {
        name: result.data.name.trim(),
        email: result.data.email.trim(),
        whatsapp: result.data.whatsapp.trim(),
        phone: result.data.phone.trim(),
        notes: [result.data.description.trim()],
        ...(result.data.documentType?.trim()
          ? { documentType: result.data.documentType.trim() }
          : {}),
        ...(result.data.document?.trim()
          ? { document: result.data.document.trim() }
          : {}),
        ...(interestProyect ? { interestProyect } : {}),
      };

      const created = await clientsService.createVendorCustomer(payload);

      if (created.error) {
        throw new Error(created.error);
      }

      const r = created.result;
      const displayName =
        [r.name, r.lastName].filter(Boolean).join(' ').trim() || r.name;

      const newClient: Client = {
        id: r._id,
        name: displayName,
        email: r.email ?? result.data.email,
        whatsapp: r.whatsapp ?? result.data.whatsapp,
        phone: r.phone || undefined,
        documentType: (result.data.documentType as DocumentType) || undefined,
        document: r.document || result.data.document || undefined,
        projectInterest: result.data.projectInterest,
        status: 'nuevo',
        createdAt: dateStr,
        notes: [],
        interactions: [
          {
            date: dateStr,
            type: 'Alta',
            detail: 'Cliente registrado en la plataforma',
          },
        ],
      };

      dispatch(addClient(newClient));
      setShowModal(false);
      setForm(emptyForm);
      setErrors({});
      toast.success(`Cliente "${newClient.name}" agregado exitosamente`);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        const apiMsg = parseNestJsMessage(err.response.data)?.trim();
        const dup =
          apiMsg && apiMsg.length > 0
            ? apiMsg
            : 'Este número de teléfono ya está registrado.';
        setErrors({ phone: dup });
        return;
      }
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'No se pudo crear el cliente. Intenta de nuevo.';
      toast.error(message);
    }
  };

  const closeAddModal = () => {
    setShowModal(false);
    setErrors({});
  };

  return {
    clientList,
    loadingList,
    showModal,
    setShowModal,
    closeAddModal,
    form,
    errors,
    updateField,
    submitNewClient: handleSubmit,
  };
}
