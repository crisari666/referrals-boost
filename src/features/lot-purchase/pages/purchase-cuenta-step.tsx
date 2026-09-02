import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  buildBuyerAccountSchema,
  type BuyerAccountFormValues,
} from '@/features/lot-purchase/schemas/buyer-form.schema';
import {
  buyerClearError,
  buyerLogin,
  buyerRegister,
} from '@/features/lot-purchase/store/buyer-auth-slice';
import { useAppDispatch, useAppSelector } from '@/store';

export function PurchaseCuentaStep() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { projectId, lotId } = useParams<{ projectId: string; lotId: string }>();
  const isAuthenticated = useAppSelector(
    (state) => state.buyerAuth.isAuthenticated,
  );
  const buyer = useAppSelector((state) => state.buyerAuth.session?.buyer);
  const error = useAppSelector((state) => state.buyerAuth.error);
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [pendingNavigate, setPendingNavigate] = useState(false);
  const schema = useMemo(() => buildBuyerAccountSchema(t), [t]);
  const form = useForm<BuyerAccountFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: buyer?.email ?? '',
      password: '',
      fullName: buyer?.fullName ?? '',
    },
  });

  const nextPath =
    projectId && lotId ? `/comprar/${projectId}/${lotId}/datos` : '/stock';

  useEffect(() => {
    if (!pendingNavigate) return;
    if (isAuthenticated) {
      setPendingNavigate(false);
      navigate(nextPath);
      return;
    }
    if (error) {
      setPendingNavigate(false);
    }
  }, [error, isAuthenticated, navigate, nextPath, pendingNavigate]);

  const errorMessage =
    error === 'EMAIL_TAKEN'
      ? t('lotPurchase.accountErrorTaken')
      : error === 'INVALID_CREDENTIALS'
        ? t('lotPurchase.accountErrorCredentials')
        : error
          ? t('lotPurchase.accountErrorGeneric')
          : null;

  const handleSubmit = form.handleSubmit((values) => {
    dispatch(buyerClearError());
    if (mode === 'login') {
      dispatch(
        buyerLogin({ email: values.email, password: values.password }),
      );
    } else {
      dispatch(
        buyerRegister({
          email: values.email,
          password: values.password,
          fullName: values.fullName?.trim() || values.email.split('@')[0],
        }),
      );
    }
    setPendingNavigate(true);
  });

  if (isAuthenticated && buyer && !pendingNavigate) {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-extrabold text-foreground">
            {t('lotPurchase.accountTitle')}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('lotPurchase.accountAlreadyIn', {
              name: buyer.fullName || buyer.email,
            })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild className="cursor-pointer">
            <Link to={nextPath}>{t('lotPurchase.accountContinueAs')}</Link>
          </Button>
          <Button asChild variant="outline" className="cursor-pointer">
            <Link to={`/comprar/${projectId}/${lotId}/resumen`}>
              {t('lotPurchase.back')}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-extrabold text-foreground">
          {t('lotPurchase.accountTitle')}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('lotPurchase.accountSubtitle')}
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          variant={mode === 'register' ? 'default' : 'outline'}
          size="sm"
          className="cursor-pointer"
          onClick={() => {
            setMode('register');
            dispatch(buyerClearError());
          }}
        >
          {t('lotPurchase.accountRegisterTab')}
        </Button>
        <Button
          type="button"
          variant={mode === 'login' ? 'default' : 'outline'}
          size="sm"
          className="cursor-pointer"
          onClick={() => {
            setMode('login');
            dispatch(buyerClearError());
          }}
        >
          {t('lotPurchase.accountLoginTab')}
        </Button>
      </div>
      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' ? (
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('lotPurchase.accountFullName')}</FormLabel>
                  <FormControl>
                    <Input {...field} autoComplete="name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : null}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('lotPurchase.accountEmail')}</FormLabel>
                <FormControl>
                  <Input {...field} type="email" autoComplete="email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('lotPurchase.accountPassword')}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    autoComplete={
                      mode === 'login' ? 'current-password' : 'new-password'
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {errorMessage ? (
            <p className="text-sm text-destructive">{errorMessage}</p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button type="submit" className="cursor-pointer">
              {mode === 'login'
                ? t('lotPurchase.accountSubmitLogin')
                : t('lotPurchase.accountSubmitRegister')}
            </Button>
            <Button asChild variant="outline" className="cursor-pointer">
              <Link to={`/comprar/${projectId}/${lotId}/resumen`}>
                {t('lotPurchase.back')}
              </Link>
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
