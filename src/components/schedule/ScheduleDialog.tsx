import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store";
import { addVisit } from "@/store/scheduleSlice";
import { clients, projects } from "@/data/mockData";
import { CalendarPlus } from "lucide-react";
import { toast } from "sonner";
import type { VisitType } from "@/types/schedule";

interface ScheduleDialogProps {
  clientId?: string;
  trigger?: React.ReactNode;
}

const visitTypes: { value: VisitType; label: string; icon: string }[] = [
  { value: "oficina", label: "Oficina", icon: "🏢" },
  { value: "terreno", label: "Terreno", icon: "🏗️" },
  { value: "virtual", label: "Virtual", icon: "💻" },
];

const ScheduleDialog = ({ clientId, trigger }: ScheduleDialogProps) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const [open, setOpen] = useState(false);

  const [selectedClient, setSelectedClient] = useState(clientId ?? "");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [type, setType] = useState<VisitType>("oficina");
  const [notes, setNotes] = useState("");

  const client = clients.find((c) => c.id === selectedClient);
  const project = client ? projects.find((p) => p.id === client.projectInterest) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !date || !time) {
      toast.error("Completa los campos obligatorios");
      return;
    }

    dispatch(
      addVisit({
        id: `v-${Date.now()}`,
        clientId: selectedClient,
        clientName: client?.name ?? "",
        projectId: project?.id ?? "",
        projectName: project?.title ?? "",
        date,
        time,
        type,
        status: "programada",
        notes: notes || undefined,
        createdBy: user?.id ?? "",
        createdAt: new Date().toISOString().split("T")[0],
      })
    );

    toast.success("Visita agendada correctamente");
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    if (!clientId) setSelectedClient("");
    setDate("");
    setTime("10:00");
    setType("oficina");
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" className="gap-2">
            <CalendarPlus className="w-4 h-4" />
            Agendar Visita
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Agendar Visita</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Client selector (hidden if pre-set) */}
          {!clientId && (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Cliente</label>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="form-input"
                required
              >
                <option value="">Seleccionar cliente...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          {client && (
            <div className="bg-secondary/30 rounded-xl px-4 py-3 text-sm">
              <p className="font-semibold text-foreground">{client.name}</p>
              <p className="text-xs text-muted-foreground">{project?.title}</p>
            </div>
          )}

          {/* Visit type */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Tipo de visita</label>
            <div className="grid grid-cols-3 gap-2">
              {visitTypes.map((vt) => (
                <button
                  key={vt.value}
                  type="button"
                  onClick={() => setType(vt.value)}
                  className={`flex flex-col items-center gap-1 rounded-xl py-3 border transition-all ${
                    type === vt.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-muted-foreground hover:bg-secondary/40"
                  }`}
                >
                  <span className="text-xl">{vt.icon}</span>
                  <span className="text-[11px] font-medium">{vt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Fecha</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="form-input"
                required
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Hora</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="form-input"
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Notas (opcional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Llevar planos del lote..."
              className="form-input min-h-[80px] resize-none"
            />
          </div>

          <Button type="submit" className="w-full">
            Confirmar Visita
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleDialog;
