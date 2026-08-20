import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TabsList } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export type ClientDetailTabsBarProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Horizontally scrollable tab list with chevrons and edge fades
 * so users can see when more tabs are available.
 */
export function ClientDetailTabsBar({
  children,
  className,
}: ClientDetailTabsBarProps) {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(maxScroll > 2 && el.scrollLeft < maxScroll - 2);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }
    updateScrollState();
    const onScroll = () => updateScrollState();
    el.addEventListener('scroll', onScroll, { passive: true });
    const resizeObserver = new ResizeObserver(() => updateScrollState());
    resizeObserver.observe(el);
    return () => {
      el.removeEventListener('scroll', onScroll);
      resizeObserver.disconnect();
    };
  }, [updateScrollState, children]);

  const scrollByAmount = (direction: -1 | 1) => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }
    el.scrollBy({ left: direction * Math.max(120, el.clientWidth * 0.55), behavior: 'smooth' });
  };

  return (
    <div className={cn('relative flex items-center gap-1', className)}>
      <button
        type="button"
        aria-label={t('clients.tabsScrollLeftAria')}
        className={cn(
          'shrink-0 h-8 w-8 rounded-md border border-border bg-background inline-flex items-center justify-center cursor-pointer transition-opacity',
          canScrollLeft ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
        onClick={() => scrollByAmount(-1)}
        tabIndex={canScrollLeft ? 0 : -1}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <div className="relative min-w-0 flex-1">
        {canScrollLeft ? (
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-background to-transparent" />
        ) : null}
        {canScrollRight ? (
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-background to-transparent" />
        ) : null}
        <div
          ref={scrollRef}
          className="overflow-x-auto scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <TabsList className="w-max min-w-full h-auto flex flex-nowrap justify-start gap-1 p-1">
            {children}
          </TabsList>
        </div>
      </div>
      <button
        type="button"
        aria-label={t('clients.tabsScrollRightAria')}
        className={cn(
          'shrink-0 h-8 w-8 rounded-md border border-border bg-background inline-flex items-center justify-center cursor-pointer transition-opacity',
          canScrollRight ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
        onClick={() => scrollByAmount(1)}
        tabIndex={canScrollRight ? 0 : -1}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
