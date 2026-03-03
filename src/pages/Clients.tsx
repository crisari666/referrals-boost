import { clients as initialClients, projects, type Client, type DocumentType } from "@/data/mockData";
import ClientRow from "@/components/ClientRow";
import { Plus, Search, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { z } from "zod";

const documentTypes: DocumentType[] = ["INE", "Pasaporte", "CURP", "RFC", "Otro"];

const clientSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(100),
  email: z.string().trim().email("Correo inválido").max(255),
  whatsapp: z.string().trim().min(1, "El WhatsApp es obligatorio").max(20),
  phone: z.string().trim().max(20).optional(),
  documentType: z.string().optional(),
  document: z.string().trim().max(30).optional(),
  projectInterest: z.string().min(1, "Selecciona un proyecto"),
});

const emptyForm = {
  name: "",
  email: "",
  whatsapp: "",
  phone: "",
  documentType: "",
  document: "",
  projectInterest: "",
};

const Clients = () => {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [clientList, setClientList] = useState<Client[]>(initialClients);

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

    setClientList((prev) => [newClient, ...prev]);
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
          onChange={(e) => setSearch(e.target.value)}
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

      {/* Add Client Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center justify-center p-0 md:p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card w-full md:max-w-md md:rounded-2xl rounded-t-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">Nuevo Cliente</h2>
                <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-secondary/50">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Name */}
              <Field label="Nombre *" error={errors.name}>
                <input value={form.name} onChange={(e) => updateField("name", e.target.value)} placeholder="Nombre completo" className="form-input" />
              </Field>

              {/* Email */}
              <Field label="Correo electrónico *" error={errors.email}>
                <input type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} placeholder="correo@ejemplo.com" className="form-input" />
              </Field>

              {/* WhatsApp */}
              <Field label="WhatsApp *" error={errors.whatsapp}>
                <input type="tel" value={form.whatsapp} onChange={(e) => updateField("whatsapp", e.target.value)} placeholder="+52 999 123 4567" className="form-input" />
              </Field>

              {/* Phone */}
              <Field label="Teléfono" error={errors.phone}>
                <input type="tel" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="+52 999 123 4567" className="form-input" />
              </Field>

              {/* Document type + Document */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Tipo de documento" error={errors.documentType}>
                  <select value={form.documentType} onChange={(e) => updateField("documentType", e.target.value)} className="form-input">
                    <option value="">Seleccionar</option>
                    {documentTypes.map((dt) => (
                      <option key={dt} value={dt}>{dt}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Documento" error={errors.document}>
                  <input value={form.document} onChange={(e) => updateField("document", e.target.value)} placeholder="Número" className="form-input" />
                </Field>
              </div>

              {/* Project */}
              <Field label="Proyecto de interés *" error={errors.projectInterest}>
                <select value={form.projectInterest} onChange={(e) => updateField("projectInterest", e.target.value)} className="form-input">
                  <option value="">Seleccionar proyecto</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </Field>

              <button
                onClick={handleSubmit}
                className="w-full gradient-commission text-primary-foreground font-bold py-3 rounded-xl shadow-md text-sm"
              >
                Agregar Cliente
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
  <div className="space-y-1">
    <label className="text-xs font-medium text-muted-foreground">{label}</label>
    {children}
    {error && <p className="text-[11px] text-destructive">{error}</p>}
  </div>
);

export default Clients;
