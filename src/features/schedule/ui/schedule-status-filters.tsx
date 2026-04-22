import { VENTOR_SCHEDULE_STATUS_FILTERS } from "@/features/schedule/lib/schedule.constants";
import type { VentorScheduleStatusApi } from "@/services/scheduleService";

interface ScheduleStatusFiltersProps {
  filter: VentorScheduleStatusApi | "all";
  onFilterChange: (value: VentorScheduleStatusApi | "all") => void;
}

const ScheduleStatusFilters = ({
  filter,
  onFilterChange,
}: ScheduleStatusFiltersProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {VENTOR_SCHEDULE_STATUS_FILTERS.map((sf) => (
        <button
          type="button"
          key={sf.value}
          onClick={() => onFilterChange(sf.value)}
          className={`text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
            filter === sf.value
              ? "gradient-commission text-primary-foreground"
              : "bg-secondary text-muted-foreground hover:bg-secondary/80"
          }`}
        >
          {sf.label}
        </button>
      ))}
    </div>
  );
};

export default ScheduleStatusFilters;
