import { motion, AnimatePresence } from 'framer-motion';
import { Phone, MessageCircle, ChevronDown, Check, CalendarPlus, PhoneCall } from 'lucide-react';
import { toast } from 'sonner';
import ScheduleDialog from '@/components/schedule/ScheduleDialog';
import * as clientsService from '@/services/clientsService';
import {
  statusLabels,
  statusColors,
  type ClientStatus,
  type Client,
} from '@/data/mockData';
import { formatDetailDate } from './client-detail-formatters';

const statusOrder: ClientStatus[] = [
  'nuevo',
  'interesado',
  'agendo_cita',
  'pago_reserva',
  'cerrado',
];

export type ClientDetailProfileCardProps = {
  client: Client;
  initials: string;
  projectTitle: string | undefined;
  apiCustomer: clientsService.CreationDetailCustomer | null | undefined;
  isPhysical: boolean;
  currentStatus: ClientStatus;
  statusOpen: boolean;
  onStatusOpenChange: (open: boolean) => void;
  onStatusChange: (status: ClientStatus) => void;
};

export function ClientDetailProfileCard({
  client,
  initials,
  projectTitle,
  apiCustomer,
  isPhysical,
  currentStatus,
  statusOpen,
  onStatusOpenChange,
  onStatusChange,
}: ClientDetailProfileCardProps) {
  const waDigits = client.whatsapp.replace(/\D/g, '');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-5 border border-border shadow-sm"
    >
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full gradient-commission flex items-center justify-center text-primary-foreground font-bold text-lg">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-foreground text-lg">{client.name}</h2>
          <p className="text-sm text-muted-foreground">{projectTitle ?? 'Sin proyecto'}</p>
          {apiCustomer?.email && (
            <p className="text-xs text-muted-foreground mt-1 truncate">{apiCustomer.email}</p>
          )}
          {apiCustomer?.address?.trim() && (
            <p className="text-xs text-muted-foreground mt-1">{apiCustomer.address}</p>
          )}
          {(apiCustomer?.document?.trim() || apiCustomer?.documentType?.trim()) && (
            <p className="text-xs text-muted-foreground mt-1">
              {[apiCustomer.documentType, apiCustomer.document].filter(Boolean).join(' · ')}
            </p>
          )}
          {apiCustomer?.createdAt && (
            <p className="text-xs text-muted-foreground mt-1">
              Alta: {formatDetailDate(apiCustomer.createdAt)}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 relative">
        {isPhysical ? (
          <>
            <button
              type="button"
              onClick={() => onStatusOpenChange(!statusOpen)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border bg-secondary/30 transition-colors hover:bg-secondary/50"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium">Estado:</span>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${statusColors[currentStatus]}`}
                >
                  {statusLabels[currentStatus]}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground transition-transform ${statusOpen ? 'rotate-180' : ''}`}
              />
            </button>

            <AnimatePresence>
              {statusOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute z-10 top-full mt-1 w-full bg-card border border-border rounded-xl shadow-lg overflow-hidden"
                >
                  {statusOrder.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => onStatusChange(s)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-secondary/40 transition-colors"
                    >
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${statusColors[s]}`}
                      >
                        {statusLabels[s]}
                      </span>
                      {currentStatus === s && <Check className="w-4 h-4 text-accent" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <div className="w-full flex items-center gap-2 px-4 py-3 rounded-xl border border-border bg-secondary/20">
            <span className="text-xs text-muted-foreground font-medium">Estado:</span>
            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${statusColors[currentStatus]}`}
            >
              {statusLabels[currentStatus]}
            </span>
          </div>
        )}
      </div>

      {isPhysical && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5">
          {waDigits ? (
            <a
              href={`https://wa.me/${waDigits}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1 bg-accent/10 rounded-xl py-3"
            >
              <MessageCircle className="w-5 h-5 text-accent" />
              <span className="text-[10px] font-medium text-accent">WhatsApp</span>
            </a>
          ) : (
            <div className="flex flex-col items-center gap-1 bg-muted/40 rounded-xl py-3 opacity-60">
              <MessageCircle className="w-5 h-5 text-muted-foreground" />
              <span className="text-[10px] font-medium text-muted-foreground">WhatsApp</span>
            </div>
          )}
          {client.phone?.replace(/\D/g, '') ? (
            <a
              href={`tel:${client.phone.replace(/\D/g, '')}`}
              className="flex flex-col items-center gap-1 bg-info/10 rounded-xl py-3"
            >
              <Phone className="w-5 h-5 text-info" />
              <span className="text-[10px] font-medium text-info">Llamar</span>
            </a>
          ) : (
            <div className="flex flex-col items-center gap-1 bg-muted/40 rounded-xl py-3 opacity-60">
              <Phone className="w-5 h-5 text-muted-foreground" />
              <span className="text-[10px] font-medium text-muted-foreground">Llamar</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => toast.info('Iniciando llamada VoIP...')}
            className="flex flex-col items-center gap-1 bg-success/10 rounded-xl py-3"
          >
            <PhoneCall className="w-5 h-5 text-success" />
            <span className="text-[10px] font-medium text-success">VoIP</span>
          </button>
          <ScheduleDialog
            clientId={client.id}
            trigger={
              <button
                type="button"
                className="flex flex-col items-center gap-1 bg-primary/10 rounded-xl py-3 w-full"
              >
                <CalendarPlus className="w-5 h-5 text-primary" />
                <span className="text-[10px] font-medium text-primary">Agendar</span>
              </button>
            }
          />
        </div>
      )}
    </motion.div>
  );
}
