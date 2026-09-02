import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Lock, MapPin, X } from 'lucide-react';
import mapboxgl, { GeoJSONSource, LngLatBoundsLike, Map } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchLotStockMap, selectLotStock } from '@/features/lot-stock/store/lot-stock-slice';
import { LOT_STATUS_LABEL_KEY, LOT_STATUS_TONE } from '@/features/lot-stock/utils/lot-stock-status';
import type {
  LotMapFeatureProperties,
  LotMapGeoJson,
  LotStatusSummary,
  ProjectLotStatus,
  PublicProjectLot,
} from '@/features/lot-stock/types/lot-stock.types';
import { cn } from '@/lib/utils';

const STATUS_COLORS: Record<ProjectLotStatus | 'default', string> = {
  available: '#059669',
  hold: '#D97706',
  locked: '#475569',
  sold: '#E11D48',
  default: '#FFFFFF',
};

const LOTS_SOURCE_ID = 'project-lots-geojson';
const LOTS_FILL_LAYER_ID = 'project-lots-fill';
const LOTS_LINE_LAYER_ID = 'project-lots-outline';
const LOTS_SELECTED_FILL_ID = 'project-lots-selected-fill';
const LOTS_SELECTED_LINE_ID = 'project-lots-selected-outline';
const LOTS_SELECTED_GLOW_ID = 'project-lots-selected-glow';
const TERRAIN_SOURCE_ID = 'mapbox-dem';
const SKY_LAYER_ID = 'sky';
const MAP_PITCH = 60;
const MAP_BEARING = -20;
const LOT_EXTRUSION_HEIGHT_M = 0;
const SELECTED_EXTRUSION_HEIGHT_M = 4;
const MAPBOX_STYLE = 'mapbox://styles/mapbox/satellite-streets-v12';
const EMPTY_GEOJSON: LotMapGeoJson = {
  type: 'FeatureCollection',
  features: [],
};

const FILL_COLOR_EXPR: mapboxgl.ExpressionSpecification = [
  'match',
  ['coalesce', ['get', 'status'], ''],
  'available',
  STATUS_COLORS.available,
  'hold',
  STATUS_COLORS.hold,
  'locked',
  STATUS_COLORS.locked,
  'sold',
  STATUS_COLORS.sold,
  STATUS_COLORS.default,
];

const STATUS_FILTER_ORDER: ProjectLotStatus[] = [
  'available',
  'hold',
  'sold',
  'locked',
];

function resolveMapboxToken(): string {
  return (import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string | undefined)?.trim() ?? '';
}

function computeBounds(geojson: LotMapGeoJson): LngLatBoundsLike | null {
  let minLon = Infinity;
  let minLat = Infinity;
  let maxLon = -Infinity;
  let maxLat = -Infinity;
  const visit = (value: unknown): void => {
    if (!Array.isArray(value) || value.length === 0) return;
    if (typeof value[0] === 'number' && typeof value[1] === 'number') {
      const lon = value[0];
      const lat = value[1];
      minLon = Math.min(minLon, lon);
      maxLon = Math.max(maxLon, lon);
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
      return;
    }
    for (const child of value) {
      visit(child);
    }
  };
  for (const feature of geojson.features) {
    visit(feature.geometry.coordinates);
  }
  if (!Number.isFinite(minLon) || !Number.isFinite(minLat)) {
    return null;
  }
  return [
    [minLon, minLat],
    [maxLon, maxLat],
  ];
}

function readFeatureProperties(feature: unknown): LotMapFeatureProperties | null {
  if (!feature || typeof feature !== 'object') return null;
  const properties = (feature as { properties?: unknown }).properties;
  if (!properties || typeof properties !== 'object') return null;
  return properties as LotMapFeatureProperties;
}

function resolveBuyBlockedKey(status: ProjectLotStatus): string {
  if (status === 'sold') return 'lotPurchase.buyBlockedSold';
  if (status === 'hold') return 'lotPurchase.buyBlockedHold';
  return 'lotPurchase.buyBlockedLocked';
}

function buildSelectedFilter(
  lot: PublicProjectLot | null,
): mapboxgl.FilterSpecification | boolean {
  if (!lot) return false;
  return [
    'all',
    ['==', ['get', 'lotNumber'], lot.number],
    ['==', ['coalesce', ['get', 'stageKey'], ''], lot.stageKey || ''],
  ];
}

function enableMap3d(map: Map): void {
  if (!map.getSource(TERRAIN_SOURCE_ID)) {
    map.addSource(TERRAIN_SOURCE_ID, {
      type: 'raster-dem',
      url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
      tileSize: 512,
      maxzoom: 14,
    });
  }
  map.setTerrain({ source: TERRAIN_SOURCE_ID, exaggeration: 1 });
  if (!map.getLayer(SKY_LAYER_ID)) {
    map.addLayer({
      id: SKY_LAYER_ID,
      type: 'sky',
      paint: {
        'sky-type': 'atmosphere',
        'sky-atmosphere-sun': [0, 90],
        'sky-atmosphere-sun-intensity': 12,
      },
    });
  }
  map.setFog({
    color: 'rgb(186, 210, 235)',
    'high-color': 'rgb(36, 92, 223)',
    'horizon-blend': 0.02,
    'space-color': 'rgb(11, 11, 25)',
    'star-intensity': 0.6,
  });
}

function disableMap3d(map: Map): void {
  map.setTerrain(null);
  if (map.getLayer(SKY_LAYER_ID)) {
    map.removeLayer(SKY_LAYER_ID);
  }
  map.setFog(null);
}

function applyMapPerspective(map: Map, mode: '2d' | '3d'): void {
  if (mode === '3d') {
    enableMap3d(map);
    if (map.getLayer(LOTS_FILL_LAYER_ID)) {
      map.setPaintProperty(LOTS_FILL_LAYER_ID, 'fill-extrusion-height', LOT_EXTRUSION_HEIGHT_M);
      map.setPaintProperty(LOTS_FILL_LAYER_ID, 'fill-extrusion-opacity', 0.75);
    }
    if (map.getLayer(LOTS_SELECTED_FILL_ID)) {
      map.setPaintProperty(
        LOTS_SELECTED_FILL_ID,
        'fill-extrusion-height',
        SELECTED_EXTRUSION_HEIGHT_M,
      );
    }
    map.easeTo({ pitch: MAP_PITCH, bearing: MAP_BEARING, duration: 700 });
    return;
  }
  disableMap3d(map);
  if (map.getLayer(LOTS_FILL_LAYER_ID)) {
    map.setPaintProperty(LOTS_FILL_LAYER_ID, 'fill-extrusion-height', 0);
    map.setPaintProperty(LOTS_FILL_LAYER_ID, 'fill-extrusion-opacity', 0.55);
  }
  if (map.getLayer(LOTS_SELECTED_FILL_ID)) {
    map.setPaintProperty(LOTS_SELECTED_FILL_ID, 'fill-extrusion-height', 0);
  }
  map.easeTo({ pitch: 0, bearing: 0, duration: 700 });
}

function ensureLotsLayers(map: Map, mode: '2d' | '3d'): void {
  if (!map.getSource(LOTS_SOURCE_ID)) {
    map.addSource(LOTS_SOURCE_ID, {
      type: 'geojson',
      data: EMPTY_GEOJSON,
    });
  }
  if (!map.getLayer(LOTS_FILL_LAYER_ID)) {
    map.addLayer({
      id: LOTS_FILL_LAYER_ID,
      type: 'fill-extrusion',
      source: LOTS_SOURCE_ID,
      paint: {
        'fill-extrusion-color': FILL_COLOR_EXPR,
        'fill-extrusion-height': mode === '3d' ? LOT_EXTRUSION_HEIGHT_M : 0,
        'fill-extrusion-base': 0,
        'fill-extrusion-opacity': mode === '3d' ? 0.75 : 0.55,
      },
    });
  }
  if (!map.getLayer(LOTS_LINE_LAYER_ID)) {
    map.addLayer({
      id: LOTS_LINE_LAYER_ID,
      type: 'line',
      source: LOTS_SOURCE_ID,
      paint: {
        'line-color': '#ffffff',
        'line-width': 1.5,
        'line-opacity': 0.85,
      },
    });
  }
  if (!map.getLayer(LOTS_SELECTED_GLOW_ID)) {
    map.addLayer({
      id: LOTS_SELECTED_GLOW_ID,
      type: 'line',
      source: LOTS_SOURCE_ID,
      filter: false,
      paint: {
        'line-color': '#FFFFFF',
        'line-width': 8,
        'line-opacity': 0.35,
        'line-blur': 2,
      },
    });
  }
  if (!map.getLayer(LOTS_SELECTED_FILL_ID)) {
    map.addLayer({
      id: LOTS_SELECTED_FILL_ID,
      type: 'fill-extrusion',
      source: LOTS_SOURCE_ID,
      filter: false,
      paint: {
        'fill-extrusion-color': FILL_COLOR_EXPR,
        'fill-extrusion-height':
          mode === '3d' ? SELECTED_EXTRUSION_HEIGHT_M : 0,
        'fill-extrusion-base': 0,
        'fill-extrusion-opacity': 0.95,
      },
    });
  }
  if (!map.getLayer(LOTS_SELECTED_LINE_ID)) {
    map.addLayer({
      id: LOTS_SELECTED_LINE_ID,
      type: 'line',
      source: LOTS_SOURCE_ID,
      filter: false,
      paint: {
        'line-color': '#FFFFFF',
        'line-width': 3.5,
        'line-opacity': 1,
      },
    });
  }
}

function applySelectedHighlight(map: Map, lot: PublicProjectLot | null): void {
  const filter = buildSelectedFilter(lot);
  for (const layerId of [
    LOTS_SELECTED_GLOW_ID,
    LOTS_SELECTED_FILL_ID,
    LOTS_SELECTED_LINE_ID,
  ]) {
    if (map.getLayer(layerId)) {
      map.setFilter(layerId, filter);
    }
  }
}

type LotStockMapProps = {
  projectId: string;
  lots: PublicProjectLot[];
  statusFilter: ProjectLotStatus | 'all';
  stageFilter: string | 'all';
  search: string;
  summary: LotStatusSummary;
  onStatusChange: (status: ProjectLotStatus | 'all') => void;
  onSelect: (lot: PublicProjectLot) => void;
  selectedLot: PublicProjectLot | null;
  showStage: boolean;
  canHold: boolean;
  canUnhold: boolean;
  holdLoading: boolean;
  holdError: string | null;
  holdLabelKey: 'lotStock.hold72h' | 'lotStock.hold24h';
  intlLocale: string;
  onCloseSelected: () => void;
  onHold: () => void;
  onUnhold: () => void;
  onBuyLot?: () => void;
  buyLabelKey?: string;
};

export function LotStockMap({
  projectId,
  lots,
  statusFilter,
  stageFilter,
  search,
  summary,
  onStatusChange,
  onSelect,
  selectedLot,
  showStage,
  canHold,
  canUnhold,
  holdLoading,
  holdError,
  holdLabelKey,
  intlLocale,
  onCloseSelected,
  onHold,
  onUnhold,
  onBuyLot,
  buyLabelKey = 'lotPurchase.buyThisLot',
}: LotStockMapProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { mapPaint, mapLoading, mapError } = useAppSelector(selectLotStock);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const fittedKeyRef = useRef('');
  const onSelectRef = useRef(onSelect);
  const lotsRef = useRef(lots);
  const selectedLotRef = useRef(selectedLot);
  onSelectRef.current = onSelect;
  lotsRef.current = lots;
  selectedLotRef.current = selectedLot;
  const [perspective, setPerspective] = useState<'2d' | '3d'>('3d');
  const perspectiveRef = useRef<'2d' | '3d'>(perspective);
  perspectiveRef.current = perspective;
  const accessToken = resolveMapboxToken();
  const isBuyAvailable =
    Boolean(onBuyLot) &&
    selectedLot?.status === 'available' &&
    Boolean(selectedLot?.id);

  useEffect(() => {
    void dispatch(fetchLotStockMap(projectId));
  }, [dispatch, projectId]);

  const filteredGeoJson = useMemo((): LotMapGeoJson | null => {
    if (!mapPaint?.geojson) return null;
    const q = search.trim().toLowerCase();
    const features = mapPaint.geojson.features.filter((feature) => {
      const props = feature.properties;
      if (stageFilter !== 'all' && props.stageKey !== stageFilter) return false;
      if (statusFilter !== 'all') {
        if (!props.status || props.status !== statusFilter) return false;
      }
      if (q && !String(props.lotNumber).toLowerCase().includes(q)) return false;
      return true;
    });
    return { type: 'FeatureCollection', features };
  }, [mapPaint, stageFilter, statusFilter, search]);

  const hasMapData = Boolean(mapPaint);
  const isEmptyFilter =
    Boolean(filteredGeoJson) && filteredGeoJson!.features.length === 0;

  useEffect(() => {
    if (!accessToken || !containerRef.current || !hasMapData) return;
    if (mapRef.current) return;
    mapboxgl.accessToken = accessToken;
    const initialMode = perspectiveRef.current;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: MAPBOX_STYLE,
      center: [-74.08175, 4.60971],
      zoom: 14,
      pitch: initialMode === '3d' ? MAP_PITCH : 0,
      bearing: initialMode === '3d' ? MAP_BEARING : 0,
      antialias: true,
    });
    map.addControl(
      new mapboxgl.NavigationControl({ visualizePitch: true, showCompass: true }),
      'bottom-right',
    );
    map.dragRotate.enable();
    map.touchZoomRotate.enableRotation();
    popupRef.current = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 8,
    });
    map.on('style.load', () => {
      const mode = perspectiveRef.current;
      if (mode === '3d') {
        enableMap3d(map);
      } else {
        disableMap3d(map);
      }
      ensureLotsLayers(map, mode);
    });
    map.on('click', LOTS_FILL_LAYER_ID, (event) => {
      const props = readFeatureProperties(event.features?.[0]);
      if (!props) return;
      const key = `${props.stageKey || 'default'}::${props.lotNumber}`;
      const lot =
        lotsRef.current.find(
          (item) => `${item.stageKey || 'default'}::${item.number}` === key,
        ) ?? null;
      if (lot) {
        const withId =
          lot.id || !props.lotId ? lot : { ...lot, id: props.lotId };
        onSelectRef.current(withId);
      }
    });
    map.on('mouseenter', LOTS_FILL_LAYER_ID, (event) => {
      map.getCanvas().style.cursor = 'pointer';
      const props = readFeatureProperties(event.features?.[0]);
      if (!props || !popupRef.current) return;
      const label = `${t('lotStock.selectedLot', { number: props.lotNumber })} · ${props.stageName}`;
      popupRef.current.setLngLat(event.lngLat).setHTML(`<strong>${label}</strong>`).addTo(map);
    });
    map.on('mousemove', LOTS_FILL_LAYER_ID, (event) => {
      popupRef.current?.setLngLat(event.lngLat);
    });
    map.on('mouseleave', LOTS_FILL_LAYER_ID, () => {
      map.getCanvas().style.cursor = '';
      popupRef.current?.remove();
    });
    mapRef.current = map;
    return () => {
      popupRef.current?.remove();
      popupRef.current = null;
      map.remove();
      mapRef.current = null;
      fittedKeyRef.current = '';
    };
  }, [accessToken, hasMapData, t]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    applyMapPerspective(map, perspective);
  }, [perspective]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !filteredGeoJson) return;
    const apply = (): void => {
      ensureLotsLayers(map, perspectiveRef.current);
      const source = map.getSource(LOTS_SOURCE_ID) as GeoJSONSource | undefined;
      if (!source) return;
      source.setData(filteredGeoJson);
      applySelectedHighlight(map, selectedLotRef.current);
      const fitKey = `${mapPaint?.lotsMapGeojson ?? ''}:${stageFilter}:${statusFilter}:${search}:${filteredGeoJson.features.length}`;
      if (fitKey === fittedKeyRef.current) return;
      const bounds = computeBounds(filteredGeoJson);
      if (!bounds) return;
      const mode = perspectiveRef.current;
      map.fitBounds(bounds, {
        padding: { top: 72, bottom: 140, left: 48, right: 48 },
        maxZoom: 18,
        pitch: mode === '3d' ? MAP_PITCH : 0,
        bearing: mode === '3d' ? MAP_BEARING : 0,
        duration: 900,
      });
      fittedKeyRef.current = fitKey;
    };
    if (map.isStyleLoaded()) {
      apply();
      return;
    }
    map.once('style.load', apply);
  }, [filteredGeoJson, mapPaint?.lotsMapGeojson, stageFilter, statusFilter, search]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    applySelectedHighlight(map, selectedLot);
  }, [selectedLot]);

  if (!accessToken) {
    return (
      <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-3 text-sm text-amber-950">
        {t('lotStock.mapMissingToken')}
      </p>
    );
  }

  if (mapLoading && !mapPaint) {
    return <p className="py-10 text-center text-sm text-muted-foreground">{t('lotStock.mapLoading')}</p>;
  }

  if (mapError || !mapPaint) {
    return (
      <div className="py-10 text-center">
        <p className="text-sm text-muted-foreground">{t('lotStock.mapMissing')}</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl border border-border/60 shadow-sm">
      <div ref={containerRef} className="absolute inset-0" />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-24 bg-gradient-to-b from-black/55 via-black/25 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-36 bg-gradient-to-t from-black/50 via-black/20 to-transparent"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-10 bg-gradient-to-r from-black/20 to-transparent md:w-16" aria-hidden />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-10 bg-gradient-to-l from-black/20 to-transparent md:w-16" aria-hidden />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col gap-2 p-2.5 md:p-3">
        <div className="pointer-events-auto flex flex-wrap items-center gap-1.5">
          <div className="inline-flex max-w-full flex-wrap items-center gap-1 rounded-2xl border border-white/20 bg-black/45 p-1 shadow-lg backdrop-blur-md">
            {STATUS_FILTER_ORDER.map((status) => {
              const isActive = statusFilter === status;
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => onStatusChange(isActive ? 'all' : status)}
                  className={cn(
                    'inline-flex cursor-pointer items-center gap-1 rounded-xl border px-2 py-1 text-[10px] font-semibold transition-colors duration-200',
                    isActive
                      ? 'border-white/40 bg-white text-foreground'
                      : 'border-transparent bg-transparent text-white/90 hover:bg-white/15',
                  )}
                  aria-pressed={isActive}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: STATUS_COLORS[status] }}
                  />
                  <span className="hidden sm:inline">{t(LOT_STATUS_LABEL_KEY[status])}</span>
                  <span className="tabular-nums">{summary[status]}</span>
                </button>
              );
            })}
          </div>
          <div className="ml-auto inline-flex rounded-2xl border border-white/20 bg-black/45 p-0.5 shadow-lg backdrop-blur-md">
            {(['2d', '3d'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setPerspective(mode)}
                className={cn(
                  'inline-flex h-7 cursor-pointer items-center rounded-xl px-2.5 text-[10px] font-bold uppercase tracking-wide transition-colors duration-200',
                  perspective === mode
                    ? 'bg-white text-foreground shadow-sm'
                    : 'text-white/85 hover:bg-white/10',
                )}
                aria-pressed={perspective === mode}
              >
                {mode === '2d' ? t('lotStock.mapView2d') : t('lotStock.mapView3d')}
              </button>
            ))}
          </div>
        </div>
        <p className="pointer-events-none px-1 text-[10px] font-medium text-white/80 drop-shadow">
          {mapPaint.matchedCount}/{mapPaint.featureCount} {t('lotStock.mapMatched')}
        </p>
      </div>

      {isEmptyFilter ? (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center p-4">
          <p className="rounded-2xl border border-white/20 bg-black/55 px-4 py-3 text-center text-sm text-white shadow-lg backdrop-blur-md">
            {t('lotStock.mapEmpty')}
          </p>
        </div>
      ) : null}

      {!selectedLot && !isEmptyFilter ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex justify-center px-3 md:bottom-6">
          <div className="inline-flex max-w-md items-center gap-2 rounded-2xl border border-white/25 bg-black/55 px-3.5 py-2.5 text-sm text-white shadow-xl backdrop-blur-md">
            <MapPin className="h-4 w-4 shrink-0 text-primary" />
            <span className="font-medium">{t('lotPurchase.mapExploreHint')}</span>
          </div>
        </div>
      ) : null}

      {selectedLot ? (
        <div
          className={cn(
            'pointer-events-none absolute z-20',
            'inset-x-3 bottom-3',
            'md:inset-x-auto md:bottom-auto md:right-3 md:top-24 md:w-[min(100%-1.5rem,20rem)]',
          )}
        >
          <div
            className={cn(
              'pointer-events-auto overflow-hidden rounded-2xl border-2 bg-card/95 p-3.5 shadow-2xl backdrop-blur-md transition-colors duration-200',
              LOT_STATUS_TONE[selectedLot.status].bg,
              LOT_STATUS_TONE[selectedLot.status].border,
              LOT_STATUS_TONE[selectedLot.status].text,
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-extrabold">
                  {t('lotStock.selectedLot', { number: selectedLot.number })}
                </p>
                {showStage ? (
                  <p className="mt-0.5 text-[11px] font-semibold opacity-90">
                    {t('lotStock.stageLabel')}:{' '}
                    {selectedLot.stageName || t('lotStock.stageGeneral')}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={onCloseSelected}
                className="inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-current opacity-80 transition-opacity duration-200 hover:opacity-100"
                aria-label={t('lotStock.closeSelected')}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                  LOT_STATUS_TONE[selectedLot.status].border,
                )}
              >
                <span
                  className={cn('h-1.5 w-1.5 rounded-full', LOT_STATUS_TONE[selectedLot.status].dot)}
                />
                {t(LOT_STATUS_LABEL_KEY[selectedLot.status])}
              </span>
              <span className="text-xs font-semibold">
                {t('lotStock.areaM2', { area: Math.round(selectedLot.area) })} · $
                {selectedLot.price.toLocaleString(intlLocale)}
              </span>
            </div>
            {selectedLot.status === 'hold' && selectedLot.holdUntil ? (
              <p className="mt-1.5 text-xs font-semibold">
                {t('lotStock.holdUntilLabel')}:{' '}
                {new Date(selectedLot.holdUntil).toLocaleString(intlLocale, {
                  dateStyle: 'short',
                  timeStyle: 'short',
                })}
              </p>
            ) : null}
            {holdError ? <p className="mt-1.5 text-xs text-destructive">{holdError}</p> : null}
            {canHold && selectedLot.status === 'available' && selectedLot.id ? (
              <button
                type="button"
                disabled={holdLoading}
                onClick={onHold}
                className="mt-2.5 inline-flex h-9 w-full cursor-pointer items-center justify-center rounded-xl bg-foreground px-3 text-xs font-semibold text-background transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {t(holdLabelKey)}
              </button>
            ) : null}
            {canUnhold && selectedLot.id ? (
              <button
                type="button"
                disabled={holdLoading}
                onClick={onUnhold}
                className="mt-2.5 inline-flex h-9 w-full cursor-pointer items-center justify-center rounded-xl bg-foreground px-3 text-xs font-semibold text-background transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {t('lotStock.unhold')}
              </button>
            ) : null}
            {onBuyLot ? (
              <button
                type="button"
                disabled={!isBuyAvailable}
                onClick={onBuyLot}
                className={cn(
                  'mt-2.5 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl px-3 text-xs font-bold transition-opacity duration-200',
                  isBuyAvailable
                    ? 'cursor-pointer bg-primary text-primary-foreground hover:opacity-90'
                    : 'cursor-not-allowed bg-muted text-muted-foreground',
                )}
              >
                {!isBuyAvailable ? <Lock className="h-3.5 w-3.5" /> : null}
                {isBuyAvailable
                  ? t(buyLabelKey)
                  : t(resolveBuyBlockedKey(selectedLot.status))}
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
