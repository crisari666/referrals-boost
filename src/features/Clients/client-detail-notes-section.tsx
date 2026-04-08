import { motion } from 'framer-motion';
import { StickyNote } from 'lucide-react';
import * as clientsService from '@/services/clientsService';
import { formatCreationDetailUser, formatDetailDate } from './client-detail-formatters';

export type ClientDetailNotesSectionProps = {
  isMock: boolean;
  mockNotes: string[];
  apiNotes: clientsService.CreationDetailNote[];
};

export function ClientDetailNotesSection({
  isMock,
  mockNotes,
  apiNotes,
}: ClientDetailNotesSectionProps) {
  const hasMock = isMock && mockNotes.length > 0;
  const hasApi = !isMock && apiNotes.length > 0;
  if (!hasMock && !hasApi) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 }}
      className="bg-card rounded-2xl p-5 border border-border shadow-sm"
    >
      <div className="flex items-center gap-2 mb-4">
        <StickyNote className="w-4 h-4 text-warning" />
        <h3 className="font-bold text-foreground">Notas</h3>
      </div>
      {hasMock && (
        <ul className="space-y-2">
          {mockNotes.map((note, i) => (
            <li
              key={i}
              className="text-sm text-muted-foreground bg-secondary/50 rounded-xl px-4 py-2.5"
            >
              {note}
            </li>
          ))}
        </ul>
      )}
      {hasApi && (
        <ul className="space-y-3">
          {apiNotes.map((n) => (
            <li key={n._id} className="bg-secondary/50 rounded-xl px-4 py-3">
              <p className="text-xs text-muted-foreground">
                {formatCreationDetailUser(n.user)} · {formatDetailDate(n.createdAt)}
              </p>
              <p className="text-sm text-foreground mt-1 whitespace-pre-wrap">{n.note}</p>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}
