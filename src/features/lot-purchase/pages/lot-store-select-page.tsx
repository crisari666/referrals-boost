import { useParams } from 'react-router-dom';
import { LotStockWorkspace } from '@/features/lot-stock/components/lot-stock-workspace';

/** @deprecated Prefer /stock/:projectId — kept for legacy imports. */
export function LotStoreSelectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  if (!projectId) return null;
  return <LotStockWorkspace projectId={projectId} />;
}
