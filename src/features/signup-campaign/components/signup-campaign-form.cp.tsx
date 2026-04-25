import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  selectSignupCampaign,
  selectSignupSubmitError,
  selectSignupSubmitStatus,
  submitSignupCampaignRegistration,
} from '@/store/signupCampaignSlice';

const signupSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio').max(60),
  lastName: z.string().trim().min(1, 'El apellido es obligatorio').max(60),
  document: z.string().trim().min(3, 'Documento inválido').max(40),
  city: z.string().trim().min(2, 'La ciudad es obligatoria').max(60),
  phone: z.string().trim().min(7, 'Teléfono inválido').max(25),
  email: z
    .string()
    .trim()
    .email('Correo inválido')
    .max(120)
    .transform((value) => value.toLowerCase()),
});

type SignupFormValues = z.infer<typeof signupSchema>;

interface SignupCampaignFormProps {
  code: string;
}

export const SignupCampaignForm = ({ code }: SignupCampaignFormProps) => {
  const dispatch = useAppDispatch();
  const campaign = useAppSelector(selectSignupCampaign);
  const submitStatus = useAppSelector(selectSignupSubmitStatus);
  const submitError = useAppSelector(selectSignupSubmitError);
  const isSubmitting = submitStatus === 'submitting';
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      lastName: '',
      document: '',
      city: '',
      phone: '',
      email: '',
    },
  });
  const handleSubmit = form.handleSubmit(async (values) => {
    await dispatch(
      submitSignupCampaignRegistration({ code, payload: values })
    );
  });
  return (
    <div className='flex min-h-screen items-center justify-center bg-muted/30 p-4'>
      <Card className='w-full max-w-xl'>
        <CardHeader className='space-y-1'>
          <CardTitle className='text-xl'>
            {campaign?.name ?? 'Registro de agentes'}
          </CardTitle>
          {campaign?.description ? (
            <CardDescription>{campaign.description}</CardDescription>
          ) : (
            <CardDescription>
              Completa tus datos para iniciar tu proceso como agente.
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input autoComplete='given-name' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='lastName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apellido</FormLabel>
                      <FormControl>
                        <Input autoComplete='family-name' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name='document'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Documento</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete='off'
                        inputMode='numeric'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='city'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ciudad</FormLabel>
                      <FormControl>
                        <Input autoComplete='address-level2' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='phone'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input
                          type='tel'
                          autoComplete='tel'
                          inputMode='tel'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo electrónico</FormLabel>
                    <FormControl>
                      <Input
                        type='email'
                        autoComplete='email'
                        inputMode='email'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {submitError ? (
                <p className='rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive'>
                  {submitError}
                </p>
              ) : null}
              <Button
                type='submit'
                disabled={isSubmitting}
                className='w-full cursor-pointer'
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Enviando…
                  </>
                ) : (
                  'Enviar registro'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
