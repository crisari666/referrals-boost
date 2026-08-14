import { useParams } from 'react-router-dom';
import { LotStockWorkspace } from '@/features/lot-stock/components/lot-stock-workspace';

export function LotStockPage() {
  const { projectId } = useParams<{ projectId: string }>();
  if (!projectId) return null;
  return <LotStockWorkspace projectId={projectId} />;
}
