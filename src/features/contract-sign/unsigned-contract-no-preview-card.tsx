import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const UnsignedContractNoPreviewCard = () => (
  <Card>
    <CardHeader className='space-y-0.5 px-4 py-3'>
      <CardTitle className='text-base font-semibold'>Firmar contrato</CardTitle>
      <CardDescription className='text-xs'>No hay vista previa disponible.</CardDescription>
    </CardHeader>
  </Card>
);
