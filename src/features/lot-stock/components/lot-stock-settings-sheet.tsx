import { Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { LOT_STOCK_ROWS_OPTIONS, type LotStockPrefs } from '@/features/lot-stock/types/lot-stock.types';

type LotStockSettingsSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefs: LotStockPrefs;
  onChange: (prefs: LotStockPrefs) => void;
};

export function LotStockSettingsSheet({
  open,
  onOpenChange,
  prefs,
  onChange,
}: LotStockSettingsSheetProps) {
  const { t } = useTranslation();
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            {t('lotStock.settingsTitle')}
          </SheetTitle>
          <SheetDescription className="sr-only">{t('lotStock.settings')}</SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <fieldset className="space-y-3">
            <Label className="text-sm font-semibold">{t('lotStock.rowsPerColumn')}</Label>
            <RadioGroup
              value={String(prefs.rowsPerColumn)}
              onValueChange={(value) => onChange({ ...prefs, rowsPerColumn: Number(value) })}
              className="grid grid-cols-4 gap-2"
            >
              {LOT_STOCK_ROWS_OPTIONS.map((rows) => (
                <div key={rows} className="flex items-center">
                  <RadioGroupItem value={String(rows)} id={`rows-${rows}`} className="peer sr-only" />
                  <Label
                    htmlFor={`rows-${rows}`}
                    className="flex h-10 w-full cursor-pointer items-center justify-center rounded-lg border border-border text-sm font-semibold peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 peer-data-[state=checked]:text-primary"
                  >
                    {rows}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </fieldset>
          <fieldset className="space-y-3">
            <Label className="text-sm font-semibold">{t('lotStock.columnNav')}</Label>
            <RadioGroup
              value={prefs.columnNav}
              onValueChange={(value) =>
                onChange({ ...prefs, columnNav: value as LotStockPrefs['columnNav'] })
              }
              className="grid gap-2"
            >
              <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                <RadioGroupItem value="scroll" id="nav-scroll" />
                <Label htmlFor="nav-scroll" className="cursor-pointer font-medium">
                  {t('lotStock.columnNavScroll')}
                </Label>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                <RadioGroupItem value="pages" id="nav-pages" />
                <Label htmlFor="nav-pages" className="cursor-pointer font-medium">
                  {t('lotStock.columnNavPages')}
                </Label>
              </div>
            </RadioGroup>
          </fieldset>
        </div>
      </SheetContent>
    </Sheet>
  );
}
