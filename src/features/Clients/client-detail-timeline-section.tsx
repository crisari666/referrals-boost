import { motion } from 'framer-motion';
import * as clientsService from '@/services/clientsService';
import type { Client } from '@/data/mockData';
import { formatCreationDetailUser, formatDetailDate, situationLabel } from './client-detail-formatters';

export type ClientDetailTimelineSectionProps = {
  isMock: boolean;
  client: Client;
  apiLogs: clientsService.CreationDetailLogSituation[];
};

export function ClientDetailTimelineSection({
  isMock,
  client,
  apiLogs,
}: ClientDetailTimelineSectionProps) {
  const hasMockTimeline = isMock && client.interactions.length > 0;
  const hasApiTimeline = !isMock && apiLogs.length > 0;

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
      {!hasMockTimeline && !hasApiTimeline && (
        <p className="text-sm text-muted-foreground">Sin registros en el historial.</p>
      )}
    </motion.div>
  );
}
