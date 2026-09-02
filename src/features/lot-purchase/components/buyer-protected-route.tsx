import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store';

type BuyerProtectedRouteProps = {
  children: React.ReactNode;
};

export function BuyerProtectedRoute({ children }: BuyerProtectedRouteProps) {
  const isAuthenticated = useAppSelector(
    (state) => state.buyerAuth.isAuthenticated,
  );
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/stock"
        replace
        state={{ from: location.pathname, needBuyerAuth: true }}
      />
    );
  }

  return <>{children}</>;
}
