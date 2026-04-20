import { useMemo, useState, type CSSProperties } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store';
import { patchVendorCustomerStepRequest } from '@/store/clientsSlice';

export type ClientDetailStepSelectProps = {
  currentStepId: string | null;
  disabled?: boolean;
};

function stepBadgeStyle(color: string | undefined): CSSProperties | undefined {
  if (!color?.trim()) {
    return undefined;
  }
  return {
    backgroundColor: color.trim(),
    color: '#0f172a',
  };
}

export function ClientDetailStepSelect({
  currentStepId,
  disabled = false,
}: ClientDetailStepSelectProps) {
  const { id: customerId } = useParams();
  const dispatch = useAppDispatch();
  const catalog = useAppSelector((s) => s.clients.vendorStepCatalog);
  const [open, setOpen] = useState(false);
  const sorted = useMemo(() => {
    return [...catalog]
      .filter((s) => s.isActive)
      .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
  }, [catalog]);

  const current = sorted.find((s) => s.id === currentStepId) ?? null;

  const selectStep = (stepId: string) => {
    if (!customerId) return;
    void dispatch(patchVendorCustomerStepRequest({ customerId, stepId }));
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled || sorted.length === 0}
        onClick={() => !disabled && sorted.length > 0 && setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border bg-secondary/30 transition-colors hover:bg-secondary/50 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs text-muted-foreground font-medium shrink-0">Etapa:</span>
          {current ? (
            <span
              className="text-[11px] font-bold px-2.5 py-0.5 rounded-full truncate bg-secondary text-foreground"
              style={stepBadgeStyle(current.color)}
            >
              {current.name}
            </span>
          ) : (
            <span className="text-[11px] font-medium text-muted-foreground truncate">
              Sin etapa
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open && sorted.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute z-10 top-full mt-1 w-full bg-card border border-border rounded-xl shadow-lg overflow-hidden"
          >
            {sorted.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => selectStep(s.id)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-secondary/40 transition-colors cursor-pointer"
              >
                <span
                  className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-secondary text-foreground"
                  style={stepBadgeStyle(s.color)}
                >
                  {s.name}
                </span>
                {currentStepId === s.id && <Check className="w-4 h-4 text-accent shrink-0" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
