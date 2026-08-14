import type {
  ProjectLotKind,
  ProjectLotStatus,
  PublicProjectLot,
} from '@/features/lot-stock/types/lot-stock.types';

export const DEFAULT_STAGE_KEY = 'default';

export type LotStockStageOption = {
  key: string;
  name: string;
  order: number;
};

export function lotStockKey(lot: PublicProjectLot): string {
  const stage = lot.stageKey || DEFAULT_STAGE_KEY;
  return `${lot.kind}-${stage}-${lot.number}`;
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
  return [...lots].sort((a, b) => {
    const orderDiff = (a.stageOrder ?? 0) - (b.stageOrder ?? 0);
    if (orderDiff !== 0) return orderDiff;
    const stageCmp = (a.stageKey || DEFAULT_STAGE_KEY).localeCompare(
      b.stageKey || DEFAULT_STAGE_KEY,
    );
    if (stageCmp !== 0) return stageCmp;
    return compareLotNumber(a.number, b.number);
  });
}

export function filterPublicLots(params: {
  lots: PublicProjectLot[];
  kind: ProjectLotKind;
  status: ProjectLotStatus | 'all';
  stage: string | 'all';
  search: string;
}): PublicProjectLot[] {
  const query = params.search.trim().toLowerCase();
  return sortPublicLots(
    params.lots.filter((lot) => {
      if (lot.kind !== params.kind) return false;
      if (params.status !== 'all' && lot.status !== params.status) return false;
      if (
        params.stage !== 'all' &&
        (lot.stageKey || DEFAULT_STAGE_KEY) !== params.stage
      ) {
        return false;
      }
      if (query && !lot.number.toLowerCase().includes(query)) return false;
      return true;
    }),
  );
}

export function collectStageOptions(
  lots: PublicProjectLot[],
  kind: ProjectLotKind,
  generalLabel: string,
): LotStockStageOption[] {
  const byKey = new Map<string, LotStockStageOption>();
  for (const lot of lots) {
    if (lot.kind !== kind) continue;
    const key = lot.stageKey || DEFAULT_STAGE_KEY;
    if (byKey.has(key)) continue;
    byKey.set(key, {
      key,
      name:
        lot.stageName ||
        (key === DEFAULT_STAGE_KEY ? generalLabel : key),
      order: lot.stageOrder ?? 0,
    });
  }
  return Array.from(byKey.values()).sort(
    (a, b) => a.order - b.order || a.name.localeCompare(b.name),
  );
}

/** Show stage chips when there is more than one stage, or any non-default stage. */
export function shouldShowStageFilter(stages: LotStockStageOption[]): boolean {
  if (stages.length === 0) return false;
  if (stages.length > 1) return true;
  return stages[0]?.key !== DEFAULT_STAGE_KEY;
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
