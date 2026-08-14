import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Columns3, Grid2x2, MapPinned, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchLotStock, selectLotStock } from '@/features/lot-stock/store/lot-stock-slice';
import { LotStockGlance } from '@/features/lot-stock/components/lot-stock-glance';
import { LotStockGrid } from '@/features/lot-stock/components/lot-stock-grid';
import { LotStockColumns } from '@/features/lot-stock/components/lot-stock-columns';
import { LotStockFooter } from '@/features/lot-stock/components/lot-stock-footer';
import { LotStockSettingsSheet } from '@/features/lot-stock/components/lot-stock-settings-sheet';
import { chunkLots, collectStageOptions, filterPublicLots, lotStockKey, shouldShowStageFilter } from '@/features/lot-stock/utils/lot-stock.utils';
import { readLotStockPrefs, writeLotStockPrefs } from '@/features/lot-stock/utils/lot-stock-prefs';
import {
  LOT_STATUS_LABEL_KEY,
  LOT_STATUS_TONE,
} from '@/features/lot-stock/utils/lot-stock-status';
import { LOT_STOCK_STATUS_ORDER, type LotStockPrefs, type ProjectLotKind, type ProjectLotStatus, type PublicProjectLot } from '@/features/lot-stock/types/lot-stock.types';
import { getIntlLocaleTag } from '@/i18n/intl-locale';
import { cn } from '@/lib/utils';

type LotStockWorkspaceProps = {
  projectId: string;
};

export function LotStockWorkspace({ projectId }: LotStockWorkspaceProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { projectTitle, lots, summary, isLoading, error } = useAppSelector(selectLotStock);
  const isAuthenticated = useAppSelector((state) => Boolean(state.auth.user));
  const [kind, setKind] = useState<ProjectLotKind>('lot');
  const [statusFilter, setStatusFilter] = useState<ProjectLotStatus | 'all'>('all');
  const [stageFilter, setStageFilter] = useState<string | 'all'>('all');
  const [search, setSearch] = useState('');
  const [selectedLot, setSelectedLot] = useState<PublicProjectLot | null>(null);
  const [prefs, setPrefs] = useState<LotStockPrefs>(readLotStockPrefs);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const intlLocale = getIntlLocaleTag();
  const kindSummary = kind === 'lot' ? summary.lot : summary.commercial;
  const stageOptions = useMemo(
    () => collectStageOptions(lots, kind, t('lotStock.stageGeneral')),
    [lots, kind, t],
  );
  const showStageFilter = shouldShowStageFilter(stageOptions);
  const visibleLots = useMemo(
    () =>
      filterPublicLots({
        lots,
        kind,
        status: statusFilter,
        stage: showStageFilter ? stageFilter : 'all',
        search,
      }),
    [lots, kind, statusFilter, stageFilter, search, showStageFilter],
  );
  const columns = useMemo(
    () => chunkLots(visibleLots, prefs.rowsPerColumn),
    [visibleLots, prefs.rowsPerColumn],
  );
  const selectedKey = selectedLot ? lotStockKey(selectedLot) : null;

  useEffect(() => {
    void dispatch(fetchLotStock(projectId));
  }, [dispatch, projectId]);

  useEffect(() => {
    setPageIndex(0);
    setSelectedLot(null);
  }, [kind, statusFilter, stageFilter, search, prefs.rowsPerColumn]);

  useEffect(() => {
    setStageFilter('all');
  }, [kind]);

  const handlePrefsChange = (next: LotStockPrefs) => {
    setPrefs(next);
    writeLotStockPrefs(next);
  };

  const handleSelectLot = (lot: PublicProjectLot) => {
    setSelectedLot((current) => (current && lotStockKey(current) === lotStockKey(lot) ? null : lot));
  };

  return (
    <div className="flex h-dvh flex-col bg-background pb-20">
      <header className="shrink-0 border-b border-border bg-card/95 px-4 py-3">
        <div className="mx-auto flex max-w-6xl items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-2">
              <Link
                to={isAuthenticated ? '/projects' : '/stock'}
                className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-secondary text-foreground transition-colors duration-200 hover:bg-secondary/80"
                aria-label={t('lotStock.backProjects')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                {t('lotStock.pageReadOnly')}
              </span>
            </div>
            <h1 className="truncate text-xl font-extrabold text-foreground">
              {projectTitle || t('lotStock.hubTitle')}
            </h1>
          </div>
          <LanguageSwitcher />
        </div>
        <div className="mx-auto mt-3 flex max-w-6xl flex-wrap items-center gap-2">
          {LOT_STOCK_STATUS_ORDER.map((status) => {
            const tone = LOT_STATUS_TONE[status];
            const count = kindSummary[status];
            const isActive = statusFilter === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter((current) => (current === status ? 'all' : status))}
                className={cn(
                  'inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors duration-200',
                  isActive ? `${tone.bg} ${tone.border} ${tone.text}` : 'border-border bg-card text-muted-foreground hover:text-foreground',
                )}
              >
                <span className={cn('h-2 w-2 rounded-full', tone.dot)} />
                {t(LOT_STATUS_LABEL_KEY[status])}
                <span className="tabular-nums">{count}</span>
              </button>
            );
          })}
        </div>
        {showStageFilter ? (
          <div className="mx-auto mt-3 flex max-w-6xl flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setStageFilter('all')}
              className={cn(
                'inline-flex cursor-pointer items-center rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors duration-200',
                stageFilter === 'all'
                  ? 'border-foreground/30 bg-foreground text-background'
                  : 'border-border bg-card text-muted-foreground hover:text-foreground',
              )}
            >
              {t('lotStock.filterAllStages')}
            </button>
            {stageOptions.map((stage) => (
              <button
                key={stage.key}
                type="button"
                onClick={() =>
                  setStageFilter((current) => (current === stage.key ? 'all' : stage.key))
                }
                className={cn(
                  'inline-flex cursor-pointer items-center rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors duration-200',
                  stageFilter === stage.key
                    ? 'border-foreground/30 bg-foreground text-background'
                    : 'border-border bg-card text-muted-foreground hover:text-foreground',
                )}
              >
                {stage.name}
              </button>
            ))}
          </div>
        ) : null}
        <div className="mx-auto mt-3 flex max-w-6xl flex-wrap items-center gap-2">
          <div className="relative min-w-[10rem] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t('lotStock.searchPlaceholder')}
              className="h-10 pl-9"
              aria-label={t('lotStock.searchPlaceholder')}
            />
          </div>
          <div className="inline-flex rounded-lg border border-border bg-secondary p-1">
            {(
              [
                ['glance', MapPinned, 'lotStock.viewGlance'],
                ['grid', Grid2x2, 'lotStock.viewGrid'],
                ['columns', Columns3, 'lotStock.viewColumns'],
              ] as const
            ).map(([mode, Icon, labelKey]) => (
              <button
                key={mode}
                type="button"
                onClick={() => handlePrefsChange({ ...prefs, viewMode: mode })}
                className={cn(
                  'inline-flex h-8 cursor-pointer items-center gap-1 rounded-md px-2.5 text-xs font-semibold transition-colors duration-200',
                  prefs.viewMode === mode
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
                aria-pressed={prefs.viewMode === mode}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t(labelKey)}</span>
              </button>
            ))}
          </div>
        </div>
      </header>
      <main className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-auto px-4 py-4">
        {isLoading ? (
          <div className="grid grid-cols-6 gap-2">
            {Array.from({ length: 24 }).map((_, index) => (
              <Skeleton key={index} className="h-11 rounded-lg" />
            ))}
          </div>
        ) : null}
        {error ? (
          <div className="py-10 text-center">
            <p className="text-sm text-destructive">{t('lotStock.error')}</p>
            <Button type="button" className="mt-3 cursor-pointer" onClick={() => void dispatch(fetchLotStock(projectId))}>
              {t('lotStock.retry')}
            </Button>
          </div>
        ) : null}
        {!isLoading && !error && prefs.viewMode !== 'columns' ? (
          <p className="mb-3 text-xs text-muted-foreground">{t('lotStock.glanceHint')}</p>
        ) : null}
        {!isLoading && !error && selectedLot && prefs.viewMode !== 'columns' ? (
          <div
            className={cn(
              'mb-4 rounded-xl border-2 p-3',
              LOT_STATUS_TONE[selectedLot.status].bg,
              LOT_STATUS_TONE[selectedLot.status].border,
              LOT_STATUS_TONE[selectedLot.status].text,
            )}
          >
            <p className="text-sm font-extrabold">{t('lotStock.selectedLot', { number: selectedLot.number })}</p>
            {showStageFilter ? (
              <p className="mt-1 text-xs font-semibold">
                {t('lotStock.stageLabel')}:{' '}
                {selectedLot.stageName || t('lotStock.stageGeneral')}
              </p>
            ) : null}
            <p className="mt-1 text-xs font-semibold">{t(LOT_STATUS_LABEL_KEY[selectedLot.status])}</p>
            <p className="mt-2 text-sm">
              {t('lotStock.areaM2', { area: Math.round(selectedLot.area) })} · $
              {selectedLot.price.toLocaleString(intlLocale)}
            </p>
            <p className="text-sm">
              {t('lotStock.colVentor')}: {selectedLot.ventorName?.trim() ? selectedLot.ventorName : t('lotStock.noVentor')}
            </p>
            {selectedLot.status === 'hold' && selectedLot.holdUntil ? (
              <p className="mt-1 text-sm font-semibold">
                {t('lotStock.holdUntilLabel')}:{' '}
                {new Date(selectedLot.holdUntil).toLocaleString(intlLocale, {
                  dateStyle: 'short',
                  timeStyle: 'short',
                })}
              </p>
            ) : null}
          </div>
        ) : null}
        {!isLoading && !error && prefs.viewMode === 'glance' ? (
          <LotStockGlance lots={visibleLots} selectedKey={selectedKey} onSelect={handleSelectLot} />
        ) : null}
        {!isLoading && !error && prefs.viewMode === 'grid' ? (
          <LotStockGrid lots={visibleLots} selectedKey={selectedKey} onSelect={handleSelectLot} />
        ) : null}
        {!isLoading && !error && prefs.viewMode === 'columns' ? (
          <LotStockColumns
            columns={columns}
            columnNav={prefs.columnNav}
            pageIndex={pageIndex}
            onPageIndexChange={setPageIndex}
          />
        ) : null}
      </main>
      <LotStockFooter kind={kind} onKindChange={setKind} onOpenSettings={() => setSettingsOpen(true)} />
      <LotStockSettingsSheet
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        prefs={prefs}
        onChange={handlePrefsChange}
      />
    </div>
  );
}
