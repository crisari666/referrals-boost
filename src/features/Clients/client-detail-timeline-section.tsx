import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import type { Client } from '@/data/mockData';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchCustomerEventsRequest } from '@/store/clientsSlice';
import { ClientAddEventDialog } from './client-add-event-dialog';
import { formatCreationDetailUser, formatDetailDate, situationLabel } from './client-detail-formatters';

export type ClientDetailTimelineSectionProps = {
  isMock: boolean;
  client: Client;
};

export function ClientDetailTimelineSection({ isMock, client }: ClientDetailTimelineSectionProps) {
  const { id: routeId } = useParams();
  const dispatch = useAppDispatch();
  const apiLogs = useAppSelector((s) => {
    if (!routeId || isMock || s.clients.vendorCreationDetailCustomerId !== routeId) return [];
    return s.clients.vendorCreationDetail?.customerLogSituations ?? [];
  });
  const customerEvents = useAppSelector((s) => {
    if (!routeId || isMock || s.clients.vendorCreationDetailCustomerId !== routeId) return [];
    return s.clients.customerEvents;
  });
  const hasMockTimeline = isMock && client.interactions.length > 0;
  const hasApiTimeline = !isMock && apiLogs.length > 0;
  const hasEventsTimeline = !isMock && customerEvents.length > 0;

  useEffect(() => {
    if (!routeId || isMock) return;
    void dispatch(fetchCustomerEventsRequest(routeId));
  }, [dispatch, isMock, routeId]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-card rounded-2xl p-5 border border-border shadow-sm"
    >
      <h3 className="font-bold text-foreground mb-4">
        {isMock ? 'Historial de Interacciones' : 'Línea de situaciones'}
      </h3>
      {!isMock && routeId && (
        <div className="mb-4">
          <ClientAddEventDialog customerId={routeId} />
        </div>
      )}
      {hasMockTimeline && (
        <div className="space-y-4">
          {client.interactions.map((inter, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-2.5 h-2.5 rounded-full gradient-commission mt-1" />
                {i < client.interactions.length - 1 && (
                  <div className="w-px flex-1 bg-border mt-1" />
                )}
              </div>
              <div className="pb-4">
                <p className="text-xs text-muted-foreground">
                  {inter.date} · {inter.type}
                </p>
                <p className="text-sm text-foreground mt-0.5">{inter.detail}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      {hasApiTimeline && (
        <div className="space-y-4">
          {apiLogs.map((log, i) => (
            <div key={log._id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-2.5 h-2.5 rounded-full gradient-commission mt-1" />
                {i < apiLogs.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
              </div>
              <div className="pb-4 min-w-0">
                <p className="text-xs text-muted-foreground">
                  {formatDetailDate(log.date)} · {situationLabel(log.situation)}
                </p>
                <p className="text-sm text-foreground mt-0.5 whitespace-pre-wrap">{log.note}</p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {formatCreationDetailUser(log.user)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      {hasEventsTimeline && (
        <div className="space-y-4">
          {customerEvents.map((event, i) => (
            <div key={event.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-2.5 h-2.5 rounded-full gradient-commission mt-1" />
                {i < customerEvents.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
              </div>
              <div className="pb-4 min-w-0">
                <p className="text-xs text-muted-foreground">
                  {formatDetailDate(event.createdAt)} · {event.eventType} · Score {event.score ?? '-'}
                </p>
                <p className="text-sm text-foreground mt-0.5 whitespace-pre-wrap">{event.description}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{event.userId}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      {!hasMockTimeline && !hasApiTimeline && !hasEventsTimeline && (
        <p className="text-sm text-muted-foreground">Sin registros en el historial.</p>
      )}
    </motion.div>
  );
}
