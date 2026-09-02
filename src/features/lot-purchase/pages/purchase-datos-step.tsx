import { useEffect, useMemo } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
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
  buildBuyerDataSchema,
  type BuyerDataFormValues,
} from '@/features/lot-purchase/schemas/buyer-form.schema';
import { setDraftBuyerData } from '@/features/lot-purchase/store/purchase-draft-slice';
import { buyerUpdateProfile } from '@/features/lot-purchase/store/buyer-auth-slice';
import { useAppDispatch, useAppSelector } from '@/store';

export function PurchaseDatosStep() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { projectId, lotId } = useParams<{ projectId: string; lotId: string }>();
  const isAuthenticated = useAppSelector(
    (state) => state.buyerAuth.isAuthenticated,
  );
  const buyer = useAppSelector((state) => state.buyerAuth.session?.buyer);
  const draft = useAppSelector((state) => state.purchaseDraft.draft);
  const schema = useMemo(() => buildBuyerDataSchema(t), [t]);
  const form = useForm<BuyerDataFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: draft?.buyerData?.fullName || buyer?.fullName || '',
      documentId: draft?.buyerData?.documentId || buyer?.documentId || '',
      city: draft?.buyerData?.city || buyer?.city || '',
      email: draft?.buyerData?.email || buyer?.email || '',
      phone: draft?.buyerData?.phone || buyer?.phone || '',
    },
  });

  useEffect(() => {
    if (!buyer && !draft?.buyerData) return;
    form.reset({
      fullName: draft?.buyerData?.fullName || buyer?.fullName || '',
      documentId: draft?.buyerData?.documentId || buyer?.documentId || '',
      city: draft?.buyerData?.city || buyer?.city || '',
      email: draft?.buyerData?.email || buyer?.email || '',
      phone: draft?.buyerData?.phone || buyer?.phone || '',
    });
  }, [buyer, draft?.buyerData, form]);

  if (!isAuthenticated) {
    return (
      <Navigate
        to={`/comprar/${projectId}/${lotId}/cuenta`}
        replace
      />
    );
  }

  const handleSubmit = form.handleSubmit((values) => {
    dispatch(setDraftBuyerData(values));
    dispatch(
      buyerUpdateProfile({
        fullName: values.fullName,
        documentId: values.documentId,
        city: values.city,
        email: values.email,
        phone: values.phone,
      }),
    );
    navigate(`/comprar/${projectId}/${lotId}/legal`);
  });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-extrabold text-foreground">
          {t('lotPurchase.datosTitle')}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('lotPurchase.datosSubtitle')}
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('lotPurchase.formFullName')}</FormLabel>
                <FormControl>
                  <Input {...field} autoComplete="name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="documentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('lotPurchase.formDocument')}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('lotPurchase.formCity')}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('lotPurchase.formEmail')}</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" autoComplete="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('lotPurchase.formPhone')}</FormLabel>
                  <FormControl>
                    <Input {...field} autoComplete="tel" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" className="cursor-pointer">
              {t('lotPurchase.continue')}
            </Button>
            <Button asChild variant="outline" className="cursor-pointer">
              <Link to={`/comprar/${projectId}/${lotId}/cuenta`}>
                {t('lotPurchase.back')}
              </Link>
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
