import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  validateFirstAccessToken,
  setFirstAccessPassword,
} from '@/services/agentFirstAccessService';
import { useAppDispatch } from '@/store';
import { loginUser } from '@/store/authSlice';
import { LanguageSwitcher } from '@/components/language-switcher';

const DEFAULT_LAT = 4.6;
const DEFAULT_LNG = -74.0;

type Phase = 'loading' | 'invalid' | 'ready' | 'submitting';

const FirstAccessPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('loading');
  const [invalidReason, setInvalidReason] = useState<
    'expired' | 'used' | 'not_found' | 'missing' | undefined
  >(undefined);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (token === '') {
      setInvalidReason('missing');
      setPhase('invalid');
      return;
    }
    let cancelled = false;
    void validateFirstAccessToken(token)
      .then((res) => {
        if (cancelled) return;
        if (res.valid && res.email) {
          setMaskedEmail(res.email);
          setPhase('ready');
        } else {
          setInvalidReason(res.reason ?? 'not_found');
          setPhase('invalid');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setInvalidReason('not_found');
          setPhase('invalid');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setFormError(null);
      if (password.length < 8) {
        setFormError(t('firstAccess.passwordMinError'));
        return;
      }
      if (password !== confirm) {
        setFormError(t('firstAccess.passwordMismatch'));
        return;
      }
      setPhase('submitting');
      try {
        const result = await setFirstAccessPassword({ token, newPassword: password });
        await dispatch(
          loginUser({
            user: result.email,
            email: result.email,
            password,
            lat: DEFAULT_LAT,
            lng: DEFAULT_LNG,
          }),
        ).unwrap();
        navigate('/', { replace: true });
      } catch (err: unknown) {
        setPhase('ready');
        const msg =
          err && typeof err === 'object' && 'message' in err
            ? String((err as { message: string }).message)
            : t('firstAccess.savePasswordFailed');
        setFormError(msg);
      }
    },
    [confirm, dispatch, navigate, password, t, token],
  );

  if (phase === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 relative">
        <div className="absolute top-4 right-4">
          <LanguageSwitcher />
        </div>
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (phase === 'invalid') {
    const copy =
      invalidReason === 'expired'
        ? t('firstAccess.invalidExpired')
        : invalidReason === 'used'
          ? t('firstAccess.invalidUsed')
          : t('firstAccess.invalidDefault');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 relative">
        <div className="absolute top-4 right-4">
          <LanguageSwitcher />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-sm text-center space-y-4"
        >
          <img
            src="/branding/la-ceiba-logo.png"
            alt="La Ceiba"
            className="mx-auto h-24 w-auto object-contain"
          />
          <h1 className="text-xl font-bold text-foreground">{t('firstAccess.unavailableTitle')}</h1>
          <p className="text-sm text-muted-foreground">{copy}</p>
          <Button variant="outline" className="mt-2" onClick={() => navigate('/login')}>
            {t('firstAccess.goLogin')}
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-10 relative">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-xl border-2 border-primary/30 bg-card p-8 shadow-lg space-y-6"
      >
        <div className="text-center space-y-3">
          <img
            src="/branding/la-ceiba-logo.png"
            alt="Holding Inmobiliario La Ceiba"
            className="mx-auto h-24 w-auto object-contain"
          />
          <h1 className="text-xl font-bold text-foreground">{t('firstAccess.definePasswordTitle')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('firstAccess.accountLabel')} <span className="font-medium text-foreground">{maskedEmail}</span>
          </p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-pass">{t('firstAccess.newPassword')}</Label>
            <Input
              id="new-pass"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-pass">{t('firstAccess.confirmPassword')}</Label>
            <Input
              id="confirm-pass"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={8}
            />
          </div>
          {formError ? (
            <p className="text-sm text-destructive" role="alert">
              {formError}
            </p>
          ) : null}
          <Button
            type="submit"
            className="w-full gradient-commission text-primary-foreground"
            disabled={phase === 'submitting'}
          >
            {phase === 'submitting' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                {t('firstAccess.saving')}
              </>
            ) : (
              t('firstAccess.saveAndEnter')
            )}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default FirstAccessPage;
