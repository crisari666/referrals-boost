import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Pencil } from 'lucide-react';
import { ClientContactActions } from './client-contact-actions';
import * as clientsService from '@/services/clientsService';
import {
  statusLabels,
  statusColors,
  type ClientStatus,
  type Client,
} from '@/data/mockData';
import { formatDetailDate } from './client-detail-formatters';
import { ClientDetailStepSelect } from './client-detail-step-select';
import { useAppSelector } from '@/store';

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
  showEditCustomer?: boolean;
  onEditCustomerClick?: () => void;
  currentCustomerStepId?: string | null;
  currentStatus: ClientStatus;
  statusOpen: boolean;
  onStatusOpenChange: (open: boolean) => void;
  onLegacyStatusChange: (status: ClientStatus) => void;
  onCatalogStepChange?: (stepId: string) => void;
};

export function ClientDetailProfileCard({
  client,
  initials,
  projectTitle,
  apiCustomer,
  isPhysical,
  showEditCustomer = false,
  onEditCustomerClick,
  currentCustomerStepId = null,
  currentStatus,
  statusOpen,
  onStatusOpenChange,
  onLegacyStatusChange,
  onCatalogStepChange,
}: ClientDetailProfileCardProps) {
  const catalogStepCount = useAppSelector((s) => s.clients.vendorStepCatalog.length);
  const useCatalogPicker =
    catalogStepCount > 0 && typeof onCatalogStepChange === 'function';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-5 border border-border shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="w-14 h-14 rounded-full gradient-commission flex items-center justify-center text-primary-foreground font-bold text-lg shrink-0">
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
        {showEditCustomer && onEditCustomerClick ? (
          <button
            type="button"
            aria-label="Editar cliente"
            onClick={onEditCustomerClick}
            className="shrink-0 p-2 rounded-xl border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
          >
            <Pencil className="w-4 h-4 text-muted-foreground" />
          </button>
        ) : null}
      </div>

      <div className="mt-4 relative">
        {useCatalogPicker ? (
          <ClientDetailStepSelect
            currentStepId={currentCustomerStepId}
            open={statusOpen}
            onOpenChange={onStatusOpenChange}
            onSelectStep={(stepId) => {
              onCatalogStepChange!(stepId);
              onStatusOpenChange(false);
            }}
            disabled={!isPhysical}
          />
        ) : isPhysical ? (
          <>
            <button
              type="button"
              onClick={() => onStatusOpenChange(!statusOpen)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border bg-secondary/30 transition-colors hover:bg-secondary/50 cursor-pointer"
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
                      onClick={() => onLegacyStatusChange(s)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-secondary/40 transition-colors cursor-pointer"
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
        <ClientContactActions client={client} clientId={client.id} isPhysical={isPhysical} />
      )}
    </motion.div>
  );
}
