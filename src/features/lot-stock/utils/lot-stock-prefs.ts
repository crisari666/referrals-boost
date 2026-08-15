import { APP_CONSTANTS } from '@/constants/app-constants';
import {
  DEFAULT_LOT_STOCK_PREFS,
  LOT_STOCK_ROWS_OPTIONS,
  type LotStockColumnNav,
  type LotStockPrefs,
  type LotStockViewMode,
} from '@/features/lot-stock/types/lot-stock.types';
import { readLotStockViewFromLocation } from '@/features/lot-stock/utils/lot-stock-hash';

export function isLotStockViewMode(value: unknown): value is LotStockViewMode {
  return value === 'glance' || value === 'grid' || value === 'columns' || value === 'map';
}

function isColumnNav(value: unknown): value is LotStockColumnNav {
  return value === 'scroll' || value === 'pages';
}

export function readLotStockPrefs(): LotStockPrefs {
  try {
    const raw = localStorage.getItem(APP_CONSTANTS.LOT_STOCK_PREFS_KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<LotStockPrefs>) : {};
    const rows = Number(parsed.rowsPerColumn);
    const fromStorage: LotStockPrefs = {
      viewMode: isLotStockViewMode(parsed.viewMode)
        ? parsed.viewMode
        : DEFAULT_LOT_STOCK_PREFS.viewMode,
      columnNav: isColumnNav(parsed.columnNav)
        ? parsed.columnNav
        : DEFAULT_LOT_STOCK_PREFS.columnNav,
      rowsPerColumn: LOT_STOCK_ROWS_OPTIONS.includes(
        rows as (typeof LOT_STOCK_ROWS_OPTIONS)[number],
      )
        ? rows
        : DEFAULT_LOT_STOCK_PREFS.rowsPerColumn,
    };
    const fromHash = readLotStockViewFromLocation();
    if (fromHash) {
      return { ...fromStorage, viewMode: fromHash };
    }
    return fromStorage;
  } catch {
    const fromHash = readLotStockViewFromLocation();
    if (fromHash) {
      return { ...DEFAULT_LOT_STOCK_PREFS, viewMode: fromHash };
    }
    return DEFAULT_LOT_STOCK_PREFS;
  }
}

export function writeLotStockPrefs(prefs: LotStockPrefs): void {
  localStorage.setItem(APP_CONSTANTS.LOT_STOCK_PREFS_KEY, JSON.stringify(prefs));
}
