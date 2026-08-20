import { useCallback, useRef, type ReactNode } from 'react';

export type ClientDetailTabSwipeProps = {
  tabValues: readonly string[];
  activeValue: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
  className?: string;
};

const SWIPE_THRESHOLD_PX = 48;

/**
 * Horizontal swipe on tab content to move between sibling tabs.
 */
export function ClientDetailTabSwipe({
  tabValues,
  activeValue,
  onValueChange,
  children,
  className,
}: ClientDetailTabSwipeProps) {
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const lockedAxis = useRef<'x' | 'y' | null>(null);

  const goRelative = useCallback(
    (delta: number) => {
      const index = tabValues.indexOf(activeValue);
      if (index < 0) {
        return;
      }
      const next = index + delta;
      if (next < 0 || next >= tabValues.length) {
        return;
      }
      onValueChange(tabValues[next]);
    },
    [activeValue, onValueChange, tabValues],
  );

  return (
    <div
      className={className}
      onTouchStart={(e) => {
        const touch = e.touches[0];
        startX.current = touch.clientX;
        startY.current = touch.clientY;
        lockedAxis.current = null;
      }}
      onTouchMove={(e) => {
        if (startX.current === null || startY.current === null) {
          return;
        }
        const touch = e.touches[0];
        const dx = touch.clientX - startX.current;
        const dy = touch.clientY - startY.current;
        if (lockedAxis.current === null) {
          if (Math.abs(dx) < 8 && Math.abs(dy) < 8) {
            return;
          }
          lockedAxis.current = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
        }
      }}
      onTouchEnd={(e) => {
        if (startX.current === null || lockedAxis.current !== 'x') {
          startX.current = null;
          startY.current = null;
          lockedAxis.current = null;
          return;
        }
        const touch = e.changedTouches[0];
        const dx = touch.clientX - startX.current;
        startX.current = null;
        startY.current = null;
        lockedAxis.current = null;
        if (Math.abs(dx) < SWIPE_THRESHOLD_PX) {
          return;
        }
        if (dx < 0) {
          goRelative(1);
        } else {
          goRelative(-1);
        }
      }}
      onTouchCancel={() => {
        startX.current = null;
        startY.current = null;
        lockedAxis.current = null;
      }}
    >
      {children}
    </div>
  );
}
