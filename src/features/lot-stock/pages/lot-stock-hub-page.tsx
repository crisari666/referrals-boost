import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight, MapPin } from 'lucide-react';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchProjects } from '@/store/projectsSlice';

export function LotStockHubPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { list, isLoading, error } = useAppSelector((state) => state.projects);

  useEffect(() => {
    void dispatch(fetchProjects());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-background px-4 py-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">La Ceiba</p>
            <h1 className="mt-1 text-2xl font-extrabold text-foreground">{t('lotStock.hubTitle')}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t('lotStock.hubSubtitle')}</p>
          </div>
          <LanguageSwitcher />
        </div>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-20 rounded-2xl" />
            <Skeleton className="h-20 rounded-2xl" />
          </div>
        ) : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {!isLoading && !error && list.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">{t('lotStock.hubEmpty')}</p>
        ) : null}
        <div className="space-y-3">
          {list.map((project) => (
            <Link
              key={project.id}
              to={`/stock/${project.id}`}
              className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors duration-200 hover:border-primary/40 hover:bg-secondary/60"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-foreground">{project.title}</p>
                {project.location ? (
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {project.location}
                  </p>
                ) : null}
              </div>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                {t('lotStock.hubOpen')}
                <ChevronRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
