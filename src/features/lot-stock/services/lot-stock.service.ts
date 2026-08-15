import * as http from '@/lib/http';
import type {
  LotMapPaintResponse,
  PublicLotsResponse,
} from '@/features/lot-stock/types/lot-stock.types';

const RAG_BASE = (import.meta.env.VITE_URL_RAG_AGENT ?? '').replace(/\/$/, '');

function buildRagUrl(path: string): string {
  return `${RAG_BASE}/${path.replace(/^\//, '')}`;
}

export function fetchPublicProjectLots(projectId: string): Promise<PublicLotsResponse> {
  return http.get<PublicLotsResponse>('', {
    url: buildRagUrl(`projects/${projectId}/lots/public`),
    params: { kind: 'all' },
  });
}

export function fetchPublicLotsMap(projectId: string): Promise<LotMapPaintResponse> {
  return http.get<LotMapPaintResponse>('', {
    url: buildRagUrl(`projects/${projectId}/lots/map/public`),
  });
}
