import { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { COUNTRY_CODES, type CountryCode } from '@/lib/country-codes';

type CountryCodeSelectProps = {
  value: CountryCode;
  onChange: (country: CountryCode) => void;
  disabled?: boolean;
};

export function CountryCodeSelect({ value, onChange, disabled }: CountryCodeSelectProps) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="h-10 shrink-0 justify-between gap-1 px-2 font-normal"
        >
          <span className="text-base leading-none">{value.flag}</span>
          <span className="text-sm tabular-nums">+{value.dial}</span>
          <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <Command
          filter={(itemValue, search) => {
            const q = search.toLowerCase();
            return itemValue.toLowerCase().includes(q) ? 1 : 0;
          }}
        >
          <CommandInput placeholder="Buscar país o código…" />
          <CommandList>
            <CommandEmpty>Sin resultados.</CommandEmpty>
            <CommandGroup>
              {COUNTRY_CODES.map((country) => (
                <CommandItem
                  key={country.code}
                  value={`${country.name} ${country.code} +${country.dial}`}
                  onSelect={() => {
                    onChange(country);
                    setOpen(false);
                  }}
                  className="flex items-center gap-2"
                >
                  <span className="text-base leading-none">{country.flag}</span>
                  <span className="flex-1 truncate">{country.name}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    +{country.dial}
                  </span>
                  <Check
                    className={cn(
                      'ml-1 h-4 w-4',
                      value.code === country.code ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
