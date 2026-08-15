import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Columns3, Grid2x2, LayoutGrid, Map as MapIcon, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchLotStock, selectLotStock } from '@/features/lot-stock/store/lot-stock-slice';
import { LotStockGlance } from '@/features/lot-stock/components/lot-stock-glance';
import { LotStockGrid } from '@/features/lot-stock/components/lot-stock-grid';
import { LotStockColumns } from '@/features/lot-stock/components/lot-stock-columns';
import { LotStockMap } from '@/features/lot-stock/components/lot-stock-map';
import { LotStockFooter } from '@/features/lot-stock/components/lot-stock-footer';
import { LotStockSettingsSheet } from '@/features/lot-stock/components/lot-stock-settings-sheet';
import {
  LotStockMobileFilters,
  LotStockStatusFilterList,
} from '@/features/lot-stock/components/lot-stock-mobile-filters';
import { chunkLots, collectStageOptions, filterPublicLots, lotStockKey, shouldShowStageFilter } from '@/features/lot-stock/utils/lot-stock.utils';
import { readLotStockPrefs, writeLotStockPrefs } from '@/features/lot-stock/utils/lot-stock-prefs';
import {
  parseLotStockViewHash,
  writeLotStockViewHash,
} from '@/features/lot-stock/utils/lot-stock-hash';
import {
  LOT_STATUS_LABEL_KEY,
  LOT_STATUS_TONE,
} from '@/features/lot-stock/utils/lot-stock-status';
import {
  type LotStockPrefs,
  type LotStockViewMode,
  type ProjectLotKind,
  type ProjectLotStatus,
  type PublicProjectLot,
} from '@/features/lot-stock/types/lot-stock.types';
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
    const viewChanged = next.viewMode !== prefs.viewMode;
    setPrefs(next);
    writeLotStockPrefs(next);
    if (viewChanged) {
      writeLotStockViewHash(next.viewMode);
    }
  };

  const handleViewModeChange = (mode: LotStockViewMode) => {
    handlePrefsChange({ ...prefs, viewMode: mode });
  };

  useEffect(() => {
    const onHashChange = () => {
      const fromHash = parseLotStockViewHash(window.location.hash);
      if (!fromHash) return;
      setPrefs((current) => {
        if (current.viewMode === fromHash) return current;
        const next = { ...current, viewMode: fromHash };
        writeLotStockPrefs(next);
        return next;
      });
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const handleSelectLot = (lot: PublicProjectLot) => {
    setSelectedLot((current) => (current && lotStockKey(current) === lotStockKey(lot) ? null : lot));
  };

  const isMap = prefs.viewMode === 'map';

  return (
    <div className={cn('flex h-dvh flex-col bg-background', isMap ? 'pb-14' : 'pb-20')}>
      <header
        className={cn(
          'shrink-0 border-b border-border bg-card/95',
          isMap ? 'px-2 py-1.5 md:px-3 md:py-2' : 'px-3 py-2.5 md:px-4 md:py-3',
        )}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <Link
              to={isAuthenticated ? '/projects' : '/stock'}
              className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-secondary text-foreground transition-colors duration-200 hover:bg-secondary/80"
              aria-label={t('lotStock.backProjects')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            {!isMap ? (
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                {t('lotStock.pageReadOnly')}
              </span>
            ) : null}
            <h1
              className={cn(
                'truncate font-extrabold text-foreground',
                isMap ? 'text-base md:text-lg' : 'text-lg md:text-xl',
              )}
            >
              {projectTitle || t('lotStock.hubTitle')}
            </h1>
          </div>
          <LanguageSwitcher />
        </div>
        <div
          className={cn(
            'mx-auto flex max-w-6xl flex-col',
            isMap ? 'mt-1.5 gap-1.5' : 'mt-3 gap-2',
          )}
        >
          <LotStockMobileFilters
            summary={kindSummary}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            showStageFilter={showStageFilter}
            stageOptions={stageOptions}
            stageFilter={stageFilter}
            onStageChange={setStageFilter}
            hideStatusTrigger={isMap}
          />
          {!isMap ? (
            <div className="hidden max-w-6xl flex-wrap items-center gap-2 md:flex">
              <LotStockStatusFilterList
                summary={kindSummary}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
              />
            </div>
          ) : null}
          {showStageFilter && !isMap ? (
            <div className="hidden max-w-6xl flex-wrap items-center gap-2 md:flex">
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
          {showStageFilter && isMap ? (
            <div className="hidden md:block">
              <Select
                value={stageFilter}
                onValueChange={(value) => setStageFilter(value as string | 'all')}
              >
                <SelectTrigger className="h-8 w-full max-w-xs cursor-pointer text-xs">
                  <SelectValue placeholder={t('lotStock.filterAllStages')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('lotStock.filterAllStages')}</SelectItem>
                  {stageOptions.map((stage) => (
                    <SelectItem key={stage.key} value={stage.key}>
                      {stage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
        </div>
        <div
          className={cn(
            'mx-auto flex max-w-6xl flex-wrap items-center gap-1.5',
            isMap ? 'mt-1.5' : 'mt-2 md:mt-3',
          )}
        >
          <div className="relative min-w-[8rem] flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t('lotStock.searchPlaceholder')}
              className={cn('pl-8', isMap ? 'h-8 text-sm' : 'h-10')}
              aria-label={t('lotStock.searchPlaceholder')}
            />
          </div>
          <div className={cn('inline-flex rounded-lg border border-border bg-secondary', isMap ? 'p-0.5' : 'p-1')}>
            {(
              [
                ['glance', LayoutGrid, 'lotStock.viewGlance'],
                ['grid', Grid2x2, 'lotStock.viewGrid'],
                ['columns', Columns3, 'lotStock.viewColumns'],
                ['map', MapIcon, 'lotStock.viewMap'],
              ] as const
            ).map(([mode, Icon, labelKey]) => (
              <button
                key={mode}
                type="button"
                onClick={() => handleViewModeChange(mode)}
                className={cn(
                  'inline-flex cursor-pointer items-center gap-1 rounded-md text-xs font-semibold transition-colors duration-200',
                  isMap ? 'h-7 px-2' : 'h-8 px-2.5',
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
      <main
        className={cn(
          'flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-auto',
          isMap ? 'px-1.5 py-1.5 md:px-2 md:py-2' : 'px-4 py-4',
        )}
      >
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
        {!isLoading && !error && prefs.viewMode !== 'columns' && prefs.viewMode !== 'map' ? (
          <p className="mb-3 hidden text-xs text-muted-foreground md:block">{t('lotStock.glanceHint')}</p>
        ) : null}
        {!isLoading && !error && selectedLot && prefs.viewMode !== 'columns' ? (
          <div
            className={cn(
              'rounded-xl border-2',
              isMap ? 'mb-1.5 p-2' : 'mb-3 p-2.5 md:mb-4 md:p-3',
              LOT_STATUS_TONE[selectedLot.status].bg,
              LOT_STATUS_TONE[selectedLot.status].border,
              LOT_STATUS_TONE[selectedLot.status].text,
            )}
          >
            <p className={cn('font-extrabold', isMap ? 'text-xs' : 'text-sm')}>
              {t('lotStock.selectedLot', { number: selectedLot.number })}
            </p>
            {showStageFilter ? (
              <p className="mt-0.5 text-[11px] font-semibold md:text-xs">
                {t('lotStock.stageLabel')}:{' '}
                {selectedLot.stageName || t('lotStock.stageGeneral')}
              </p>
            ) : null}
            <p className="mt-0.5 text-[11px] font-semibold md:text-xs">
              {t(LOT_STATUS_LABEL_KEY[selectedLot.status])}
            </p>
            <p className={cn(isMap ? 'mt-1 text-xs' : 'mt-1.5 text-sm md:mt-2')}>
              {t('lotStock.areaM2', { area: Math.round(selectedLot.area) })} · $
              {selectedLot.price.toLocaleString(intlLocale)}
            </p>
            {!isMap ? (
              <p className="text-sm">
                {t('lotStock.colVentor')}:{' '}
                {selectedLot.ventorName?.trim() ? selectedLot.ventorName : t('lotStock.noVentor')}
              </p>
            ) : null}
            {selectedLot.status === 'hold' && selectedLot.holdUntil ? (
              <p className={cn('font-semibold', isMap ? 'mt-0.5 text-xs' : 'mt-1 text-sm')}>
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
        {!isLoading && !error && prefs.viewMode === 'map' ? (
          kind === 'commercial' ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              {t('lotStock.mapLotsOnly')}
            </p>
          ) : (
            <LotStockMap
              projectId={projectId}
              lots={visibleLots}
              statusFilter={statusFilter}
              stageFilter={showStageFilter ? stageFilter : 'all'}
              search={search}
              summary={kindSummary}
              onStatusChange={setStatusFilter}
              onSelect={handleSelectLot}
            />
          )
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
