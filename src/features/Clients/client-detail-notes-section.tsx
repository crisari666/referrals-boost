import { motion } from 'framer-motion';
import { StickyNote } from 'lucide-react';
import * as clientsService from '@/services/clientsService';
import type { MsCustomerDescriptionEntry } from '@/services/clientsService.types';
import { useAppSelector } from '@/store';
import { ClientAddNoteDialog } from './client-add-note-dialog';
import { formatCreationDetailUser, formatDetailDate } from './client-detail-formatters';

export type ClientDetailApiNote = clientsService.CreationDetailNote | MsCustomerDescriptionEntry;

function isMsDescriptionEntry(n: ClientDetailApiNote): n is MsCustomerDescriptionEntry {
  return (
    typeof n === 'object' &&
    n !== null &&
    'description' in n &&
    typeof (n as MsCustomerDescriptionEntry).description === 'string' &&
    !('note' in n)
  );
}

/** CRM `CreationDetailNote` or raw customers MS description row. */
function toNoteDisplayRow(n: ClientDetailApiNote): {
  key: string;
  user: string | clientsService.CreationDetailPopulatedUser;
  createdAt: string;
  body: string;
} {
  if (isMsDescriptionEntry(n)) {
    return {
      key: String(n._id),
      user: n.user,
      createdAt: n.date,
      body: n.description,
    };
  }
  const r = n as clientsService.CreationDetailNote;
  return {
    key: r._id,
    user: r.user,
    createdAt: r.createdAt,
    body: r.note,
  };
}

export type ClientDetailNotesSectionProps = {
  isMock: boolean;
  mockNotes: string[];
  apiNotes: ClientDetailApiNote[];
  onAddNote?: (note: string) => Promise<void>;
};

export function ClientDetailNotesSection({
  isMock,
  mockNotes,
  apiNotes,
  onAddNote,
}: ClientDetailNotesSectionProps) {
  const isPhysical = useAppSelector((s) => s.auth.user?.physical === true);
  const allowAddNote = !isMock && isPhysical && Boolean(onAddNote);
  const hasMock = isMock && mockNotes.length > 0;
  const hasApi = !isMock && apiNotes.length > 0;
  if (!hasMock && !hasApi && !allowAddNote) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 }}
      className="bg-card rounded-2xl p-5 border border-border shadow-sm"
    >
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <StickyNote className="w-4 h-4 text-warning" />
          <h3 className="font-bold text-foreground">Notas</h3>
        </div>
        {allowAddNote && onAddNote && <ClientAddNoteDialog onSubmit={onAddNote} />}
      </div>
      {!hasMock && !hasApi && allowAddNote && (
        <p className="text-sm text-muted-foreground">
          Aun no hay notas para este cliente.
        </p>
      )}
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
          {apiNotes.map((n) => {
            const row = toNoteDisplayRow(n);
            return (
              <li key={row.key} className="bg-secondary/50 rounded-xl px-4 py-3">
                <p className="text-xs text-muted-foreground">
                  {formatCreationDetailUser(row.user)} · {formatDetailDate(row.createdAt)}
                </p>
                <p className="text-sm text-foreground mt-1 whitespace-pre-wrap">{row.body}</p>
              </li>
            );
          })}
        </ul>
      )}
    </motion.div>
  );
}
