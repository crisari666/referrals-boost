import { createAsyncThunk, createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import i18n from "@/i18n";
import { toast } from "sonner";
import { z } from "zod";
import type { Client, ClientStatus } from '@/features/Clients/types/client.type';
import * as clientsService from "@/services/clientsService";
import type { CustomerMineListSort } from "@/services/clientsService";
import type {
  CreationDetailCustomer,
  CustomerEventItem,
  CreationDetailNote,
  CustomerCreationDetailPayload,
  UpdateMsCustomerPayload,
  VendorCustomerStep,
  CustomerMetaLeadMappedFieldsResponse,
  CustomerMetadataResponse,
} from "@/services/clientsService.types";
import type { EditClientFormState } from '@/features/Clients/EditClientModal';
import { COUNTRY_CODES, DEFAULT_COUNTRY, splitStoredPhone } from '@/lib/country-codes';
import type { CountryCode } from '@/lib/country-codes';
import { buildMsPhone, isValidLocalPhone } from '@/lib/phone-e164';
import {
  buildConflictFieldErrors,
  getHttpErrorMessage,
} from '@/lib/parse-api-error';
import axios from 'axios';
import type { RootState } from "@/store";
import type { AddCustomerEventArgs, AddCustomerNoteArgs } from "./clients-slice.types";
import type { VentorScheduleEventApi } from "@/services/scheduleService";
import * as scheduleService from "@/services/scheduleService";

export type ClientsDateFilterKind = "all" | "today" | "yesterday" | "custom";

/** `GET customer/mine?sort=` — matches customers-ms `ListCustomerMineQueryDto`. */
export type ClientsListSort = CustomerMineListSort;

const WITHOUT_STEP_FILTER_ID = "__without_step__";

const emptyVendorEditForm: EditClientFormState = {
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
  isInternational: false,
};

function resolveCountryByCode(code: string): CountryCode {
  return COUNTRY_CODES.find((country) => country.code === code) ?? DEFAULT_COUNTRY;
}

function getEditClientSchema() {
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
      isInternational: z.boolean().optional(),
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

function buildEditFormFromCustomer(c: CreationDetailCustomer): EditClientFormState {
  const fullName = [c.name, c.lastName].filter(Boolean).join(" ").trim() || c.name;
  const interestItems = c.interestProyect ?? [];
  const lastProject =
    interestItems.length > 0
      ? interestItems[interestItems.length - 1]?.proyect?.trim() ?? ""
      : "";
  const whatsappSplit = splitStoredPhone(c.whatsapp ?? c.phone);
  const phoneSplit = splitStoredPhone(c.phone ?? c.whatsapp);
  const sameAsWhatsapp =
    buildMsPhone(whatsappSplit.country, whatsappSplit.local) ===
    buildMsPhone(phoneSplit.country, phoneSplit.local);
  return {
    name: fullName,
    email: c.email ?? "",
    whatsapp: whatsappSplit.local,
    phone: sameAsWhatsapp ? "" : phoneSplit.local,
    whatsappCountryCode: whatsappSplit.country.code,
    phoneCountryCode: phoneSplit.country.code,
    sameAsWhatsapp,
    documentType: c.documentType?.trim().toLowerCase() ?? '',
    document: c.document ?? "",
    projectInterest: lastProject,
    isInternational: c.isInternational === true,
  };
}

export const fetchVendorCustomerSteps = createAsyncThunk<VendorCustomerStep[], void, { rejectValue: string }>(
  "clients/fetchVendorCustomerSteps",
  async (_, { rejectWithValue }) => {
    try {
      return await clientsService.listCustomerSteps();
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : i18n.t("clients.storeStepsLoadFailed");
      return rejectWithValue(message);
    }
  }
);

export const fetchCustomerMetaLeadMappedFields = createAsyncThunk<
  CustomerMetaLeadMappedFieldsResponse,
  string,
  { rejectValue: string }
>("clients/fetchCustomerMetaLeadMappedFields", async (customerId, { rejectWithValue }) => {
  try {
    return await clientsService.getCustomerMetaLeadMappedFields(customerId);
  } catch (err: unknown) {
    const message =
      err && typeof err === "object" && "message" in err
        ? String((err as { message: string }).message)
        : i18n.t("clients.metaLeadLoadFailed");
    return rejectWithValue(message);
  }
});

export const fetchCustomerMetadata = createAsyncThunk<
  CustomerMetadataResponse,
  string,
  { rejectValue: string }
>("clients/fetchCustomerMetadata", async (customerId, { rejectWithValue }) => {
  try {
    return await clientsService.getCustomerMetadata(customerId);
  } catch (err: unknown) {
    const message =
      err && typeof err === "object" && "message" in err
        ? String((err as { message: string }).message)
        : i18n.t("clients.captureLoadFailed");
    return rejectWithValue(message);
  }
});

export const saveCustomerMetadata = createAsyncThunk<
  CustomerMetadataResponse,
  { customerId: string; values: Record<string, string> },
  { rejectValue: string }
>("clients/saveCustomerMetadata", async ({ customerId, values }, { rejectWithValue }) => {
  try {
    return await clientsService.putCustomerMetadata(customerId, { values });
  } catch (err: unknown) {
    toast.error(i18n.t("clients.captureSaveFailed"));
    const message =
      err && typeof err === "object" && "message" in err
        ? String((err as { message: string }).message)
        : i18n.t("clients.captureSaveFailed");
    return rejectWithValue(message);
  }
});

export const fetchVendorCustomerCreationDetail = createAsyncThunk<
  CustomerCreationDetailPayload,
  string,
  { rejectValue: string }
>("clients/fetchVendorCustomerCreationDetail", async (customerId, { rejectWithValue }) => {
  try {
    const res = await clientsService.getCustomerCreationDetail(customerId);
    if (res.error || res.result === null || !res.result.customer) {
      return rejectWithValue(res.error || i18n.t("clients.storeCustomerNotFound"));
    }
    return res.result;
  } catch (err: unknown) {
    const message =
      err && typeof err === "object" && "message" in err
        ? String((err as { message: string }).message)
        : i18n.t("clients.storeCustomerLoadFailed");
    return rejectWithValue(message);
  }
});

export const patchVendorCustomerStepRequest = createAsyncThunk<
  void,
  { customerId: string; stepId: string },
  { rejectValue: string }
>("clients/patchVendorCustomerStepRequest", async ({ customerId, stepId }, { dispatch, rejectWithValue }) => {
  try {
    await clientsService.patchMsCustomerStep(customerId, stepId);
    await dispatch(fetchVendorCustomerCreationDetail(customerId)).unwrap();
    toast.success(i18n.t("clients.storeStepUpdatedToast"));
  } catch (err: unknown) {
    toast.error(i18n.t("clients.storeStepUpdateFailed"));
    const message =
      err && typeof err === "object" && "message" in err
        ? String((err as { message: string }).message)
        : "patch-step-failed";
    return rejectWithValue(message);
  }
});

type SubmitVendorEditReject =
  | string
  | { formErrors: Record<string, string> };

export const submitVendorCustomerEdit = createAsyncThunk<
  void,
  void,
  { rejectValue: SubmitVendorEditReject; state: { clients: ClientsState } }
>("clients/submitVendorCustomerEdit", async (_, { getState, dispatch, rejectWithValue }) => {
  const { vendorCustomerEdit, vendorCreationDetailCustomerId } = getState().clients;
  if (!vendorCreationDetailCustomerId) {
    return rejectWithValue("missing-customer");
  }
  const parsed = getEditClientSchema().safeParse(vendorCustomerEdit.form);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    parsed.error.errors.forEach((e) => {
      fieldErrors[e.path[0] as string] = e.message;
    });
    return rejectWithValue({ formErrors: fieldErrors });
  }
  const parts = parsed.data.name.trim().split(/\s+/);
  const namePart = parts[0] ?? "";
  const lastNamePart = parts.slice(1).join(" ");
  const docType = clientsService.mapVendorDocumentTypeToMs(parsed.data.documentType);
  const whatsappCountry = resolveCountryByCode(parsed.data.whatsappCountryCode);
  const phoneCountry = resolveCountryByCode(parsed.data.phoneCountryCode);
  const whatsappMs = buildMsPhone(whatsappCountry, parsed.data.whatsapp);
  const phoneMs = parsed.data.sameAsWhatsapp
    ? whatsappMs
    : buildMsPhone(phoneCountry, parsed.data.phone);
  const body: UpdateMsCustomerPayload = {
    name: namePart,
    lastName: lastNamePart,
    phone: phoneMs,
    whatsapp: whatsappMs,
    email: parsed.data.email.trim(),
    ...(parsed.data.document?.trim()
      ? { document: parsed.data.document.trim() }
      : { document: '' }),
    ...(docType ? { documentType: docType } : {}),
    isInternational: vendorCustomerEdit.form.isInternational === true,
    interestedProjects: parsed.data.projectInterest?.trim()
      ? [
          {
            projectId: parsed.data.projectInterest.trim(),
            date: new Date().toISOString().slice(0, 10),
          },
        ]
      : [],
  };
  try {
    await clientsService.updateMsCustomer(vendorCreationDetailCustomerId, body);
    await dispatch(fetchVendorCustomerCreationDetail(vendorCreationDetailCustomerId)).unwrap();
    toast.success(i18n.t('clients.storeCustomerUpdatedToast'));
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.status === 409) {
      const apiMsg = getHttpErrorMessage(err, i18n.t('clients.storeCustomerSaveFailed'));
      return rejectWithValue({ formErrors: buildConflictFieldErrors(apiMsg) });
    }
    const message = getHttpErrorMessage(err, i18n.t('clients.storeCustomerSaveFailed'));
    toast.error(message);
    return rejectWithValue('update-failed');
  }
});

export const addCustomerNoteRequest = createAsyncThunk<
  CreationDetailNote,
  AddCustomerNoteArgs,
  { rejectValue: string }
>("clients/addCustomerNoteRequest", async ({ customerId, note }, { rejectWithValue }) => {
  try {
    const created = await clientsService.addCustomerDescription(customerId, note);
    return {
      _id: String(created._id),
      customerId: String(created.customerId ?? customerId),
      note: created.description,
      user: created.user,
      createdAt: created.date,
      updatedAt: created.date,
    };
  } catch (err: unknown) {
    const message =
      err && typeof err === "object" && "message" in err
        ? String((err as { message: string }).message)
        : i18n.t("clients.storeNoteAddFailed");
    return rejectWithValue(message);
  }
});

export const fetchCustomerEventsRequest = createAsyncThunk<
  CustomerEventItem[],
  string,
  { rejectValue: string }
>('clients/fetchCustomerEventsRequest', async (customerId, { rejectWithValue }) => {
  try {
    return await clientsService.listCustomerEvents(customerId);
  } catch (err: unknown) {
    const message =
      err && typeof err === 'object' && 'message' in err
        ? String((err as { message: string }).message)
        : i18n.t("clients.storeEventsLoadFailed");
    return rejectWithValue(message);
  }
});

export const addCustomerEventRequest = createAsyncThunk<
  CustomerEventItem,
  AddCustomerEventArgs,
  { rejectValue: string }
>('clients/addCustomerEventRequest', async ({ customerId, payload }, { rejectWithValue }) => {
  try {
    return await clientsService.createCustomerEvent(customerId, payload);
  } catch (err: unknown) {
    const message =
      err && typeof err === 'object' && 'message' in err
        ? String((err as { message: string }).message)
        : i18n.t("clients.storeEventCreateFailed");
    return rejectWithValue(message);
  }
});

export const fetchVendorScheduleByCustomer = createAsyncThunk<
  VentorScheduleEventApi[],
  string,
  { rejectValue: string }
>("clients/fetchVendorScheduleByCustomer", async (customerId, { rejectWithValue }) => {
  try {
    return await scheduleService.listVentorScheduleByCustomer(customerId);
  } catch (err: unknown) {
    const message =
      err && typeof err === "object" && "message" in err
        ? String((err as { message: string }).message)
        : i18n.t("clients.storeScheduleLoadFailed");
    return rejectWithValue(message);
  }
});

export interface ClientsState {
  list: Client[];
  search: string;
  listSort: ClientsListSort;
  vendorStepCatalog: VendorCustomerStep[];
  vendorStepCatalogStatus: "idle" | "loading" | "succeeded" | "failed";
  listStepFilterId: string | null;
  listDateFilterKind: ClientsDateFilterKind;
  listCustomDateFilter: string;
  vendorCreationDetail: CustomerCreationDetailPayload | null;
  vendorCreationDetailCustomerId: string | null;
  vendorCreationDetailStatus: "idle" | "loading" | "succeeded" | "failed";
  vendorCustomerEdit: {
    open: boolean;
    form: EditClientFormState;
    errors: Record<string, string>;
    submitting: boolean;
  };
  customerEvents: CustomerEventItem[];
  customerEventsStatus: "idle" | "loading" | "succeeded" | "failed";
  customerEventsError: string | null;
  createEventLoading: boolean;
  createEventError: string | null;
  vendorScheduleEvents: VentorScheduleEventApi[];
  vendorScheduleEventsCustomerId: string | null;
  vendorScheduleEventsStatus: "idle" | "loading" | "succeeded" | "failed";
  vendorScheduleEventsError: string | null;
  metaLeadMappedFields: CustomerMetaLeadMappedFieldsResponse | null;
  metaLeadMappedFieldsCustomerId: string | null;
  metaLeadMappedFieldsStatus: "idle" | "loading" | "succeeded" | "failed";
  metaLeadMappedFieldsError: string | null;
  customerMetadata: CustomerMetadataResponse | null;
  customerMetadataCustomerId: string | null;
  customerMetadataStatus: "idle" | "loading" | "succeeded" | "failed";
  customerMetadataError: string | null;
  customerMetadataSaving: boolean;
}

const initialState: ClientsState = {
  list: [],
  search: "",
  listSort: "createdAt",
  vendorStepCatalog: [],
  vendorStepCatalogStatus: "idle",
  listStepFilterId: null,
  listDateFilterKind: "all",
  listCustomDateFilter: "",
  vendorCreationDetail: null,
  vendorCreationDetailCustomerId: null,
  vendorCreationDetailStatus: "idle",
  vendorCustomerEdit: {
    open: false,
    form: emptyVendorEditForm,
    errors: {},
    submitting: false,
  },
  customerEvents: [],
  customerEventsStatus: "idle",
  customerEventsError: null,
  createEventLoading: false,
  createEventError: null,
  vendorScheduleEvents: [],
  vendorScheduleEventsCustomerId: null,
  vendorScheduleEventsStatus: "idle",
  vendorScheduleEventsError: null,
  metaLeadMappedFields: null,
  metaLeadMappedFieldsCustomerId: null,
  metaLeadMappedFieldsStatus: "idle",
  metaLeadMappedFieldsError: null,
  customerMetadata: null,
  customerMetadataCustomerId: null,
  customerMetadataStatus: "idle",
  customerMetadataError: null,
  customerMetadataSaving: false,
};

const clientsSlice = createSlice({
  name: "clients",
  initialState,
  reducers: {
    addClient(state, action: PayloadAction<Client>) {
      state.list.unshift(action.payload);
    },
    updateClient(state, action: PayloadAction<Client>) {
      const idx = state.list.findIndex((c) => c.id === action.payload.id);
      if (idx !== -1) state.list[idx] = action.payload;
    },
    removeClient(state, action: PayloadAction<string>) {
      state.list = state.list.filter((c) => c.id !== action.payload);
    },
    updateClientStatus(state, action: PayloadAction<{ id: string; status: ClientStatus }>) {
      const client = state.list.find((c) => c.id === action.payload.id);
      if (client) client.status = action.payload.status;
    },
    addClientNote(state, action: PayloadAction<{ id: string; note: string }>) {
      const client = state.list.find((c) => c.id === action.payload.id);
      if (client) client.notes.push(action.payload.note);
    },
    addClientInteraction(state, action: PayloadAction<{ id: string; interaction: Client["interactions"][0] }>) {
      const client = state.list.find((c) => c.id === action.payload.id);
      if (client) client.interactions.push(action.payload.interaction);
    },
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },
    setListSort(state, action: PayloadAction<ClientsListSort>) {
      state.listSort = action.payload;
    },
    setClientList(state, action: PayloadAction<Client[]>) {
      state.list = action.payload;
    },
    setListStepFilterId(state, action: PayloadAction<string | null>) {
      state.listStepFilterId = action.payload;
    },
    setListDateFilterKind(state, action: PayloadAction<ClientsDateFilterKind>) {
      state.listDateFilterKind = action.payload;
      if (action.payload !== "custom") {
        state.listCustomDateFilter = "";
      }
    },
    setListCustomDateFilter(state, action: PayloadAction<string>) {
      state.listCustomDateFilter = action.payload.trim();
    },
    clearVendorCreationDetail(state) {
      state.vendorCreationDetail = null;
      state.vendorCreationDetailCustomerId = null;
      state.vendorCreationDetailStatus = "idle";
      state.customerEvents = [];
      state.customerEventsStatus = "idle";
      state.customerEventsError = null;
      state.createEventError = null;
      state.createEventLoading = false;
      state.vendorScheduleEvents = [];
      state.vendorScheduleEventsCustomerId = null;
      state.vendorScheduleEventsStatus = "idle";
      state.vendorScheduleEventsError = null;
      state.metaLeadMappedFields = null;
      state.metaLeadMappedFieldsCustomerId = null;
      state.metaLeadMappedFieldsStatus = "idle";
      state.metaLeadMappedFieldsError = null;
      state.customerMetadata = null;
      state.customerMetadataCustomerId = null;
      state.customerMetadataStatus = "idle";
      state.customerMetadataError = null;
      state.customerMetadataSaving = false;
    },
    openVendorCustomerEditModal(state) {
      const c = state.vendorCreationDetail?.customer;
      if (!c) return;
      state.vendorCustomerEdit.open = true;
      state.vendorCustomerEdit.form = buildEditFormFromCustomer(c);
      state.vendorCustomerEdit.errors = {};
    },
    closeVendorCustomerEditModal(state) {
      state.vendorCustomerEdit.open = false;
      state.vendorCustomerEdit.form = emptyVendorEditForm;
      state.vendorCustomerEdit.errors = {};
      state.vendorCustomerEdit.submitting = false;
    },
    setVendorCustomerEditField(state, action: PayloadAction<{ field: string; value: string | boolean }>) {
      const { field, value } = action.payload;
      (state.vendorCustomerEdit.form as Record<string, string | boolean>)[field] = value;
      state.vendorCustomerEdit.errors[field] = "";
    },
    setVendorCustomerEditErrors(state, action: PayloadAction<Record<string, string>>) {
      state.vendorCustomerEdit.errors = action.payload;
    },
    clearCustomerEventsError(state) {
      state.customerEventsError = null;
      state.createEventError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVendorCustomerSteps.pending, (state) => {
        state.vendorStepCatalogStatus = "loading";
      })
      .addCase(fetchVendorCustomerSteps.fulfilled, (state, action) => {
        state.vendorStepCatalogStatus = "succeeded";
        state.vendorStepCatalog = action.payload;
      })
      .addCase(fetchVendorCustomerSteps.rejected, (state) => {
        state.vendorStepCatalogStatus = "failed";
        state.vendorStepCatalog = [];
      })
      .addCase(fetchVendorCustomerCreationDetail.pending, (state, action) => {
        state.vendorCreationDetailStatus = "loading";
        state.vendorCreationDetailCustomerId = action.meta.arg;
        state.vendorCreationDetail = null;
      })
      .addCase(fetchVendorCustomerCreationDetail.fulfilled, (state, action) => {
        state.vendorCreationDetailStatus = "succeeded";
        state.vendorCreationDetail = action.payload;
      })
      .addCase(fetchVendorCustomerCreationDetail.rejected, (state) => {
        state.vendorCreationDetailStatus = "failed";
        state.vendorCreationDetail = null;
      })
      .addCase(addCustomerNoteRequest.fulfilled, (state, action) => {
        const id = action.meta.arg.customerId;
        if (
          state.vendorCreationDetail &&
          state.vendorCreationDetailCustomerId === id
        ) {
          state.vendorCreationDetail.notes = [action.payload, ...state.vendorCreationDetail.notes];
        }
      })
      .addCase(fetchCustomerEventsRequest.pending, (state) => {
        state.customerEventsStatus = "loading";
        state.customerEventsError = null;
      })
      .addCase(fetchCustomerEventsRequest.fulfilled, (state, action) => {
        state.customerEventsStatus = "succeeded";
        state.customerEvents = action.payload;
      })
      .addCase(fetchCustomerEventsRequest.rejected, (state, action) => {
        state.customerEventsStatus = "failed";
        state.customerEvents = [];
        state.customerEventsError =
          action.payload ?? action.error.message ?? i18n.t("clients.storeEventsLoadFailed");
      })
      .addCase(addCustomerEventRequest.pending, (state) => {
        state.createEventLoading = true;
        state.createEventError = null;
      })
      .addCase(addCustomerEventRequest.fulfilled, (state, action) => {
        state.createEventLoading = false;
        state.customerEvents = [action.payload, ...state.customerEvents];
        const cid = action.meta.arg.customerId;
        const at = action.payload.createdAt;
        const row = state.list.find((c) => c.id === cid);
        if (row && at) {
          row.lastUpdate = at.slice(0, 10);
        }
      })
      .addCase(addCustomerEventRequest.rejected, (state, action) => {
        state.createEventLoading = false;
        state.createEventError =
          action.payload ?? action.error.message ?? i18n.t("clients.storeEventCreateFailed");
      })
      .addCase(submitVendorCustomerEdit.pending, (state) => {
        state.vendorCustomerEdit.submitting = true;
      })
      .addCase(submitVendorCustomerEdit.fulfilled, (state) => {
        state.vendorCustomerEdit.submitting = false;
        state.vendorCustomerEdit.open = false;
        state.vendorCustomerEdit.form = emptyVendorEditForm;
        state.vendorCustomerEdit.errors = {};
      })
      .addCase(submitVendorCustomerEdit.rejected, (state, action) => {
        state.vendorCustomerEdit.submitting = false;
        const p = action.payload;
        if (p && typeof p === "object" && "formErrors" in p) {
          state.vendorCustomerEdit.errors = p.formErrors;
        }
      })
      .addCase(fetchVendorScheduleByCustomer.pending, (state, action) => {
        state.vendorScheduleEventsStatus = "loading";
        state.vendorScheduleEventsCustomerId = action.meta.arg;
        state.vendorScheduleEvents = [];
        state.vendorScheduleEventsError = null;
      })
      .addCase(fetchVendorScheduleByCustomer.fulfilled, (state, action) => {
        state.vendorScheduleEventsStatus = "succeeded";
        state.vendorScheduleEvents = action.payload;
      })
      .addCase(fetchVendorScheduleByCustomer.rejected, (state, action) => {
        state.vendorScheduleEventsStatus = "failed";
        state.vendorScheduleEvents = [];
        state.vendorScheduleEventsError =
          action.payload ?? action.error.message ?? i18n.t("clients.storeScheduleLoadFailed");
      })
      .addCase(fetchCustomerMetaLeadMappedFields.pending, (state, action) => {
        state.metaLeadMappedFieldsStatus = "loading";
        state.metaLeadMappedFieldsCustomerId = action.meta.arg;
        state.metaLeadMappedFields = null;
        state.metaLeadMappedFieldsError = null;
      })
      .addCase(fetchCustomerMetaLeadMappedFields.fulfilled, (state, action) => {
        state.metaLeadMappedFieldsStatus = "succeeded";
        state.metaLeadMappedFields = action.payload;
      })
      .addCase(fetchCustomerMetaLeadMappedFields.rejected, (state, action) => {
        state.metaLeadMappedFieldsStatus = "failed";
        state.metaLeadMappedFields = null;
        state.metaLeadMappedFieldsError =
          action.payload ?? action.error.message ?? i18n.t("clients.metaLeadLoadFailed");
      })
      .addCase(fetchCustomerMetadata.pending, (state, action) => {
        state.customerMetadataStatus = "loading";
        state.customerMetadataCustomerId = action.meta.arg;
        state.customerMetadata = null;
        state.customerMetadataError = null;
      })
      .addCase(fetchCustomerMetadata.fulfilled, (state, action) => {
        state.customerMetadataStatus = "succeeded";
        state.customerMetadata = action.payload;
      })
      .addCase(fetchCustomerMetadata.rejected, (state, action) => {
        state.customerMetadataStatus = "failed";
        state.customerMetadata = null;
        state.customerMetadataError =
          action.payload ?? action.error.message ?? i18n.t("clients.captureLoadFailed");
      })
      .addCase(saveCustomerMetadata.pending, (state) => {
        state.customerMetadataSaving = true;
      })
      .addCase(saveCustomerMetadata.fulfilled, (state, action) => {
        state.customerMetadataSaving = false;
        state.customerMetadataStatus = "succeeded";
        state.customerMetadataCustomerId = action.meta.arg.customerId;
        state.customerMetadata = action.payload;
        state.customerMetadataError = null;
      })
      .addCase(saveCustomerMetadata.rejected, (state) => {
        state.customerMetadataSaving = false;
      });
  },
});

export const {
  addClient,
  updateClient,
  removeClient,
  updateClientStatus,
  addClientNote,
  addClientInteraction,
  setSearch,
  setListSort,
  setClientList,
  setListStepFilterId,
  setListDateFilterKind,
  setListCustomDateFilter,
  clearVendorCreationDetail,
  openVendorCustomerEditModal,
  closeVendorCustomerEditModal,
  setVendorCustomerEditField,
  setVendorCustomerEditErrors,
  clearCustomerEventsError,
} = clientsSlice.actions;

function toYmd(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function resolveSelectedDate(kind: ClientsDateFilterKind, customDate: string): string | null {
  if (kind === "all") return null;
  if (kind === "today") return toYmd(new Date());
  if (kind === "yesterday") {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return toYmd(yesterday);
  }
  const normalized = customDate.trim().slice(0, 10);
  return normalized.length > 0 ? normalized : null;
}

function matchesSearchFilter(client: Client, search: string): boolean {
  const trimmedSearch = search.trim();
  if (trimmedSearch === "") return true;
  const qLower = trimmedSearch.toLowerCase();
  const digitQuery = trimmedSearch.replace(/\D/g, "");
  const nameHit = client.name.toLowerCase().includes(qLower);
  const phoneStr = (client.phone ?? "").trim();
  const waStr = (client.whatsapp ?? "").trim();
  const textHit = phoneStr.toLowerCase().includes(qLower) || waStr.toLowerCase().includes(qLower);
  const digitsPhone = phoneStr.replace(/\D/g, "");
  const digitsWa = waStr.replace(/\D/g, "");
  const digitHit =
    digitQuery.length > 0 && (digitsPhone.includes(digitQuery) || digitsWa.includes(digitQuery));
  return nameHit || textHit || digitHit;
}

function matchesDateFilter(client: Client, selectedDate: string | null): boolean {
  if (selectedDate == null) return true;
  const baseDate = (client.assignedDate?.trim() || client.createdAt?.trim() || "").slice(0, 10);
  return baseDate === selectedDate;
}

function matchesStepFilter(client: Client, stepFilterId: string | null): boolean {
  if (stepFilterId == null) return true;
  if (stepFilterId === WITHOUT_STEP_FILTER_ID) {
    return (client.customerStepId ?? "").trim() === "";
  }
  return (client.customerStepId ?? null) === stepFilterId;
}

export function matchesClientListFilters(
  client: Client,
  filters: {
    search: string;
    listStepFilterId: string | null;
    listDateFilterKind: ClientsDateFilterKind;
    listCustomDateFilter: string;
  }
): boolean {
  const selectedDate = resolveSelectedDate(filters.listDateFilterKind, filters.listCustomDateFilter);
  if (!matchesSearchFilter(client, filters.search)) return false;
  if (!matchesDateFilter(client, selectedDate)) return false;
  return matchesStepFilter(client, filters.listStepFilterId);
}

export const selectFilteredClients = createSelector(
  [
    (state: RootState) => state.clients.list,
    (state: RootState) => state.clients.search,
    (state: RootState) => state.clients.listStepFilterId,
    (state: RootState) => state.clients.listDateFilterKind,
    (state: RootState) => state.clients.listCustomDateFilter,
  ],
  (list, search, listStepFilterId, listDateFilterKind, listCustomDateFilter) =>
    list.filter((client) =>
      matchesClientListFilters(client, {
        search,
        listStepFilterId,
        listDateFilterKind,
        listCustomDateFilter,
      })
    )
);

export default clientsSlice.reducer;
