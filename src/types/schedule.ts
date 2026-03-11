export type VisitType = "oficina" | "terreno" | "virtual";
export type VisitStatus = "programada" | "completada" | "cancelada" | "no_asistio";

export interface ScheduledVisit {
  id: string;
  clientId: string;
  clientName: string;
  projectId: string;
  projectName: string;
  date: string; // ISO date
  time: string; // HH:mm
  type: VisitType;
  status: VisitStatus;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export const visitTypeLabels: Record<VisitType, string> = {
  oficina: "Oficina",
  terreno: "Terreno",
  virtual: "Virtual",
};

export const visitStatusLabels: Record<VisitStatus, string> = {
  programada: "Programada",
  completada: "Completada",
  cancelada: "Cancelada",
  no_asistio: "No asistió",
};

export const visitTypeIcons: Record<VisitType, string> = {
  oficina: "🏢",
  terreno: "🏗️",
  virtual: "💻",
};

export const visitStatusColors: Record<VisitStatus, string> = {
  programada: "bg-info text-info-foreground",
  completada: "bg-success text-success-foreground",
  cancelada: "bg-destructive text-destructive-foreground",
  no_asistio: "bg-warning text-warning-foreground",
};
