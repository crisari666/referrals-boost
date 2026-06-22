export type ClientStatus =
  | 'nuevo'
  | 'interesado'
  | 'agendo_cita'
  | 'pago_reserva'
  | 'cerrado';

export type DocumentType = 'Pasaporte' | 'Cédula' | 'Cédula extranjera';

export type Client = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  whatsapp: string;
  documentType?: DocumentType;
  document?: string;
  projectInterest: string;
  status: ClientStatus;
  createdAt: string;
  lastUpdate?: string;
  assignedDate?: string;
  notes: string[];
  interactions: { date: string; type: string; detail: string }[];
  customerStepId?: string | null;
  isInternational?: boolean;
};
