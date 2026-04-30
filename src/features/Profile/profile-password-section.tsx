import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { changeOwnPassword } from '@/services/profileService';

type ProfilePasswordSectionProps = {
  embedded?: boolean;
};

export function ProfilePasswordSection({ embedded }: ProfilePasswordSectionProps = {}) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (next.length < 8) {
      toast({
        title: t('profile.securityPasswordTitle'),
        description: t('profile.securityPasswordMinError'),
        variant: 'destructive',
      });
      return;
    }
    if (next !== confirm) {
      toast({
        title: t('profile.securityPasswordTitle'),
        description: t('profile.securityPasswordMismatch'),
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
        title: t('profile.securityPasswordUpdatedTitle'),
        description: t('profile.securityPasswordUpdatedDesc'),
      });
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : t('profile.apiPasswordUpdateFailed');
      toast({ title: t('common.errorTitle'), description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };
  return (
    <section
      className={cn(
        'space-y-4',
        embedded ? '' : 'rounded-xl border border-border bg-card p-6',
      )}
    >
      <div>
        <h2 className="text-lg font-semibold text-foreground">{t('profile.securityTitle')}</h2>
        <p className="text-sm text-muted-foreground">{t('profile.securitySubtitle')}</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4 max-w-md">
        <div className="space-y-2">
          <Label htmlFor="profile-current-pass">{t('profile.securityCurrentPassword')}</Label>
          <div className="relative">
            <Input
              id="profile-current-pass"
              className="pr-10"
              type={showCurrent ? 'text' : 'password'}
              autoComplete="current-password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowCurrent((v) => !v)}
              aria-label={showCurrent ? t('profile.hidePassword') : t('profile.showPassword')}
              aria-pressed={showCurrent}
            >
              {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="profile-new-pass">{t('profile.securityNewPassword')}</Label>
          <div className="relative">
            <Input
              id="profile-new-pass"
              className="pr-10"
              type={showNext ? 'text' : 'password'}
              autoComplete="new-password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              required
              minLength={8}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowNext((v) => !v)}
              aria-label={showNext ? t('profile.hidePassword') : t('profile.showPassword')}
              aria-pressed={showNext}
            >
              {showNext ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="profile-confirm-pass">{t('profile.securityConfirmPassword')}</Label>
          <div className="relative">
            <Input
              id="profile-confirm-pass"
              className="pr-10"
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={8}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowConfirm((v) => !v)}
              aria-label={showConfirm ? t('profile.hidePassword') : t('profile.showPassword')}
              aria-pressed={showConfirm}
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <Button type="submit" disabled={loading} className="gradient-commission text-primary-foreground">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              {t('common.saving')}
            </>
          ) : (
            t('profile.securityUpdatePassword')
          )}
        </Button>
      </form>
    </section>
  );
}
