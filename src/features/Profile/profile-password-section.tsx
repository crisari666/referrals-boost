import { useState, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { changeOwnPassword } from '@/services/profileService';

export function ProfilePasswordSection() {
  const { toast } = useToast();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (next.length < 8) {
      toast({
        title: 'Contraseña',
        description: 'La nueva contraseña debe tener al menos 8 caracteres.',
        variant: 'destructive',
      });
      return;
    }
    if (next !== confirm) {
      toast({
        title: 'Contraseña',
        description: 'Las contraseñas no coinciden.',
        variant: 'destructive',
      });
      return;
    }
    setLoading(true);
    try {
      await changeOwnPassword({ currentPassword: current, newPassword: next });
      setCurrent('');
      setNext('');
      setConfirm('');
      toast({
        title: 'Contraseña actualizada',
        description: 'Recibirás un correo de confirmación por seguridad.',
      });
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'No se pudo actualizar la contraseña.';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-xl border border-border bg-card p-6 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Seguridad</h2>
        <p className="text-sm text-muted-foreground">Cambiar contraseña de acceso</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4 max-w-md">
        <div className="space-y-2">
          <Label htmlFor="profile-current-pass">Contraseña actual</Label>
          <Input
            id="profile-current-pass"
            type="password"
            autoComplete="current-password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="profile-new-pass">Nueva contraseña</Label>
          <Input
            id="profile-new-pass"
            type="password"
            autoComplete="new-password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            required
            minLength={8}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="profile-confirm-pass">Confirmar nueva contraseña</Label>
          <Input
            id="profile-confirm-pass"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={8}
          />
        </div>
        <Button type="submit" disabled={loading} className="gradient-commission text-primary-foreground">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Guardando…
            </>
          ) : (
            'Actualizar contraseña'
          )}
        </Button>
      </form>
    </section>
  );
}
