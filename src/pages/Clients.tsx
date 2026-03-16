import { useAppSelector, useAppDispatch } from "@/store";
import { addClient, setSearch } from "@/store/clientsSlice";
import type { Client, DocumentType } from "@/data/mockData";
import ClientRow from "@/components/ClientRow";
import AddClientModal, { type AddClientFormState } from "@/components/AddClientModal";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

const clientSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(100),
  email: z.string().trim().email("Correo inválido").max(255),
  whatsapp: z.string().trim().min(1, "El WhatsApp es obligatorio").max(20),
  phone: z.string().trim().max(20).optional(),
  documentType: z.string().optional(),
  document: z.string().trim().max(30).optional(),
  projectInterest: z.string().min(1, "Selecciona un proyecto"),
});

const emptyForm: AddClientFormState = {
  name: "",
  email: "",
  whatsapp: "",
  phone: "",
  documentType: "",
  document: "",
  projectInterest: "",
};

const Clients = () => {
  const dispatch = useAppDispatch();
  const clientList = useAppSelector((state) => state.clients.list);
  const search = useAppSelector((state) => state.clients.search);
  const projectList = useAppSelector((state) => state.projects.list);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filtered = clientList.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const updateField = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  };

  const handleSubmit = () => {
    const result = clientSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((e) => {
        fieldErrors[e.path[0] as string] = e.message;
      });
      setErrors(fieldErrors);
      return;
    }

    const newClient: Client = {
      id: `c${Date.now()}`,
      name: result.data.name,
      email: result.data.email,
      whatsapp: result.data.whatsapp,
      phone: result.data.phone || undefined,
      documentType: (result.data.documentType as DocumentType) || undefined,
      document: result.data.document || undefined,
      projectInterest: result.data.projectInterest,
      status: "nuevo",
      createdAt: new Date().toISOString().split("T")[0],
      notes: [],
      interactions: [
        { date: new Date().toISOString().split("T")[0], type: "Alta", detail: "Cliente registrado en la plataforma" },
      ],
    };

    dispatch(addClient(newClient));
    setShowModal(false);
    setForm(emptyForm);
    setErrors({});
    toast.success(`Cliente "${newClient.name}" agregado exitosamente 🎉`);
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

      {/* Search */}
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
        {filtered.map((client, i) => (
          <ClientRow key={client.id} client={client} index={i} />
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-12 text-sm">No se encontraron clientes</p>
        )}
      </div>

      <AddClientModal
        open={showModal}
        onClose={() => setShowModal(false)}
        form={form}
        errors={errors}
        updateField={updateField}
        onSubmit={handleSubmit}
        projectList={projectList}
      />
    </div>
  );
};

export default Clients;
