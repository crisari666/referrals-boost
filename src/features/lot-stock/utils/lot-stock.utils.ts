import type {
  ProjectLotKind,
  ProjectLotStatus,
  PublicProjectLot,
} from '@/features/lot-stock/types/lot-stock.types';

export function lotStockKey(lot: PublicProjectLot): string {
  return `${lot.kind}-${lot.number}`;
}

export function compareLotNumber(a: string, b: string): number {
  const left = Number.parseInt(a, 10);
  const right = Number.parseInt(b, 10);
  if (Number.isFinite(left) && Number.isFinite(right) && left !== right) {
    return left - right;
  }
  return a.localeCompare(b, undefined, { numeric: true });
}

export function sortPublicLots(lots: PublicProjectLot[]): PublicProjectLot[] {
  return [...lots].sort((a, b) => compareLotNumber(a.number, b.number));
}

export function filterPublicLots(params: {
  lots: PublicProjectLot[];
  kind: ProjectLotKind;
  status: ProjectLotStatus | 'all';
  search: string;
}): PublicProjectLot[] {
  const query = params.search.trim().toLowerCase();
  return sortPublicLots(
    params.lots.filter((lot) => {
      if (lot.kind !== params.kind) return false;
      if (params.status !== 'all' && lot.status !== params.status) return false;
      if (query && !lot.number.toLowerCase().includes(query)) return false;
      return true;
    }),
  );
}

export function chunkLots(lots: PublicProjectLot[], size: number): PublicProjectLot[][] {
  const rows = Math.max(1, size);
  const columns: PublicProjectLot[][] = [];
  for (let i = 0; i < lots.length; i += rows) {
    columns.push(lots.slice(i, i + rows));
  }
  return columns;
}

export function columnRangeLabel(column: PublicProjectLot[]): string {
  if (column.length === 0) return '';
  const first = column[0]?.number ?? '';
  const last = column[column.length - 1]?.number ?? first;
  return first === last ? first : `${first}–${last}`;
}
