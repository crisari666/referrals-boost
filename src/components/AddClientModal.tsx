import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Field from "@/components/Field";
import type { DocumentType } from "@/data/mockData";
import type { Project } from "@/data/mockData";

const DOCUMENT_TYPES: DocumentType[] = ["INE", "Pasaporte", "CURP", "RFC", "Otro"];

export interface AddClientFormState {
  name: string;
  email: string;
  whatsapp: string;
  phone: string;
  documentType: string;
  document: string;
  projectInterest: string;
}

interface AddClientModalProps {
  open: boolean;
  onClose: () => void;
  form: AddClientFormState;
  errors: Record<string, string>;
  updateField: (field: string, value: string) => void;
  onSubmit: () => void;
  projectList: Project[];
}

const AddClientModal = ({
  open,
  onClose,
  form,
  errors,
  updateField,
  onSubmit,
  projectList,
}: AddClientModalProps) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center justify-center p-0 md:p-4"
        onClick={onClose}
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
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-secondary/50">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <Field label="Nombre *" error={errors.name}>
            <input value={form.name} onChange={(e) => updateField("name", e.target.value)} placeholder="Nombre completo" className="form-input" />
          </Field>

          <Field label="Correo electrónico *" error={errors.email}>
            <input type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} placeholder="correo@ejemplo.com" className="form-input" />
          </Field>

          <Field label="WhatsApp *" error={errors.whatsapp}>
            <input type="tel" value={form.whatsapp} onChange={(e) => updateField("whatsapp", e.target.value)} placeholder="+52 999 123 4567" className="form-input" />
          </Field>

          <Field label="Teléfono" error={errors.phone}>
            <input type="tel" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="+52 999 123 4567" className="form-input" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Tipo de documento" error={errors.documentType}>
              <select value={form.documentType} onChange={(e) => updateField("documentType", e.target.value)} className="form-input">
                <option value="">Seleccionar</option>
                {DOCUMENT_TYPES.map((dt) => (
                  <option key={dt} value={dt}>{dt}</option>
                ))}
              </select>
            </Field>
            <Field label="Documento" error={errors.document}>
              <input value={form.document} onChange={(e) => updateField("document", e.target.value)} placeholder="Número" className="form-input" />
            </Field>
          </div>

          <Field label="Proyecto de interés *" error={errors.projectInterest}>
            <select value={form.projectInterest} onChange={(e) => updateField("projectInterest", e.target.value)} className="form-input">
              <option value="">Seleccionar proyecto</option>
              {projectList.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </Field>

          <button
            onClick={onSubmit}
            className="w-full gradient-commission text-primary-foreground font-bold py-3 rounded-xl shadow-md text-sm"
          >
            Agregar Cliente
          </button>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default AddClientModal;
