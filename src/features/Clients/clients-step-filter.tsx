import { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { setListStepFilterId } from '@/store/clientsSlice';
import { ChevronDown, Filter } from 'lucide-react';

export function ClientsStepFilter() {
  const dispatch = useAppDispatch();
  const steps = useAppSelector((s) => s.clients.vendorStepCatalog);
  const selectedId = useAppSelector((s) => s.clients.listStepFilterId);

  const options = useMemo(() => {
    return [...steps]
      .filter((s) => s.isActive)
      .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
  }, [steps]);

  if (options.length === 0) {
    return null;
  }

  return (
    <div className="relative shrink-0 min-w-[10.5rem] max-w-[40%] sm:max-w-none">
      <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      <select
        aria-label="Filtrar por etapa"
        value={selectedId ?? ''}
        onChange={(e) => {
          const v = e.target.value;
          dispatch(setListStepFilterId(v === '' ? null : v));
        }}
        className="w-full appearance-none bg-card border border-border rounded-xl pl-10 pr-10 py-3 text-sm text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
      >
        <option value="">Todas las etapas</option>
        {options.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
    </div>
  );
}
