import { useState, type FormEvent } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

type ClientAddNoteDialogProps = {
  onSubmit: (note: string) => Promise<void>;
};

export function ClientAddNoteDialog({ onSubmit }: ClientAddNoteDialogProps) {
  const [open, setOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = noteText.trim();
    if (!trimmed) {
      toast.error('Escribe una nota antes de guardar.');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(trimmed);
      setNoteText('');
      setOpen(false);
      toast.success('Nota agregada');
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'No se pudo agregar la nota.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        size="sm"
        className="gap-1.5 gradient-commission text-primary-foreground"
        onClick={() => setOpen(true)}
      >
        <Plus className="w-4 h-4" />
        Agregar nota
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar nota</DialogTitle>
          <DialogDescription>
            Guarda un comentario para este cliente.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Escribe la nota del cliente..."
            rows={5}
            maxLength={1500}
            disabled={submitting}
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="gradient-commission text-primary-foreground"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar nota'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
