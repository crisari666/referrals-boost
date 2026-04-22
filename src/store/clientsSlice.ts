import { createAsyncThunk, createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { toast } from "sonner";
import { z } from "zod";
import { clients as initialClients, type Client, type ClientStatus } from "@/data/mockData";
import * as clientsService from "@/services/clientsService";
import type {
  CreationDetailCustomer,
  CreationDetailNote,
  CustomerCreationDetailPayload,
  UpdateMsCustomerPayload,
  VendorCustomerStep,
} from "@/services/clientsService.types";
import type { EditClientFormState } from "@/features/Clients/EditClientModal";
import type { RootState } from "@/store";

type AddCustomerNoteArgs = {
  customerId: string;
  note: string;
};

export type ClientsDateFilterKind = "all" | "today" | "yesterday" | "custom";

const WITHOUT_STEP_FILTER_ID = "__without_step__";

const emptyVendorEditForm: EditClientFormState = {
  name: "",
  email: "",
  whatsapp: "",
  phone: "",
  documentType: "",
  document: "",
  projectInterest: "",
};

const editClientSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(100),
  email: z.string().trim().email("Correo inválido").max(255),
  whatsapp: z.string().trim().min(1, "WhatsApp es obligatorio").max(40),
  phone: z.string().trim().min(1, "El teléfono es obligatorio").max(40),
  documentType: z.string().optional(),
  document: z.string().trim().max(30).optional(),
  projectInterest: z.string().optional().or(z.literal("")),
});

function buildEditFormFromCustomer(c: CreationDetailCustomer): EditClientFormState {
  const fullName = [c.name, c.lastName].filter(Boolean).join(" ").trim() || c.name;
  const interestItems = c.interestProyect ?? [];
  const lastProject =
    interestItems.length > 0
      ? interestItems[interestItems.length - 1]?.proyect?.trim() ?? ""
      : "";
  let documentTypeUi = "";
  const dt = c.documentType?.toLowerCase();
  if (dt === "cc") documentTypeUi = "INE";
  else if (dt === "passport") documentTypeUi = "Pasaporte";
  return {
    name: fullName,
    email: c.email ?? "",
    whatsapp: c.whatsapp ?? "",
    phone: c.phone ?? "",
    documentType: documentTypeUi,
    document: c.document ?? "",
    projectInterest: lastProject,
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
          : "No se pudieron cargar las etapas.";
      return rejectWithValue(message);
    }
  }
);

export const fetchVendorCustomerCreationDetail = createAsyncThunk<
  CustomerCreationDetailPayload,
  string,
  { rejectValue: string }
>("clients/fetchVendorCustomerCreationDetail", async (customerId, { rejectWithValue }) => {
  try {
    const res = await clientsService.getCustomerCreationDetail(customerId);
    if (res.error || res.result === null || !res.result.customer) {
      return rejectWithValue(res.error || "Cliente no encontrado");
    }
    return res.result;
  } catch (err: unknown) {
    const message =
      err && typeof err === "object" && "message" in err
        ? String((err as { message: string }).message)
        : "No se pudo cargar el cliente.";
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
    toast.success("Etapa actualizada");
  } catch (err: unknown) {
    toast.error("No se pudo actualizar la etapa");
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
  const parsed = editClientSchema.safeParse(vendorCustomerEdit.form);
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
  const body: UpdateMsCustomerPayload = {
    name: namePart,
    lastName: lastNamePart,
    phone: parsed.data.phone.trim(),
    whatsapp: parsed.data.whatsapp.trim(),
    email: parsed.data.email.trim(),
    ...(parsed.data.document?.trim()
      ? { document: parsed.data.document.trim() }
      : { document: "" }),
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
  try {
    await clientsService.updateMsCustomer(vendorCreationDetailCustomerId, body);
    await dispatch(fetchVendorCustomerCreationDetail(vendorCreationDetailCustomerId)).unwrap();
    toast.success("Cliente actualizado");
  } catch {
    toast.error("No se pudo guardar los cambios");
    return rejectWithValue("update-failed");
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
        : "No se pudo agregar la nota.";
    return rejectWithValue(message);
  }
});

export interface ClientsState {
  list: Client[];
  search: string;
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
}

const initialState: ClientsState = {
  list: initialClients,
  search: "",
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
    setVendorCustomerEditField(state, action: PayloadAction<{ field: string; value: string }>) {
      const { field, value } = action.payload;
      (state.vendorCustomerEdit.form as Record<string, string>)[field] = value;
      state.vendorCustomerEdit.errors[field] = "";
    },
    setVendorCustomerEditErrors(state, action: PayloadAction<Record<string, string>>) {
      state.vendorCustomerEdit.errors = action.payload;
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
  setClientList,
  setListStepFilterId,
  setListDateFilterKind,
  setListCustomDateFilter,
  clearVendorCreationDetail,
  openVendorCustomerEditModal,
  closeVendorCustomerEditModal,
  setVendorCustomerEditField,
  setVendorCustomerEditErrors,
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
