import type { ReactNode } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAppSelector } from '@/store';

type StockLayoutRouteProps = {
  children: ReactNode;
};

/**
 * Public stock stays shell-less; logged-in users get the app drawer.
 */
export function StockLayoutRoute({ children }: StockLayoutRouteProps) {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  if (!isAuthenticated) {
    return <>{children}</>;
  }
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}
