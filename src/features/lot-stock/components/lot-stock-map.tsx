import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
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
const TERRAIN_SOURCE_ID = 'mapbox-dem';
const SKY_LAYER_ID = 'sky';
const MAP_PITCH = 60;
const MAP_BEARING = -20;
const LOT_EXTRUSION_HEIGHT_M = 0;
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
    map.easeTo({ pitch: MAP_PITCH, bearing: MAP_BEARING, duration: 700 });
    return;
  }
  disableMap3d(map);
  if (map.getLayer(LOTS_FILL_LAYER_ID)) {
    map.setPaintProperty(LOTS_FILL_LAYER_ID, 'fill-extrusion-height', 0);
    map.setPaintProperty(LOTS_FILL_LAYER_ID, 'fill-extrusion-opacity', 0.55);
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
  onSelectRef.current = onSelect;
  lotsRef.current = lots;
  const [perspective, setPerspective] = useState<'2d' | '3d'>('2d');
  const perspectiveRef = useRef<'2d' | '3d'>(perspective);
  perspectiveRef.current = perspective;
  const accessToken = resolveMapboxToken();

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
      'top-right',
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
      const fitKey = `${mapPaint?.lotsMapGeojson ?? ''}:${stageFilter}:${statusFilter}:${search}:${filteredGeoJson.features.length}`;
      if (fitKey === fittedKeyRef.current) return;
      const bounds = computeBounds(filteredGeoJson);
      if (!bounds) return;
      const mode = perspectiveRef.current;
      map.fitBounds(bounds, {
        padding: 48,
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

  if (!filteredGeoJson || filteredGeoJson.features.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">{t('lotStock.mapEmpty')}</p>;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-1">
      <div className="flex flex-wrap items-center gap-1">
        {(
          [
            'available',
            'hold',
            'sold',
            'locked',
          ] as const
        ).map((status) => {
          const isActive = statusFilter === status;
          return (
            <button
              key={status}
              type="button"
              onClick={() => onStatusChange(isActive ? 'all' : status)}
              className={cn(
                'inline-flex cursor-pointer items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold transition-colors duration-200',
                isActive
                  ? 'border-foreground/30 bg-foreground text-background'
                  : 'border-border bg-card text-foreground',
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
        <span className="hidden text-[10px] text-muted-foreground sm:inline">
          {mapPaint.matchedCount}/{mapPaint.featureCount} {t('lotStock.mapMatched')}
        </span>
        <div className="ml-auto inline-flex rounded-md border border-border bg-secondary p-0.5">
          {(['2d', '3d'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setPerspective(mode)}
              className={cn(
                'inline-flex h-6 cursor-pointer items-center rounded px-2 text-[10px] font-semibold transition-colors duration-200',
                perspective === mode
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              aria-pressed={perspective === mode}
            >
              {mode === '2d' ? t('lotStock.mapView2d') : t('lotStock.mapView3d')}
            </button>
          ))}
        </div>
      </div>
      <div className="relative min-h-0 flex-1">
        <div
          ref={containerRef}
          className="absolute inset-0 overflow-hidden rounded-lg border border-border"
        />
        {selectedLot ? (
          <div className="pointer-events-none absolute right-3 top-14 z-10 w-[min(100%-1.5rem,18rem)]">
            <div
              className={cn(
                'pointer-events-auto rounded-xl border-2 bg-card/95 p-3 shadow-lg backdrop-blur-sm transition-colors duration-200',
                LOT_STATUS_TONE[selectedLot.status].bg,
                LOT_STATUS_TONE[selectedLot.status].border,
                LOT_STATUS_TONE[selectedLot.status].text,
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-extrabold">
                  {t('lotStock.selectedLot', { number: selectedLot.number })}
                </p>
                <button
                  type="button"
                  onClick={onCloseSelected}
                  className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-current opacity-80 transition-opacity duration-200 hover:opacity-100"
                  aria-label={t('lotStock.closeSelected')}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              {showStage ? (
                <p className="mt-0.5 text-[11px] font-semibold">
                  {t('lotStock.stageLabel')}:{' '}
                  {selectedLot.stageName || t('lotStock.stageGeneral')}
                </p>
              ) : null}
              <p className="mt-0.5 text-[11px] font-semibold">
                {t(LOT_STATUS_LABEL_KEY[selectedLot.status])}
              </p>
              <p className="mt-1 text-xs">
                {t('lotStock.areaM2', { area: Math.round(selectedLot.area) })} · $
                {selectedLot.price.toLocaleString(intlLocale)}
              </p>
              {selectedLot.status === 'hold' && selectedLot.holdUntil ? (
                <p className="mt-0.5 text-xs font-semibold">
                  {t('lotStock.holdUntilLabel')}:{' '}
                  {new Date(selectedLot.holdUntil).toLocaleString(intlLocale, {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </p>
              ) : null}
              {holdError ? <p className="mt-1 text-xs text-destructive">{holdError}</p> : null}
              {canHold && selectedLot.status === 'available' && selectedLot.id ? (
                <button
                  type="button"
                  disabled={holdLoading}
                  onClick={onHold}
                  className="mt-2 inline-flex h-8 w-full cursor-pointer items-center justify-center rounded-lg bg-foreground px-3 text-xs font-semibold text-background transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {t(holdLabelKey)}
                </button>
              ) : null}
              {canUnhold && selectedLot.id ? (
                <button
                  type="button"
                  disabled={holdLoading}
                  onClick={onUnhold}
                  className="mt-2 inline-flex h-8 w-full cursor-pointer items-center justify-center rounded-lg bg-foreground px-3 text-xs font-semibold text-background transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {t('lotStock.unhold')}
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
