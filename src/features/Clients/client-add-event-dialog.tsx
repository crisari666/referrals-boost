import { useMemo, useState, type FormEvent } from 'react';
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
import { useAppDispatch } from '@/store';
import { addCustomerEventRequest } from '@/store/clientsSlice';
import type { CustomerEventType } from '@/services/clientsService.types';

type ClientAddEventDialogProps = {
  customerId: string;
};

const eventTypeOptions: Array<{ value: CustomerEventType; label: string }> = [
  { value: 'WHATSAPP_CALL', label: 'Llamada por WhatsApp' },
  { value: 'WHATSAPP_MESSAGE', label: 'Mensaje por WhatsApp' },
  { value: 'PHONE_CALL', label: 'Llamada telefonica' },
  { value: 'VIDEO_CALL', label: 'Videollamada' },
];

export function ClientAddEventDialog({ customerId }: ClientAddEventDialogProps) {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [eventType, setEventType] = useState<CustomerEventType>('WHATSAPP_MESSAGE');
  const [description, setDescription] = useState('');
  const [score, setScore] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submitDisabled = useMemo(
    () => submitting || description.trim() === '' || score.trim() === '',
    [description, score, submitting]
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedDescription = description.trim();
    if (!trimmedDescription) {
      toast.error('Ingresa una descripción.');
      return;
    }
    if (score.trim() === '') {
      toast.error('Puntaje requerido.');
      return;
    }
    const parsedScore = Number(score);
    if (!Number.isFinite(parsedScore) || parsedScore < 0 || parsedScore > 100) {
      toast.error('Puntaje debe estar entre 0 y 100.');
      return;
    }
    setSubmitting(true);
    try {
      await dispatch(
        addCustomerEventRequest({
          customerId,
          payload: {
            eventType,
            description: trimmedDescription,
            score: parsedScore,
          },
        })
      ).unwrap();
      setDescription('');
      setScore('');
      setEventType('WHATSAPP_MESSAGE');
      setOpen(false);
      toast.success('Evento creado.');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'No se pudo crear el evento.';
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
        Agregar evento
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar evento</DialogTitle>
          <DialogDescription>
            Guarda evento con tipo, puntaje de interes y descripcion.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            value={eventType}
            onChange={(event) => setEventType(event.target.value as CustomerEventType)}
            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
            required
            disabled={submitting}
          >
            {eventTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <input
            type="number"
            min={0}
            max={100}
            step={1}
            value={score}
            onChange={(event) => setScore(event.target.value)}
            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
            placeholder="Puntaje (0-100)"
            disabled={submitting}
            required
          />
          <Textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Descripcion"
            rows={3}
            maxLength={5000}
            disabled={submitting}
            required
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button type="submit" className="gradient-commission text-primary-foreground" disabled={submitDisabled}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar evento'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
