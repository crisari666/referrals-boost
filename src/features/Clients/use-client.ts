import i18n from '@/i18n';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '@/store';
import { addClient, setClientList, fetchVendorCustomerSteps } from '@/store/clientsSlice';
import type { Client, ClientStatus } from '@/features/Clients/types/client.type';
import * as clientsService from '@/services/clientsService';
import type { AddClientFormState } from './AddClientModal';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import axios from 'axios';
import { COUNTRY_CODES, DEFAULT_COUNTRY } from '@/lib/country-codes';
import type { CountryCode } from '@/lib/country-codes';
import { buildMsPhone, isValidLocalPhone } from '@/lib/phone-e164';
import {
  buildConflictFieldErrors,
  getHttpErrorMessage,
} from '@/lib/parse-api-error';

const apiStatusToClient: Record<number, ClientStatus> = {
  0: 'nuevo',
  1: 'interesado',
  2: 'agendo_cita',
  3: 'pago_reserva',
  4: 'cerrado',
};

function resolveCountryByCode(code: string): CountryCode {
  return COUNTRY_CODES.find((country) => country.code === code) ?? DEFAULT_COUNTRY;
}

export function mapApiCustomerToClient(c: clientsService.CustomerByCreator): Client {
  const name = [c.name, c.lastName].filter(Boolean).join(' ').trim() || c.name;
  const interests = c.interestedProjects ?? [];
  const lastProjectId =
    interests.length > 0
      ? String(interests[interests.length - 1]?.projectId ?? '').trim()
      : '';
  return {
    id:
      clientsService.normalizeMsCustomerDocumentId(c._id) ||
      (typeof c._id === 'string' ? c._id : ''),
    name,
    email: c.email || undefined,
    phone: c.phone || undefined,
    whatsapp: c.whatsapp ?? '',
    projectInterest: lastProjectId,
    status: apiStatusToClient[c.status] ?? 'nuevo',
    createdAt: c.createdAt?.split('T')[0] ?? '',
    ...(c.lastUpdate != null && String(c.lastUpdate).trim() !== ''
      ? { lastUpdate: new Date(c.lastUpdate).toISOString().slice(0, 10) }
      : {}),
    assignedDate: c.assignedDate?.split('T')[0] ?? undefined,
    notes: [],
    interactions: [],
    ...(c.customerStepId != null && String(c.customerStepId).trim() !== ''
      ? { customerStepId: String(c.customerStepId) }
      : {}),
    ...(c.isInternational === true && { isInternational: true }),
  };
}

export function mapCreationCustomerToClient(
  customerId: string,
  c: clientsService.CreationDetailCustomer,
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
    ...(c.isInternational === true && { isInternational: true }),
  };
}

function getClientSchema() {
  return z
    .object({
      name: z.string().trim().min(1, i18n.t('validation.nameRequired')).max(100),
      email: z.string().trim().email(i18n.t('validation.emailInvalid')).max(255),
      whatsapp: z.string().trim().min(1, i18n.t('validation.whatsappRequired')).max(20),
      phone: z.string().trim().max(20),
      whatsappCountryCode: z.string().min(2),
      phoneCountryCode: z.string().min(2),
      sameAsWhatsapp: z.boolean(),
      documentType: z.string().optional(),
      document: z.string().trim().max(30).optional(),
      projectInterest: z.string().optional().or(z.literal('')),
      description: z.string().trim().min(1, i18n.t('validation.descriptionRequired')),
    })
    .superRefine((data, ctx) => {
      if (!isValidLocalPhone(data.whatsapp)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: i18n.t('validation.whatsappInvalid'),
          path: ['whatsapp'],
        });
      }
      if (!data.sameAsWhatsapp) {
        if (!data.phone.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: i18n.t('validation.phoneRequired'),
            path: ['phone'],
          });
        } else if (!isValidLocalPhone(data.phone)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: i18n.t('validation.phoneInvalid'),
            path: ['phone'],
          });
        }
        const whatsappCountry = resolveCountryByCode(data.whatsappCountryCode);
        const phoneCountry = resolveCountryByCode(data.phoneCountryCode);
        if (
          buildMsPhone(whatsappCountry, data.whatsapp) ===
          buildMsPhone(phoneCountry, data.phone)
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: i18n.t('validation.phoneSameAsWhatsapp'),
            path: ['phone'],
          });
        }
      }
    });
}

const emptyForm: AddClientFormState = {
  name: '',
  email: '',
  whatsapp: '',
  phone: '',
  whatsappCountryCode: DEFAULT_COUNTRY.code,
  phoneCountryCode: DEFAULT_COUNTRY.code,
  sameAsWhatsapp: true,
  documentType: '',
  document: '',
  projectInterest: '',
  description: '',
};

export function useClient() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const clientList = useAppSelector((state) => state.clients.list);
  const listSort = useAppSelector((state) => state.clients.listSort);
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
      .getCustomersByCreator(listSort)
      .then((res) => {
        if (cancelled || res.error) return;
        const apiList = (res.result ?? []).map(mapApiCustomerToClient);
        dispatch(setClientList(apiList));
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingList(false);
      });
    return () => {
      cancelled = true;
      stepsTask.abort();
    };
  }, [dispatch, authUser, listSort]);

  const updateField = (field: string, value: string | boolean) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: '' }));
  };

  const handleSubmit = async () => {
    const result = getClientSchema().safeParse(form);
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
      const whatsappCountry = resolveCountryByCode(result.data.whatsappCountryCode);
      const phoneCountry = resolveCountryByCode(result.data.phoneCountryCode);
      const whatsappMs = buildMsPhone(whatsappCountry, result.data.whatsapp);
      const phoneMs = result.data.sameAsWhatsapp
        ? whatsappMs
        : buildMsPhone(phoneCountry, result.data.phone);

      const payload: clientsService.CreateVendorCustomerPayload = {
        name: result.data.name.trim(),
        email: result.data.email.trim(),
        whatsapp: whatsappMs,
        phone: phoneMs,
        notes: [result.data.description.trim()],
        isReferral: authUser !== null && !authUser.physical,
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
        whatsapp: r.whatsapp ?? whatsappMs,
        phone: r.phone || phoneMs || undefined,
        document: r.document || result.data.document || undefined,
        projectInterest: result.data.projectInterest,
        status: 'nuevo',
        createdAt: dateStr,
        notes: [],
        interactions: [
          {
            date: dateStr,
            type: t('clients.interactionTypeRegister'),
            detail: t('clients.interactionDetailRegister'),
          },
        ],
      };

      dispatch(addClient(newClient));
      setShowModal(false);
      setForm(emptyForm);
      setErrors({});
      toast.success(t('clients.clientAddedToast', { name: newClient.name }));
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        const apiMsg = getHttpErrorMessage(err, t('clients.phoneDuplicateDefault'));
        setErrors(buildConflictFieldErrors(apiMsg));
        return;
      }
      const message = getHttpErrorMessage(err, t('clients.createClientFailed'));
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
