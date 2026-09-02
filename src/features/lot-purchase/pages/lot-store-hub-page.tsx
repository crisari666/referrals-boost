import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Map as MapIcon, MapPin } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { LotPurchaseShell } from '@/features/lot-purchase/components/lot-purchase-shell';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchProjects } from '@/store/projectsSlice';

export function LotStoreHubPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { list, isLoading, error } = useAppSelector((state) => state.projects);

  useEffect(() => {
    void dispatch(fetchProjects());
  }, [dispatch]);

  return (
    <LotPurchaseShell>
      <div className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(25_95%_53%_/_0.18),_transparent_55%),linear-gradient(180deg,_hsl(25_40%_97%),_hsl(0_0%_100%)_45%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-16 top-8 h-56 w-56 rounded-full bg-primary/10 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -left-10 top-40 h-40 w-40 rounded-full bg-amber-400/10 blur-3xl"
          aria-hidden
        />

        <div className="relative mx-auto max-w-3xl px-4 pb-14 pt-8 md:pt-12">
          <section className="mb-10 overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary via-orange-500 to-amber-500 p-6 text-primary-foreground shadow-lg md:p-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/85">
              {t('lotPurchase.brand')}
            </p>
            <h1 className="mt-2 max-w-lg text-3xl font-extrabold tracking-tight md:text-4xl">
              {t('lotPurchase.storeTitle')}
            </h1>
            <p className="mt-2 max-w-md text-sm text-white/90 md:text-base">
              {t('lotPurchase.storeSubtitle')}
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-black/20 px-3.5 py-2 text-sm font-semibold backdrop-blur-sm">
              <MapIcon className="h-4 w-4" />
              {t('lotPurchase.storeExploreCta')}
            </div>
          </section>

          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-28 rounded-2xl" />
              <Skeleton className="h-28 rounded-2xl" />
            </div>
          ) : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {!isLoading && !error && list.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              {t('lotPurchase.storeEmpty')}
            </p>
          ) : null}

          <div className="space-y-3">
            {list.map((project) => (
              <Link
                key={project.id}
                to={`/stock/${project.id}`}
                className="group flex cursor-pointer overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/45 hover:shadow-md"
              >
                <div className="w-1.5 shrink-0 bg-gradient-to-b from-primary to-amber-500" />
                <div className="flex min-w-0 flex-1 items-center gap-3 p-4 md:p-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground">
                    <MapIcon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-extrabold text-foreground">
                      {project.title}
                    </p>
                    {project.location ? (
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{project.location}</span>
                      </p>
                    ) : null}
                    {project.priceFrom > 0 ? (
                      <p className="mt-1.5 text-xs font-bold text-primary">
                        {t('lotPurchase.lotPrice')} desde $
                        {project.priceFrom.toLocaleString()}
                      </p>
                    ) : null}
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground">
                    {t('lotPurchase.storeExploreCta')}
                    <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </LotPurchaseShell>
  );
}
