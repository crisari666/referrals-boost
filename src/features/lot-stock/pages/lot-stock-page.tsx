import { useParams } from 'react-router-dom';
import { useAppSelector } from '@/store';
import { LotStockWorkspace } from '@/features/lot-stock/components/lot-stock-workspace';

export function LotStockPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  if (!projectId) return null;
  return <LotStockWorkspace projectId={projectId} embedded={isAuthenticated} />;
}
