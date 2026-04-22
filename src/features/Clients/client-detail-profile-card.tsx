import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ChevronDown, Check, Pencil } from 'lucide-react';
import { ClientContactActions } from './client-contact-actions';
import {
  statusLabels,
  statusColors,
  type ClientStatus,
  type Client,
  projects as mockProjectsCatalog,
} from '@/data/mockData';
import { formatDetailDate } from './client-detail-formatters';
import { ClientDetailStepSelect } from './client-detail-step-select';
import { useAppDispatch, useAppSelector } from '@/store';
import { openVendorCustomerEditModal } from '@/store/clientsSlice';

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
  isMock: boolean;
  isPhysical: boolean;
};

export function ClientDetailProfileCard({
  client,
  initials,
  isMock,
  isPhysical,
}: ClientDetailProfileCardProps) {
  const dispatch = useAppDispatch();
  const { id: routeId } = useParams();
  const projectsList = useAppSelector((s) => s.projects.list);
  const projectTitle = useMemo(() => {
    const pid = client.projectInterest?.trim();
    if (!pid) return undefined;
    const fromStore = projectsList.find((p) => p.id === pid)?.title;
    if (fromStore) return fromStore;
    return mockProjectsCatalog.find((p) => p.id === pid)?.title ?? pid;
  }, [client.projectInterest, projectsList]);
  const catalogStepCount = useAppSelector((s) => s.clients.vendorStepCatalog.length);
  const apiCustomer = useAppSelector((s) => {
    if (isMock || !routeId || s.clients.vendorCreationDetailCustomerId !== routeId) {
      return undefined;
    }
    return s.clients.vendorCreationDetail?.customer ?? undefined;
  });
  const [statusOpen, setStatusOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<ClientStatus>(client.status);

  useEffect(() => {
    setCurrentStatus(client.status);
  }, [client.id, client.status]);

  const useCatalogPicker = catalogStepCount > 0 && !isMock;
  const currentCustomerStepId = apiCustomer?.customerStepId ?? null;
  const showEditCustomer = !isMock && Boolean(apiCustomer);

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
        {showEditCustomer ? (
          <button
            type="button"
            aria-label="Editar cliente"
            onClick={() => dispatch(openVendorCustomerEditModal())}
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
            disabled={!isPhysical}
          />
        ) : isPhysical ? (
          <>
            <button
              type="button"
              onClick={() => setStatusOpen(!statusOpen)}
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
                      onClick={() => {
                        setCurrentStatus(s);
                        setStatusOpen(false);
                        toast.success(`Estado actualizado a "${statusLabels[s]}"`);
                      }}
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
