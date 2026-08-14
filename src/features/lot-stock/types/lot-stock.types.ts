export type ProjectLotStatus = 'available' | 'sold' | 'hold' | 'locked';

export type ProjectLotKind = 'lot' | 'commercial';

export type LotStockViewMode = 'glance' | 'grid' | 'columns';

export type LotStockColumnNav = 'scroll' | 'pages';

export type LotStatusSummary = {
  available: number;
  sold: number;
  hold: number;
  locked: number;
  total: number;
};

export type LotKindSummary = {
  lot: LotStatusSummary;
  commercial: LotStatusSummary;
};

export type PublicProjectLot = {
  number: string;
  area: number;
  price: number;
  status: ProjectLotStatus;
  kind: ProjectLotKind;
  ventorName: string;
  holdUntil: string | null;
  stageKey: string;
  stageName: string;
  stageOrder: number;
};

export type PublicLotsResponse = {
  projectId: string;
  projectTitle: string;
  lots: PublicProjectLot[];
  summary: LotKindSummary;
};

export type LotStockPrefs = {
  viewMode: LotStockViewMode;
  rowsPerColumn: number;
  columnNav: LotStockColumnNav;
};

export const EMPTY_STATUS_SUMMARY: LotStatusSummary = {
  available: 0,
  sold: 0,
  hold: 0,
  locked: 0,
  total: 0,
};

export const EMPTY_KIND_SUMMARY: LotKindSummary = {
  lot: { ...EMPTY_STATUS_SUMMARY },
  commercial: { ...EMPTY_STATUS_SUMMARY },
};

export const LOT_STOCK_STATUS_ORDER: ProjectLotStatus[] = [
  'available',
  'hold',
  'sold',
  'locked',
];

export const LOT_STOCK_ROWS_OPTIONS = [30, 50, 70, 100] as const;

export const DEFAULT_LOT_STOCK_PREFS: LotStockPrefs = {
  viewMode: 'glance',
  rowsPerColumn: 70,
  columnNav: 'scroll',
};
