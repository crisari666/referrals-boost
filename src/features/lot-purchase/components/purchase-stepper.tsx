import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import {
  PURCHASE_WIZARD_STEPS,
  type PurchaseWizardStep,
} from '@/features/lot-purchase/types/lot-purchase.types';

const STEP_LABEL_KEY: Record<PurchaseWizardStep, string> = {
  resumen: 'lotPurchase.stepResumen',
  cuenta: 'lotPurchase.stepCuenta',
  datos: 'lotPurchase.stepDatos',
  legal: 'lotPurchase.stepLegal',
  pago: 'lotPurchase.stepPago',
  exito: 'lotPurchase.stepExito',
};

type PurchaseStepperProps = {
  current: PurchaseWizardStep;
};

export function PurchaseStepper({ current }: PurchaseStepperProps) {
  const { t } = useTranslation();
  const currentIndex = PURCHASE_WIZARD_STEPS.indexOf(current);
  const visibleSteps = PURCHASE_WIZARD_STEPS.filter((step) => step !== 'exito');
  const displayIndex =
    current === 'exito' ? visibleSteps.length : Math.max(1, currentIndex + 1);

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-muted-foreground">
        {t('lotPurchase.wizardStepOf', {
          current: displayIndex,
          total: visibleSteps.length,
        })}
      </p>
      <ol className="flex gap-1 overflow-x-auto motion-reduce:transition-none">
        {visibleSteps.map((step, index) => {
          const isDone = index < currentIndex || current === 'exito';
          const isCurrent = step === current;
          return (
            <li key={step} className="min-w-0 flex-1">
              <div
                className={cn(
                  'h-1.5 rounded-full transition-colors duration-200',
                  isDone || isCurrent ? 'bg-primary' : 'bg-muted',
                )}
              />
              <p
                className={cn(
                  'mt-1 truncate text-[10px] font-semibold',
                  isCurrent ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {t(STEP_LABEL_KEY[step])}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
