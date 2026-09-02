import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/store';
import { buyerLogout } from '@/features/lot-purchase/store/buyer-auth-slice';

type LotPurchaseShellProps = {
  children: React.ReactNode;
  showNav?: boolean;
};

export function LotPurchaseShell({
  children,
  showNav = true,
}: LotPurchaseShellProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(
    (state) => state.buyerAuth.isAuthenticated,
  );
  const buyer = useAppSelector((state) => state.buyerAuth.session?.buyer);

  return (
    <div className="min-h-screen bg-background">
      {showNav ? (
        <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
            <Link
              to="/stock"
              className="cursor-pointer transition-opacity duration-200 hover:opacity-80"
            >
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                {t('lotPurchase.brand')}
              </p>
              <p className="text-sm font-extrabold text-foreground">
                {t('lotPurchase.storeTitle')}
              </p>
            </Link>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              {isAuthenticated ? (
                <>
                  <Button asChild variant="ghost" size="sm" className="cursor-pointer">
                    <Link to="/mis-compras">{t('lotPurchase.storeMyPurchases')}</Link>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                    onClick={() => dispatch(buyerLogout())}
                  >
                    {t('lotPurchase.storeLogout')}
                    {buyer?.fullName ? ` (${buyer.fullName.split(' ')[0]})` : ''}
                  </Button>
                </>
              ) : (
                <Button asChild variant="outline" size="sm" className="cursor-pointer">
                  <Link to="/mis-compras">{t('lotPurchase.storeLogin')}</Link>
                </Button>
              )}
            </div>
          </div>
        </header>
      ) : null}
      {children}
    </div>
  );
}
