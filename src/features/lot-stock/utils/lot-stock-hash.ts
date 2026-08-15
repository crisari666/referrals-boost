import type { LotStockViewMode } from '@/features/lot-stock/types/lot-stock.types';

const HASH_TO_VIEW: Record<string, LotStockViewMode> = {
  map: 'map',
  grid: 'grid',
  columns: 'columns',
  glance: 'glance',
  tablero: 'glance',
};

export function parseLotStockViewHash(hash: string): LotStockViewMode | null {
  const raw = hash.replace(/^#/, '').trim().toLowerCase();
  if (raw === '') return null;
  return HASH_TO_VIEW[raw] ?? null;
}

export function lotStockViewToHash(viewMode: LotStockViewMode): string {
  return `#${viewMode}`;
}

export function readLotStockViewFromLocation(): LotStockViewMode | null {
  if (typeof window === 'undefined') return null;
  return parseLotStockViewHash(window.location.hash);
}

export function writeLotStockViewHash(viewMode: LotStockViewMode): void {
  if (typeof window === 'undefined') return;
  const nextHash = lotStockViewToHash(viewMode);
  if (window.location.hash === nextHash) return;
  const url = `${window.location.pathname}${window.location.search}${nextHash}`;
  window.history.replaceState(null, '', url);
}
