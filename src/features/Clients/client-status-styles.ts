import type { ClientStatus } from '@/features/Clients/types/client.type';

export const CLIENT_STATUS_I18N_KEY: Record<ClientStatus, string> = {
  nuevo: 'clients.statusNuevo',
  interesado: 'clients.statusInteresado',
  agendo_cita: 'clients.statusAgendoCita',
  pago_reserva: 'clients.statusPagoReserva',
  cerrado: 'clients.statusCerrado',
};

export const statusColors: Record<ClientStatus, string> = {
  nuevo: 'bg-info text-info-foreground',
  interesado: 'bg-warning text-warning-foreground',
  agendo_cita: 'bg-primary text-primary-foreground',
  pago_reserva: 'bg-accent text-accent-foreground',
  cerrado: 'bg-success text-success-foreground',
};

export const statusOrder: ClientStatus[] = [
  'nuevo',
  'interesado',
  'agendo_cita',
  'pago_reserva',
  'cerrado',
];
