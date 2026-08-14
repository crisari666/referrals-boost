import type { ProjectLotStatus } from '@/features/lot-stock/types/lot-stock.types';

export type LotStatusTone = {
  bg: string;
  border: string;
  text: string;
  dot: string;
};

export const LOT_STATUS_TONE: Record<ProjectLotStatus, LotStatusTone> = {
  available: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-500',
    text: 'text-emerald-900',
    dot: 'bg-emerald-500',
  },
  hold: {
    bg: 'bg-amber-50',
    border: 'border-amber-500',
    text: 'text-amber-950',
    dot: 'bg-amber-500',
  },
  sold: {
    bg: 'bg-rose-50',
    border: 'border-rose-500',
    text: 'text-rose-900',
    dot: 'bg-rose-500',
  },
  locked: {
    bg: 'bg-slate-100',
    border: 'border-slate-400',
    text: 'text-slate-700',
    dot: 'bg-slate-500',
  },
};

export const LOT_STATUS_LABEL_KEY: Record<ProjectLotStatus, string> = {
  available: 'lotStock.statusAvailable',
  hold: 'lotStock.statusHold',
  sold: 'lotStock.statusSold',
  locked: 'lotStock.statusLocked',
};

export const LOT_STATUS_CODE_KEY: Record<ProjectLotStatus, string> = {
  available: 'lotStock.codeAvailable',
  hold: 'lotStock.codeHold',
  sold: 'lotStock.codeSold',
  locked: 'lotStock.codeLocked',
};
