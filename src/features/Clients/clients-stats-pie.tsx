import { useMemo } from 'react';
import { Cell, Pie, PieChart } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { cn } from '@/lib/utils';

export type ClientsStatsPieSlice = {
  key: string;
  label: string;
  count: number;
  color: string;
};

type ClientsStatsPieProps = {
  slices: ClientsStatsPieSlice[];
  excludedKeys: ReadonlySet<string>;
  onToggleKey: (key: string) => void;
  emptyLabel: string;
};

export function ClientsStatsPie({
  slices,
  excludedKeys,
  onToggleKey,
  emptyLabel,
}: ClientsStatsPieProps) {
  const visible = useMemo(
    () => slices.filter((slice) => !excludedKeys.has(slice.key) && slice.count > 0),
    [slices, excludedKeys],
  );
  const totalVisible = useMemo(
    () => visible.reduce((sum, slice) => sum + slice.count, 0),
    [visible],
  );
  const chartConfig = useMemo(() => {
    const config: ChartConfig = {};
    for (const slice of slices) {
      config[slice.key] = { label: slice.label, color: slice.color };
    }
    return config;
  }, [slices]);
  const chartData = useMemo(
    () =>
      visible.map((slice) => ({
        key: slice.key,
        label: slice.label,
        value: slice.count,
        fill: slice.color,
      })),
    [visible],
  );

  if (slices.length === 0 || slices.every((s) => s.count === 0)) {
    return (
      <p className="text-sm text-muted-foreground text-center py-10">{emptyLabel}</p>
    );
  }

  return (
    <div className="space-y-4">
      {totalVisible === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-10">{emptyLabel}</p>
      ) : (
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[220px] w-full">
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  nameKey="label"
                  formatter={(value, _name, item) => {
                    const count = typeof value === 'number' ? value : Number(value);
                    const pct =
                      totalVisible > 0 ? Math.round((count / totalVisible) * 100) : 0;
                    return (
                      <div className="flex w-full items-center justify-between gap-4">
                        <span className="text-muted-foreground">
                          {String(item.payload?.label ?? '')}
                        </span>
                        <span className="font-medium tabular-nums text-foreground">
                          {count} ({pct}%)
                        </span>
                      </div>
                    );
                  }}
                />
              }
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="label"
              innerRadius={58}
              outerRadius={88}
              strokeWidth={2}
            >
              {chartData.map((entry) => (
                <Cell key={entry.key} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      )}
      <ul className="flex flex-col gap-1.5">
        {slices.map((slice) => {
          const excluded = excludedKeys.has(slice.key);
          const pct =
            !excluded && totalVisible > 0
              ? Math.round((slice.count / totalVisible) * 100)
              : 0;
          return (
            <li key={slice.key}>
              <button
                type="button"
                onClick={() => onToggleKey(slice.key)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-xl border border-border px-3 py-2 text-left text-sm transition-colors cursor-pointer',
                  excluded
                    ? 'bg-muted/40 text-muted-foreground opacity-60'
                    : 'bg-card text-foreground hover:bg-muted/50',
                )}
                aria-pressed={!excluded}
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: slice.color }}
                />
                <span className="flex-1 min-w-0 truncate">{slice.label}</span>
                <span className="tabular-nums text-xs text-muted-foreground shrink-0">
                  {slice.count}
                  {!excluded && totalVisible > 0 ? ` · ${pct}%` : ''}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
