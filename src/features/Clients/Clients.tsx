import { useAppSelector, useAppDispatch } from "@/store";
import { addClient, setSearch, setClientList } from "@/store/clientsSlice";
import { clients as mockClients, type Client, type ClientStatus, type DocumentType } from "@/data/mockData";
import * as clientsService from "@/services/clientsService";
import ClientRow from "./ClientRow";
import AddClientModal, { type AddClientFormState } from "./AddClientModal";
import { Plus, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { z } from "zod";

function mapApiCustomerToClient(c: clientsService.CustomerByCreator): Client {
  const statusMap: Record<number, ClientStatus> = {
    0: "nuevo",
    1: "interesado",
    2: "agendo_cita",
    3: "pago_reserva",
    4: "cerrado",
  };
  const name = [c.name, c.lastName].filter(Boolean).join(" ").trim() || c.name;
  return {
    id: c._id,
    name,
    email: c.email || undefined,
    phone: c.phone || undefined,
    whatsapp: c.whatsapp ?? "",
    projectInterest: "",
    status: statusMap[c.status] ?? "nuevo",
    createdAt: c.createdAt?.split("T")[0] ?? "",
    notes: [],
    interactions: [],
  };
}

const clientSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(100),
  email: z.string().trim().email("Correo inválido").max(255),
  whatsapp: z.string().trim().max(20).optional(),
  phone: z.string().trim().max(20).optional(),
  documentType: z.string().optional(),
  document: z.string().trim().max(30).optional(),
  projectInterest: z.string().optional().or(z.literal("")),
  description: z.string().trim().min(1, "La descripción es obligatoria"),
}).refine(
  (data) => !!(data.phone && data.phone.trim()) || !!(data.whatsapp && data.whatsapp.trim()),
  {
    message: "Ingresa teléfono o WhatsApp",
    path: ["phone"],
  }
);

const emptyForm: AddClientFormState = {
  name: "",
  email: "",
  whatsapp: "",
  phone: "",
  documentType: "",
  document: "",
  projectInterest: "",
  description: "",
};

const Clients = () => {
  const dispatch = useAppDispatch();
  const clientList = useAppSelector((state) => state.clients.list);
  const search = useAppSelector((state) => state.clients.search);
  const projectList = useAppSelector((state) => state.projects.list);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingList, setLoadingList] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoadingList(true);
    clientsService
      .getCustomersByCreator()
      .then((res) => {
        if (cancelled || res.error) return;
        const apiList = (res.result ?? []).map(mapApiCustomerToClient);
        const combined = [...mockClients, ...apiList];
        dispatch(setClientList(combined));
      })
      .catch(() => {
        // keep mocked data on error
      })
      .finally(() => {
        if (!cancelled) setLoadingList(false);
      });
    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  const filtered = clientList.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const updateField = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
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
      setIsSubmitting(true);

      const payload: clientsService.CreateCustomerPayload = {
        name: result.data.name,
        lastName: "",
        phone: result.data.phone ?? "",
        whatsapp: result.data.whatsapp ?? "",
        email: result.data.email,
        document: result.data.document ?? "",
      };

      const created = await clientsService.createCustomer(payload);

      if (created.error) {
        throw new Error(created.error);
      }

      await clientsService.createCustomerLogSituation({
        customer: created.result._id,
        note: result.data.description,
      });

      const newClient: Client = {
        id: created.result._id,
        name: created.result.name,
        email: created.result.email,
        whatsapp: created.result.whatsapp,
        phone: created.result.phone || undefined,
        documentType: (result.data.documentType as DocumentType) || undefined,
        document: created.result.document || undefined,
        projectInterest: result.data.projectInterest,
        status: "nuevo",
        createdAt: new Date().toISOString().split("T")[0],
        notes: [],
        interactions: [
          {
            date: new Date().toISOString().split("T")[0],
            type: "Alta",
            detail: "Cliente registrado en la plataforma",
          },
        ],
      };

      dispatch(addClient(newClient));
      setShowModal(false);
      setForm(emptyForm);
      setErrors({});
      toast.success(`Cliente "${newClient.name}" agregado exitosamente`);
    } catch (err) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "No se pudo crear el cliente. Intenta de nuevo.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Mis Clientes</h1>
          <p className="text-sm text-muted-foreground">{clientList.length} clientes en total</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="w-10 h-10 gradient-commission rounded-xl flex items-center justify-center shadow-md"
        >
          <Plus className="w-5 h-5 text-primary-foreground" />
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar cliente..."
          value={search}
          onChange={(e) => dispatch(setSearch(e.target.value))}
          className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div className="space-y-2">
        {loadingList ? (
          <p className="text-center text-muted-foreground py-12 text-sm">Cargando clientes...</p>
        ) : (
          <>
            {filtered.map((client, i) => (
              <ClientRow key={client.id} client={client} index={i} />
            ))}
            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-12 text-sm">No se encontraron clientes</p>
            )}
          </>
        )}
      </div>

      <AddClientModal
        open={showModal}
        onClose={() => setShowModal(false)}
        form={form}
        errors={errors}
        updateField={updateField}
        onSubmit={() => {
          void handleSubmit();
        }}
        projectList={projectList}
      />
    </div>
  );
};

export default Clients;
